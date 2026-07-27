import type { Metadata } from "next";

import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Conversations" };
export const dynamic = "force-dynamic";

const formatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function ChatsPage() {
  const conversations = await db.chatConversation.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  return (
    <>
      <header>
        <h1 className="font-display text-3xl text-parchment-50">Conversations</h1>
        <p className="mt-2 text-sm text-basin-400">
          What visitors are asking the assistant — useful for finding content gaps.
        </p>
      </header>

      {conversations.length === 0 ? (
        <p className="mt-9 rounded-xl border border-dashed border-basin-700 px-5 py-14 text-center text-sm text-basin-500">
          No conversations yet.
        </p>
      ) : (
        <ul className="mt-9 flex flex-col gap-4">
          {conversations.map((conversation) => (
            <li
              key={conversation.id}
              className="rounded-xl border border-basin-700/70 bg-basin-900/60 p-5"
            >
              <div className="flex items-center justify-between gap-4 border-b border-basin-800 pb-3">
                <span className="font-mono text-xs text-basin-500">
                  {conversation.id.slice(-8)}
                </span>
                <time
                  dateTime={conversation.createdAt.toISOString()}
                  className="text-xs text-basin-500"
                >
                  {formatter.format(conversation.createdAt)}
                </time>
              </div>

              <div className="mt-4 flex flex-col gap-3">
                {conversation.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                      message.role === "user"
                        ? "self-end bg-brass-500/12 text-parchment-100"
                        : "self-start bg-basin-800/80 text-basin-200"
                    }`}
                  >
                    {message.content}
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
