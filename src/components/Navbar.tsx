"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type User = {
  id: string;
  username: string;
  bestHeight: number;
} | null;

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [pathname]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/";
  };

  const links = [
    { href: "/", label: "HOME" },
    { href: "/play", label: "PLAY" },
    { href: "/leaderboard", label: "LEADERBOARD" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-sqr-cream/95 backdrop-blur border-b border-orange-200/60">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="text-2xl">🐿️</span>
          <span className="text-sqr-orange">SQR</span>
          <span className="hidden sm:inline text-sqr-brown text-sm font-normal">CLIMB</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm font-semibold tracking-wide transition ${
                pathname === l.href
                  ? "text-sqr-orange"
                  : "text-sqr-brown/70 hover:text-sqr-orange"
              }`}
            >
              {l.label}
            </Link>
          ))}

          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-sqr-brown">
                    {user.username} · <span className="text-sqr-orange">{user.bestHeight.toLocaleString()}m</span>
                  </span>
                  <button
                    onClick={logout}
                    className="text-xs px-3 py-1.5 rounded-full border border-sqr-brown/30 text-sqr-brown hover:bg-orange-50"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="text-sm font-medium text-sqr-brown hover:text-sqr-orange"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="text-sm font-semibold bg-sqr-orange text-white px-4 py-1.5 rounded-full hover:bg-orange-600 transition"
                  >
                    Play Now
                  </Link>
                </div>
              )}
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-sqr-brown"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen ? (
              <path d="M6 6l12 12M6 18L18 6" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-orange-100 bg-sqr-cream px-4 py-3 space-y-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className={`block py-2 font-semibold ${
                pathname === l.href ? "text-sqr-orange" : "text-sqr-brown"
              }`}
            >
              {l.label}
            </Link>
          ))}
          {user ? (
            <>
              <div className="py-2 text-sm text-sqr-brown">
                {user.username} · {user.bestHeight.toLocaleString()}m
              </div>
              <button onClick={logout} className="block w-full text-left py-2 text-sqr-brown">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)} className="block py-2 text-sqr-brown">
                Login
              </Link>
              <Link
                href="/register"
                onClick={() => setMenuOpen(false)}
                className="block py-2 font-semibold text-sqr-orange"
              >
                Play Now
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
