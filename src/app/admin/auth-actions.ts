"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { verifyCredentials } from "@/lib/auth";
import { db } from "@/lib/db";
import { createSession, destroySession } from "@/lib/session";

const loginSchema = z.object({
  email: z.string().trim().min(1, "Email is required."),
  password: z.string().min(1, "Password is required."),
  // `formData.get` yields null when the field is absent — `.optional()` alone
  // would reject that.
  next: z.string().nullish(),
});

export type LoginState = { error?: string };

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next"),
  });

  if (!parsed.success) {
    return { error: "Please enter your email and password." };
  }

  const user = await verifyCredentials(parsed.data.email, parsed.data.password);
  if (!user) {
    // Deliberately vague — don't reveal which half was wrong.
    return { error: "Incorrect email or password." };
  }

  await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  await db.adminUser.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  // Only allow same-site relative paths, so `?next=` can't become an open redirect.
  const target = parsed.data.next;
  const safe = target && /^\/admin(\/|$)/.test(target) ? target : "/admin";

  redirect(safe);
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}
