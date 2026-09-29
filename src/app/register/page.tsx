"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (pin !== confirmPin) {
      setError("PINs do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, walletAddress, pin }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }
      router.push("/play");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white border border-orange-100 rounded-2xl p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🐿️</div>
          <h1 className="text-xl font-bold text-sqr-dark">Create Account</h1>
          <p className="text-sm text-sqr-brown/60 mt-1">Join the climb · Compete forever</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-sqr-brown mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-orange-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sqr-orange/40"
              placeholder="3–20 characters"
              required
              minLength={3}
              maxLength={20}
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-sqr-brown mb-1">
              EVM Wallet Address
            </label>
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="w-full border border-orange-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sqr-orange/40"
              placeholder="0x..."
              required
              autoComplete="off"
            />
            <p className="text-xs text-sqr-brown/50 mt-1">
              Paste only. No wallet connection. Used for future rewards.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-sqr-brown mb-1">PIN</label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full border border-orange-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sqr-orange/40"
              placeholder="4–12 digits"
              required
              minLength={4}
              maxLength={12}
              inputMode="numeric"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-sqr-brown mb-1">Confirm PIN</label>
            <input
              type="password"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              className="w-full border border-orange-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sqr-orange/40"
              placeholder="Repeat PIN"
              required
              minLength={4}
              maxLength={12}
              inputMode="numeric"
              autoComplete="new-password"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sqr-orange text-white font-bold py-3 rounded-xl hover:bg-orange-600 transition disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-sqr-brown/60 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-sqr-orange font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
