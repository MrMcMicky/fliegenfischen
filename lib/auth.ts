import bcrypt from "bcrypt";
import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { env, isProd } from "@/lib/env";

export const SESSION_COOKIE = "fliegen_admin_session";

const parseCookieHeader = (header?: string | null) => {
  if (!header) return {};
  return header.split(";").reduce<Record<string, string>>((acc, part) => {
    const [key, ...rest] = part.trim().split("=");
    if (!key) return acc;
    try {
      acc[key] = decodeURIComponent(rest.join("="));
    } catch {
      acc[key] = rest.join("=");
    }
    return acc;
  }, {});
};

export const getSessionToken = async (request?: Request) => {
  if (request) {
    const cookieHeader = request.headers.get("cookie");
    const cookiesFromHeader = parseCookieHeader(cookieHeader);
    if (cookiesFromHeader[SESSION_COOKIE]) {
      return cookiesFromHeader[SESSION_COOKIE];
    }
  }
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value;
};

const hashToken = (token: string) =>
  crypto.createHmac("sha256", env.adminCookieSecret).update(token).digest("hex");

export const verifyPassword = (password: string, hash: string) =>
  bcrypt.compare(password, hash);

export const hashPassword = (password: string) => bcrypt.hash(password, 12);

export const createSession = async (adminUserId: string) => {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(
    Date.now() + env.sessionMaxAgeDays * 24 * 60 * 60 * 1000
  );

  await prisma.adminSession.create({
    data: {
      adminUserId,
      tokenHash,
      expiresAt,
    },
  });
  return { token, expiresAt };
};

export const deleteSessionByToken = async (token?: string | null) => {
  if (!token) return;
  const tokenHash = hashToken(token);
  await prisma.adminSession.deleteMany({ where: { tokenHash } });
};

export const clearSession = async (request?: Request) => {
  const token = await getSessionToken(request);
  if (token) {
    await deleteSessionByToken(token);
  }
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/admin",
    expires: new Date(0),
  });
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    expires: new Date(0),
  });
};

export const getAdminFromSession = async (request?: Request) => {
  const token = await getSessionToken(request);
  if (!token) return null;
  const tokenHash = hashToken(token);
  const session = await prisma.adminSession.findUnique({
    where: { tokenHash },
    include: { adminUser: true },
  });
  if (!session) return null;
  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.adminSession.delete({ where: { tokenHash } });
    return null;
  }
  if (!session.adminUser.isActive) return null;
  return session.adminUser;
};

export const requireAdmin = async (
  role?: "SUPER_ADMIN" | "ADMIN",
  request?: Request
) => {
  const admin = await getAdminFromSession(request);
  if (!admin) return null;
  if (role && admin.role !== role) return null;
  return admin;
};
