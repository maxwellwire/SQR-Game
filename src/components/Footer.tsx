import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-sqr-dark text-white/80 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col sm:flex-row justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 text-xl font-bold text-white mb-2">
              <span>🐿️</span> SQR
            </div>
            <p className="text-sm text-white/60 max-w-xs">
              Community-driven. Climb higher. Compete forever.
            </p>
            <p className="text-xs text-white/40 mt-3">$SQR · How high can you go?</p>
          </div>

          <div className="flex gap-12">
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Play</h4>
              <div className="space-y-2 text-sm">
                <Link href="/play" className="block hover:text-sqr-orange transition">
                  SQR Climb
                </Link>
                <Link href="/leaderboard" className="block hover:text-sqr-orange transition">
                  Leaderboard
                </Link>
                <Link href="/register" className="block hover:text-sqr-orange transition">
                  Create Account
                </Link>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Community</h4>
              <div className="space-y-2 text-sm">
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:text-sqr-orange transition"
                >
                  X / Twitter
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 text-xs text-white/40 flex flex-col sm:flex-row justify-between gap-2">
          <span>© {new Date().getFullYear()} SQR Community. Not financial advice.</span>
          <span>Play for fun. Climb for glory.</span>
        </div>
      </div>
    </footer>
  );
}
