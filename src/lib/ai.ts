import "server-only";

/// Thin client for any OpenAI-compatible chat completions endpoint.
/// Configured entirely through .env so the provider can be swapped without
/// touching code — defaults target Together AI.

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export type AiConfig = {
  apiKey: string;
  baseUrl: string;
  model: string;
  maxTokens: number;
  temperature: number;
};

export class AiNotConfiguredError extends Error {
  constructor() {
    super("AI provider is not configured.");
    this.name = "AiNotConfiguredError";
  }
}

export function isAiConfigured() {
  return Boolean(process.env.AI_API_KEY?.trim());
}

export function getAiConfig(): AiConfig {
  const apiKey = process.env.AI_API_KEY?.trim();
  if (!apiKey) throw new AiNotConfiguredError();

  return {
    apiKey,
    baseUrl: (process.env.AI_BASE_URL || "https://api.together.xyz/v1").replace(/\/$/, ""),
    model: process.env.AI_MODEL || "meta-llama/Llama-3.3-70B-Instruct-Turbo",
    maxTokens: Number(process.env.AI_MAX_TOKENS ?? 800),
    temperature: Number(process.env.AI_TEMPERATURE ?? 0.4),
  };
}

/// Streams assistant text deltas. Yields plain strings, so the caller decides
/// the wire format.
export async function* streamChat(
  messages: ChatMessage[],
  signal?: AbortSignal,
): AsyncGenerator<string> {
  const config = getAiConfig();

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      stream: true,
    }),
  });

  if (!response.ok || !response.body) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `AI provider returned ${response.status}. ${detail.slice(0, 300)}`,
    );
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // SSE frames are separated by a blank line; keep the trailing partial.
      const frames = buffer.split("\n\n");
      buffer = frames.pop() ?? "";

      for (const frame of frames) {
        for (const line of frame.split("\n")) {
          if (!line.startsWith("data:")) continue;

          const payload = line.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;

          try {
            const json = JSON.parse(payload);
            const delta = json.choices?.[0]?.delta?.content;
            if (typeof delta === "string" && delta) yield delta;
          } catch {
            // Skip malformed frames rather than killing the stream.
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
