"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GameCanvas from "@/components/GameCanvas";
import Link from "next/link";

type User = {
  id: string;
  username: string;
  bestHeight: number;
} | null;

export default function PlayPage() {
  const router = useRouter();
  const [user, setUser] = useState<User>(null);
  const [runId, setRunId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        setUser(d.user);
        if (!d.user) {
          setLoading(false);
        }
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const startRun = async () => {
    if (!user) {
      router.push("/login?next=/play");
      return;
    }
    setStarting(true);
    setError(null);
    try {
      const res = await fetch("/api/game/start", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to start run");
        setStarting(false);
        return;
      }
      setRunId(data.runId);
    } catch {
      setError("Network error");
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-sqr-brown animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-orange-100 rounded-2xl p-8 text-center shadow-sm">
          <div className="text-5xl mb-4">🐿️</div>
          <h1 className="text-xl font-bold text-sqr-dark mb-2">Login Required</h1>
          <p className="text-sm text-sqr-brown/70 mb-6">
            Create an account or log in to play SQR Climb and compete on the leaderboard.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/register"
              className="bg-sqr-orange text-white font-bold py-3 rounded-xl hover:bg-orange-600 transition"
            >
              Create Account
            </Link>
            <Link
              href="/login?next=/play"
              className="border border-sqr-brown/20 text-sqr-brown font-semibold py-3 rounded-xl hover:bg-orange-50 transition"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!runId) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-orange-100 rounded-2xl p-8 text-center shadow-sm">
          <div className="text-5xl mb-4">🐿️</div>
          <h1 className="text-xl font-bold text-sqr-dark mb-1">Ready to Climb?</h1>
          <p className="text-sm text-sqr-brown/70 mb-1">
            Playing as <span className="font-semibold text-sqr-orange">{user.username}</span>
          </p>
          <p className="text-xs text-sqr-brown/50 mb-6">
            Best: {user.bestHeight.toLocaleString()}m
          </p>

          <div className="bg-sqr-cream rounded-xl p-4 mb-6 text-left text-sm text-sqr-brown/80 space-y-1">
            <p><strong>Desktop:</strong> ← → or A D to move</p>
            <p><strong>Mobile:</strong> Tap left / right buttons</p>
            <p>Squirrel auto-jumps. Reach the highest height!</p>
          </div>

          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

          <button
            onClick={startRun}
            disabled={starting}
            className="w-full bg-sqr-orange text-white font-bold py-3.5 rounded-xl hover:bg-orange-600 transition disabled:opacity-60"
          >
            {starting ? "Starting..." : "START CLIMB"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 bg-[#A8DADC]">
      <GameCanvas
        bestHeight={user.bestHeight}
        runId={runId}
        onNeedAuth={() => router.push("/login?next=/play")}
      />
    </div>
  );
}
