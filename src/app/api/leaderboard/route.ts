import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { LEADERBOARD_PAGE_SIZE } from "@/lib/constants";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, parseInt(searchParams.get("limit") || String(LEADERBOARD_PAGE_SIZE), 10));
    const skip = (page - 1) * limit;

    const [players, total, communityRecord, totalRuns] = await Promise.all([
      prisma.user.findMany({
        where: { status: "ACTIVE", bestHeight: { gt: 0 } },
        orderBy: { bestHeight: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          username: true,
          bestHeight: true,
        },
      }),
      prisma.user.count({
        where: { status: "ACTIVE", bestHeight: { gt: 0 } },
      }),
      prisma.user.findFirst({
        where: { status: "ACTIVE", bestHeight: { gt: 0 } },
        orderBy: { bestHeight: "desc" },
        select: { bestHeight: true, username: true },
      }),
      prisma.gameRun.count({ where: { status: "VALIDATED" } }),
    ]);

    const entries = players.map((p, i) => ({
      rank: skip + i + 1,
      username: p.username,
      height: p.bestHeight,
    }));

    let yourPosition: { rank: number; username: string; height: number } | null = null;
    const currentUser = await getCurrentUser();
    if (currentUser && currentUser.bestHeight > 0) {
      const betterCount = await prisma.user.count({
        where: {
          status: "ACTIVE",
          bestHeight: { gt: currentUser.bestHeight },
        },
      });
      yourPosition = {
        rank: betterCount + 1,
        username: currentUser.username,
        height: currentUser.bestHeight,
      };
    }

    const totalPlayers = await prisma.user.count({ where: { status: "ACTIVE" } });

    return NextResponse.json({
      entries,
      page,
      totalPages: Math.ceil(total / limit),
      total,
      communityRecord: communityRecord?.bestHeight ?? 0,
      communityRecordHolder: communityRecord?.username ?? null,
      totalPlayers,
      totalRuns,
      yourPosition,
    });
  } catch (err) {
    console.error("Leaderboard error:", err);
    return NextResponse.json({ error: "Failed to load leaderboard" }, { status: 500 });
  }
}
