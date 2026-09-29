import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "./prisma";
import { SESSION_COOKIE, SESSION_MAX_AGE } from "./constants";

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set and at least 32 characters");
  }
  return new TextEncoder().encode(secret);
}

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 12);
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}

export async function createSession(userId: string): Promise<string> {
  const token = uuidv4() + "-" + uuidv4();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);

  await prisma.session.create({
    data: { userId, token, expiresAt },
  });

  const jwt = await new SignJWT({ sub: userId, sid: token })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return token;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const jwt = cookieStore.get(SESSION_COOKIE)?.value;

  if (jwt) {
    try {
      const { payload } = await jwtVerify(jwt, getSecret());
      const sid = payload.sid as string;
      if (sid) {
        await prisma.session.deleteMany({ where: { token: sid } });
      }
    } catch {
      // ignore invalid token
    }
  }

  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const jwt = cookieStore.get(SESSION_COOKIE)?.value;
  if (!jwt) return null;

  try {
    const { payload } = await jwtVerify(jwt, getSecret());
    const userId = payload.sub as string;
    const sid = payload.sid as string;
    if (!userId || !sid) return null;

    const session = await prisma.session.findUnique({
      where: { token: sid },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            walletAddress: true,
            bestHeight: true,
            status: true,
            isAdmin: true,
            createdAt: true,
          },
        },
      },
    });

    if (!session || session.expiresAt < new Date()) {
      if (session) {
        await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
      }
      return null;
    }

    if (session.user.status === "SUSPENDED") return null;

    return session.user;
  } catch {
    return null;
  }
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || !user.isAdmin) throw new Error("FORBIDDEN");
  return user;
}

export function isAdminSecretValid(secret: string | null): boolean {
  const expected = process.env.ADMIN_SECRET;
  if (!expected || !secret) return false;
  return secret === expected;
}
