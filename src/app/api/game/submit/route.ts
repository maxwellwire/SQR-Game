import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { gameSubmitSchema } from "@/lib/validation";
import { validateRun } from "@/lib/anticheat";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Login required" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = gameSubmitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid submission" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const existing = await prisma.gameRun.findUnique({
      where: { id: data.runId },
    });

    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ error: "Invalid run" }, { status: 400 });
    }

    // Prevent double submission of already finalized runs
    if (existing.status !== "PENDING" || existing.height > 0) {
      return NextResponse.json({ error: "Run already submitted" }, { status: 409 });
    }

    const endedAt = new Date();
    const startedAt = existing.startedAt;

    const validation = validateRun({
      height: data.height,
      duration: data.duration,
      acorns: data.acorns,
      goldenAcorns: data.goldenAcorns,
      platformsLanded: data.platformsLanded,
      previousBest: user.bestHeight,
      startedAt,
      endedAt,
    });

    const updated = await prisma.gameRun.update({
      where: { id: data.runId },
      data: {
        height: data.height,
        duration: data.duration,
        acorns: data.acorns,
        goldenAcorns: data.goldenAcorns ?? 0,
        platformsLanded: data.platformsLanded,
        enemiesHit: data.enemiesHit,
        maxJumpHeight: data.maxJumpHeight,
        clientSeed: data.clientSeed,
        metadata: data.metadata ?? undefined,
        endedAt,
        status: validation.status,
        validationReason: validation.reason,
      },
    });

    let newBest = false;
    let bestHeight = user.bestHeight;

    // Only update personal best for validated runs
    if (validation.status === "VALIDATED" && data.height > user.bestHeight) {
      await prisma.user.update({
        where: { id: user.id },
        data: { bestHeight: data.height },
      });
      newBest = true;
      bestHeight = data.height;
    }

    return NextResponse.json({
      run: {
        id: updated.id,
        height: updated.height,
        acorns: updated.acorns,
        status: updated.status,
        validationReason: updated.validationReason,
      },
      newBest,
      bestHeight,
    });
  } catch (err) {
    console.error("Submit run error:", err);
    return NextResponse.json({ error: "Failed to submit run" }, { status: 500 });
  }
}
