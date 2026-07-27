"use server";

import { z } from "zod";

import { db } from "@/lib/db";
import { parseDemoConfig, type DemoConfig } from "@/lib/demo-config";

const leadSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(120),
  email: z.email("Please enter a valid work email.").max(200),
  company: z.string().trim().max(160).optional(),
  role: z.string().trim().max(160).optional(),
  interest: z.string().trim().max(160).optional(),
  message: z.string().trim().max(4000).optional(),
});

export type LeadState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

/**
 * The console configuration the visitor built, if they built one.
 *
 * It arrives as a JSON string in a hidden field, which means it is entirely
 * visitor-controlled — so it goes through the same validator the browser used,
 * against the same catalogue. Anything that does not survive that is dropped
 * silently: an enquiry must never fail because of an attachment to it.
 */
function readDemoConfig(raw: FormDataEntryValue | null): DemoConfig | null {
  if (typeof raw !== "string" || !raw || raw.length > 8000) return null;
  try {
    return parseDemoConfig(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function submitLead(
  _prev: LeadState,
  formData: FormData,
): Promise<LeadState> {
  // Honeypot — bots fill hidden fields, humans never see this one.
  if (formData.get("website")) {
    return { status: "success", message: "Thanks — we'll be in touch shortly." };
  }

  const parsed = leadSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    company: formData.get("company") || undefined,
    role: formData.get("role") || undefined,
    interest: formData.get("interest") || undefined,
    message: formData.get("message") || undefined,
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      fieldErrors[key] ??= issue.message;
    }
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors };
  }

  const demoConfig = readDemoConfig(formData.get("demoConfig"));

  try {
    await db.lead.create({
      data: {
        ...parsed.data,
        industry: demoConfig?.industry ?? null,
        demoConfig: demoConfig ?? undefined,
      },
    });
  } catch {
    return {
      status: "error",
      message: "Something went wrong on our end. Please try again.",
    };
  }

  return {
    status: "success",
    message: "Thank you — an AI architect will be in touch within one business day.",
  };
}
