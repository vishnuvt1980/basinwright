import "server-only";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

import { db } from "@/lib/db";
import { getSession, type SessionPayload } from "@/lib/session";

/// Verifies credentials. Returns null on any failure — never leaks which half was wrong.
export async function verifyCredentials(email: string, password: string) {
  const user = await db.adminUser.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  // Hash even when the user is missing, so timing doesn't reveal valid emails.
  const hash = user?.passwordHash ?? "$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidin";
  const ok = await bcrypt.compare(password, hash);

  if (!user || !ok) return null;
  return user;
}

/// Guard for admin pages and Server Actions.
/// Proxy alone is not enough — Server Actions POST to the page route and must
/// re-check authorization themselves.
export async function requireUser(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

export async function requireAdmin(): Promise<SessionPayload> {
  const session = await requireUser();
  if (session.role !== "ADMIN") redirect("/admin?error=forbidden");
  return session;
}
