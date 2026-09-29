"use client";

import { useEffect, useState } from "react";

type Stats = {
  totalPlayers: number;
  totalRuns: number;
  validatedRuns: number;
  flaggedRuns: number;
  communityRecord: number;
  communityRecordHolder: string | null;
  recentRuns: Array<{
    id: string;
    height: number;
    status: string;
    username: string;
    createdAt: string;
  }>;
  topPlayers: Array<{ username: string; bestHeight: number }>;
};

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [authed, setAuthed] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [runs, setRuns] = useState<Array<Record<string, unknown>>>([]);
  const [filter, setFilter] = useState("FLAGGED");

  const loadStats = async (adminSecret: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/stats", {
        headers: { "x-admin-secret": adminSecret },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unauthorized");
        setAuthed(false);
        return;
      }
      setStats(data);
      setAuthed(true);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const loadRuns = async (adminSecret: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/runs?status=${status}`, {
        headers: { "x-admin-secret": adminSecret },
      });
      const data = await res.json();
      if (res.ok) setRuns(data.runs || []);
    } catch {
      /* ignore */
    }
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    loadStats(secret);
    loadRuns(secret, filter);
  };

  const moderateRun = async (runId: string, action: "VALIDATED" | "REJECTED") => {
    try {
      const res = await fetch("/api/admin/runs", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": secret,
        },
        body: JSON.stringify({ runId, status: action }),
      });
      if (res.ok) {
        loadRuns(secret, filter);
        loadStats(secret);
      }
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    if (authed) loadRuns(secret, filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, authed]);

  if (!authed) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <form onSubmit={handleAuth} className="max-w-sm w-full bg-white border border-orange-100 rounded-2xl p-8 shadow-sm">
          <h1 className="text-xl font-bold text-sqr-dark mb-4 text-center">Admin Access</h1>
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Admin secret"
            className="w-full border border-orange-200 rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-sqr-orange/40"
            required
          />
          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sqr-dark text-white font-bold py-3 rounded-xl hover:bg-black transition disabled:opacity-60"
          >
            {loading ? "..." : "Enter"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-sqr-dark mb-6">Admin Dashboard</h1>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Players", value: stats.totalPlayers },
            { label: "Total Runs", value: stats.totalRuns },
            { label: "Validated", value: stats.validatedRuns },
            { label: "Flagged", value: stats.flaggedRuns },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-orange-100 rounded-xl p-4 text-center">
              <div className="text-xs text-sqr-brown/50 uppercase">{s.label}</div>
              <div className="text-xl font-bold text-sqr-dark">{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {stats && (
        <div className="bg-white border border-orange-100 rounded-xl p-4 mb-8">
          <div className="text-sm text-sqr-brown/60">Community Record</div>
          <div className="text-2xl font-bold text-sqr-orange">
            {stats.communityRecord.toLocaleString()}m
            {stats.communityRecordHolder && (
              <span className="text-base font-normal text-sqr-brown ml-2">
                by {stats.communityRecordHolder}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="mb-4 flex gap-2 flex-wrap">
        {["FLAGGED", "PENDING", "VALIDATED", "REJECTED"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              filter === s
                ? "bg-sqr-orange text-white"
                : "bg-white border border-orange-100 text-sqr-brown"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="bg-white border border-orange-100 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-sqr-cream text-left text-xs uppercase text-sqr-brown/50">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Height</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {runs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sqr-brown/50">
                    No runs
                  </td>
                </tr>
              )}
              {runs.map((r) => (
                <tr key={String(r.id)} className="border-t border-orange-50">
                  <td className="px-4 py-3">{String(r.username || "-")}</td>
                  <td className="px-4 py-3 font-semibold text-sqr-orange">
                    {Number(r.height).toLocaleString()}m
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        r.status === "FLAGGED"
                          ? "bg-yellow-100 text-yellow-800"
                          : r.status === "REJECTED"
                          ? "bg-red-100 text-red-800"
                          : r.status === "VALIDATED"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {String(r.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-sqr-brown/60">
                    {r.createdAt ? new Date(String(r.createdAt)).toLocaleString() : "-"}
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    {(r.status === "FLAGGED" || r.status === "PENDING") && (
                      <>
                        <button
                          onClick={() => moderateRun(String(r.id), "VALIDATED")}
                          className="text-xs text-green-700 hover:underline"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => moderateRun(String(r.id), "REJECTED")}
                          className="text-xs text-red-600 hover:underline"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {stats?.topPlayers && stats.topPlayers.length > 0 && (
        <div className="mt-8">
          <h2 className="font-bold text-sqr-dark mb-3">Top Players</h2>
          <div className="bg-white border border-orange-100 rounded-xl divide-y divide-orange-50">
            {stats.topPlayers.map((p, i) => (
              <div key={p.username} className="flex justify-between px-4 py-2.5 text-sm">
                <span>
                  #{i + 1} {p.username}
                </span>
                <span className="font-semibold text-sqr-orange">
                  {p.bestHeight.toLocaleString()}m
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
