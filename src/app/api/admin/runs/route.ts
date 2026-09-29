import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAdminSecretValid } from "@/lib/auth";

async function authorize(req: NextRequest) {
  const user = await getCurrentUser();
  if (user?.isAdmin) return true;
  return isAdminSecretValid(req.headers.get("x-admin-secret"));
}

export async function GET(req: NextRequest) {
  try {
    if (!(await authorize(req))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = 30;
    const skip = (page - 1) * limit;

    const where = status ? { status: status as "PENDING" | "VALIDATED" | "FLAGGED" | "REJECTED" } : {};

    const [runs, total] = await Promise.all([
      prisma.gameRun.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: { user: { select: { username: true, walletAddress: true } } },
      }),
      prisma.gameRun.count({ where }),
    ]);

    return NextResponse.json({ runs, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!(await authorize(req))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { runId, status, reason } = body as {
      runId: string;
      status: "VALIDATED" | "FLAGGED" | "REJECTED";
      reason?: string;
    };

    if (!runId || !["VALIDATED", "FLAGGED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const run = await prisma.gameRun.update({
      where: { id: runId },
      data: { status, validationReason: reason },
      include: { user: true },
    });

    // If validating and higher than best, update best
    if (status === "VALIDATED" && run.height > run.user.bestHeight) {
      await prisma.user.update({
        where: { id: run.userId },
        data: { bestHeight: run.height },
      });
    }

    // If rejecting a previously validated high score, recompute best from remaining validated runs
    if (status === "REJECTED") {
      const best = await prisma.gameRun.findFirst({
        where: { userId: run.userId, status: "VALIDATED" },
        orderBy: { height: "desc" },
      });
      await prisma.user.update({
        where: { id: run.userId },
        data: { bestHeight: best?.height ?? 0 },
      });
    }

    return NextResponse.json({ run });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
