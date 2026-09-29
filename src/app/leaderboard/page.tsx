"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Entry = { rank: number; username: string; height: number };
type LbData = {
  entries: Entry[];
  page: number;
  totalPages: number;
  total: number;
  communityRecord: number;
  communityRecordHolder: string | null;
  totalPlayers: number;
  totalRuns: number;
  yourPosition: Entry | null;
};

export default function LeaderboardPage() {
  const [data, setData] = useState<LbData | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leaderboard?page=${page}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-sqr-dark mb-2">
          🏆 Leaderboard
        </h1>
        <p className="text-sqr-brown/70 text-sm">
          Permanent all-time rankings · Height is everything
        </p>
      </div>

      {data && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-white border border-orange-100 rounded-xl p-4 text-center">
            <div className="text-xs text-sqr-brown/50 uppercase">Record</div>
            <div className="font-bold text-sqr-orange text-lg">
              {data.communityRecord.toLocaleString()}m
            </div>
            {data.communityRecordHolder && (
              <div className="text-xs text-sqr-brown/60 mt-0.5">{data.communityRecordHolder}</div>
            )}
          </div>
          <div className="bg-white border border-orange-100 rounded-xl p-4 text-center">
            <div className="text-xs text-sqr-brown/50 uppercase">Players</div>
            <div className="font-bold text-sqr-dark text-lg">{data.totalPlayers}</div>
          </div>
          <div className="bg-white border border-orange-100 rounded-xl p-4 text-center">
            <div className="text-xs text-sqr-brown/50 uppercase">Runs</div>
            <div className="font-bold text-sqr-dark text-lg">{data.totalRuns}</div>
          </div>
        </div>
      )}

      {data?.yourPosition && (
        <div className="bg-sqr-orange/10 border border-sqr-orange/30 rounded-xl p-4 mb-6 flex justify-between items-center">
          <div>
            <div className="text-xs text-sqr-orange font-semibold uppercase">Your Position</div>
            <div className="font-bold text-sqr-dark">
              #{data.yourPosition.rank} · {data.yourPosition.username}
            </div>
          </div>
          <div className="font-pixel text-sm text-sqr-orange">
            {data.yourPosition.height.toLocaleString()}m
          </div>
        </div>
      )}

      <div className="bg-white border border-orange-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-sqr-cream text-xs uppercase tracking-wider text-sqr-brown/50 font-semibold">
          <div className="col-span-2">#</div>
          <div className="col-span-6">Player</div>
          <div className="col-span-4 text-right">Height</div>
        </div>

        {loading && (
          <div className="p-10 text-center text-sqr-brown/50 animate-pulse">Loading...</div>
        )}
        {error && (
          <div className="p-10 text-center text-red-600">{error}</div>
        )}
        {!loading && !error && data && data.entries.length === 0 && (
          <div className="p-10 text-center text-sqr-brown/60">
            <p className="mb-3">No climbs yet.</p>
            <Link href="/play" className="text-sqr-orange font-semibold hover:underline">
              Be the first →
            </Link>
          </div>
        )}
        {!loading && data && data.entries.map((e) => (
          <div
            key={e.rank}
            className={`grid grid-cols-12 gap-2 px-4 py-3 border-t border-orange-50 items-center ${
              e.rank <= 3 ? "bg-sqr-gold/5" : ""
            }`}
          >
            <div className="col-span-2 font-bold text-sqr-brown">
              {e.rank === 1 ? "🥇" : e.rank === 2 ? "🥈" : e.rank === 3 ? "🥉" : e.rank}
            </div>
            <div className="col-span-6 font-medium text-sqr-dark truncate">{e.username}</div>
            <div className="col-span-4 text-right font-semibold text-sqr-orange">
              {e.height.toLocaleString()}m
            </div>
          </div>
        ))}
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-3 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-4 py-2 rounded-lg border border-sqr-brown/20 text-sm font-medium disabled:opacity-40 hover:bg-orange-50"
          >
            Prev
          </button>
          <span className="px-4 py-2 text-sm text-sqr-brown/60">
            {page} / {data.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page >= data.totalPages}
            className="px-4 py-2 rounded-lg border border-sqr-brown/20 text-sm font-medium disabled:opacity-40 hover:bg-orange-50"
          >
            Next
          </button>
        </div>
      )}

      <div className="text-center mt-10">
        <Link
          href="/play"
          className="inline-block bg-sqr-orange text-white font-bold px-8 py-3 rounded-xl hover:bg-orange-600 transition"
        >
          PLAY SQR CLIMB
        </Link>
      </div>
    </div>
  );
}
