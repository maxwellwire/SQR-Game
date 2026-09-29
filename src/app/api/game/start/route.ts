import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Login required" }, { status: 401 });
    }

    const runId = uuidv4();
    const startedAt = new Date();

    // Create a pending run placeholder
    await prisma.gameRun.create({
      data: {
        id: runId,
        userId: user.id,
        height: 0,
        duration: 0,
        acorns: 0,
        startedAt,
        endedAt: startedAt,
        status: "PENDING",
        clientSeed: uuidv4().slice(0, 8),
      },
    });

    return NextResponse.json({
      runId,
      startedAt: startedAt.toISOString(),
      bestHeight: user.bestHeight,
    });
  } catch (err) {
    console.error("Start run error:", err);
    return NextResponse.json({ error: "Failed to start run" }, { status: 500 });
  }
}
