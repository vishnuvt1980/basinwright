"use server";

import { z } from "zod";

import { db } from "@/lib/db";

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

  try {
    await db.lead.create({ data: parsed.data });
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
