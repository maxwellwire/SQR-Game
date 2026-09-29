import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAdminSecretValid } from "@/lib/auth";

async function authorize(req: NextRequest) {
  const user = await getCurrentUser();
  if (user?.isAdmin) return true;
  const secret = req.headers.get("x-admin-secret");
  return isAdminSecretValid(secret);
}

export async function GET(req: NextRequest) {
  try {
    if (!(await authorize(req))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [
      totalPlayers,
      totalRuns,
      validatedRuns,
      flaggedRuns,
      communityRecord,
      recentRuns,
      topPlayers,
      pendingRewards,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.gameRun.count(),
      prisma.gameRun.count({ where: { status: "VALIDATED" } }),
      prisma.gameRun.count({ where: { status: "FLAGGED" } }),
      prisma.user.findFirst({
        where: { bestHeight: { gt: 0 } },
        orderBy: { bestHeight: "desc" },
        select: { username: true, bestHeight: true, walletAddress: true },
      }),
      prisma.gameRun.findMany({
        take: 20,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { username: true, walletAddress: true } } },
      }),
      prisma.user.findMany({
        where: { bestHeight: { gt: 0 } },
        orderBy: { bestHeight: "desc" },
        take: 20,
        select: {
          id: true,
          username: true,
          bestHeight: true,
          walletAddress: true,
          status: true,
        },
      }),
      prisma.reward.findMany({
        where: { status: "PENDING" },
        include: { user: { select: { username: true } } },
        orderBy: { rank: "asc" },
      }),
    ]);

    return NextResponse.json({
      totalPlayers,
      totalRuns,
      validatedRuns,
      flaggedRuns,
      communityRecord,
      recentRuns,
      topPlayers,
      pendingRewards,
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
