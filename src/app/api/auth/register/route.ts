import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerSchema, normalizeWallet } from "@/lib/validation";
import { createSession, hashPin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { username, pin } = parsed.data;
    const walletAddress = normalizeWallet(parsed.data.walletAddress);

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: { equals: username, mode: "insensitive" } },
          { walletAddress },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.username.toLowerCase() === username.toLowerCase()) {
        return NextResponse.json({ error: "Username already taken" }, { status: 409 });
      }
      return NextResponse.json({ error: "Wallet address already registered" }, { status: 409 });
    }

    const pinHash = await hashPin(pin);

    const user = await prisma.user.create({
      data: {
        username,
        walletAddress,
        pinHash,
      },
      select: {
        id: true,
        username: true,
        walletAddress: true,
        bestHeight: true,
        createdAt: true,
      },
    });

    await createSession(user.id);

    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
