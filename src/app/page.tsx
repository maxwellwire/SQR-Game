import Link from "next/link";

export default function HomePage() {
  return (
    <div className="overflow-x-hidden">
      {/* HERO */}
      <section className="relative min-h-[85vh] flex items-center justify-center px-4 py-16 bg-gradient-to-b from-sqr-sky/40 via-sqr-cream to-sqr-cream">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-[10%] text-6xl opacity-20 animate-bounce" style={{ animationDuration: "3s" }}>🐿️</div>
          <div className="absolute top-40 right-[15%] text-4xl opacity-15 animate-bounce" style={{ animationDuration: "4s", animationDelay: "1s" }}>🌰</div>
          <div className="absolute bottom-32 left-[20%] text-5xl opacity-10 animate-bounce" style={{ animationDuration: "5s", animationDelay: "0.5s" }}>🌲</div>
        </div>

        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur border border-orange-200 rounded-full px-4 py-1.5 text-sm font-semibold text-sqr-orange mb-6 shadow-sm">
            <span>$SQR</span>
            <span className="text-sqr-brown/40">·</span>
            <span className="text-sqr-brown">SQUIRREL</span>
          </div>

          <div className="text-7xl sm:text-8xl mb-4 drop-shadow-sm">🐿️</div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-sqr-dark mb-3">
            SQR <span className="text-sqr-orange">CLIMB</span>
          </h1>
          <p className="text-lg sm:text-xl text-sqr-brown/80 mb-2 font-medium">
            How high can you go?
          </p>
          <p className="text-sm sm:text-base text-sqr-brown/60 max-w-md mx-auto mb-8">
            An original vertical pixel-art platformer for the SQR community.
            Climb endless forests. Set permanent records. No seasons. No resets.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link
              href="/play"
              className="w-full sm:w-auto bg-sqr-orange hover:bg-orange-600 text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-lg shadow-orange-500/25 transition transform hover:scale-[1.02] active:scale-[0.98]"
            >
              🎮 PLAY SQR CLIMB
            </Link>
            <Link
              href="/leaderboard"
              className="w-full sm:w-auto border-2 border-sqr-brown/20 hover:border-sqr-orange text-sqr-brown font-semibold px-8 py-4 rounded-2xl transition hover:bg-orange-50"
            >
              🏆 LEADERBOARD
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURE */}
      <section className="py-16 px-4 bg-white/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-sqr-dark mb-3">
            Climb. Compete. Forever.
          </h2>
          <p className="text-center text-sqr-brown/70 max-w-xl mx-auto mb-12">
            Height is the only score that matters. Beat your personal best.
            Challenge the community record. One permanent leaderboard.
          </p>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: "📈",
                title: "HIGHEST CLIMB",
                desc: "Reach the highest height possible. The higher you go, the higher you rank.",
              },
              {
                icon: "⭐",
                title: "PERSONAL BEST",
                desc: "Every run tries to beat your own record. Track progress across all your climbs.",
              },
              {
                icon: "👑",
                title: "COMMUNITY RECORD",
                desc: "One all-time record. No weekly resets. No seasons. Just pure competition.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-sqr-cream border border-orange-100 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition"
              >
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-sqr-orange mb-2">{item.title}</h3>
                <p className="text-sm text-sqr-brown/70">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-sqr-dark mb-12">
            How It Works
          </h2>
          <div className="space-y-6">
            {[
              { step: "1", title: "Create Account", desc: "Pick a username, paste your EVM wallet address, set a PIN. No wallet connection required." },
              { step: "2", title: "Play SQR Climb", desc: "Control the squirrel left/right. Auto-jump platforms. Climb the endless forest." },
              { step: "3", title: "Set Your Record", desc: "Reach new heights. Collect acorns. Survive hazards. Submit validated runs." },
              { step: "4", title: "Compete Forever", desc: "Climb the permanent leaderboard. Challenge friends. Own the community record." },
            ].map((item) => (
              <div key={item.step} className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-sqr-orange text-white font-bold flex items-center justify-center">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-bold text-sqr-dark">{item.title}</h3>
                  <p className="text-sm text-sqr-brown/70 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/register"
              className="inline-block bg-sqr-orange hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-xl transition"
            >
              Create Account & Play
            </Link>
          </div>
        </div>
      </section>

      {/* LEADERBOARD PREVIEW */}
      <section className="py-16 px-4 bg-white/50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-sqr-dark mb-3">
            Community Leaderboard
          </h2>
          <p className="text-sqr-brown/70 mb-8">
            Permanent all-time rankings. Height is king.
          </p>
          <div className="bg-sqr-cream border border-orange-100 rounded-2xl p-6 shadow-sm mb-6">
            <div className="flex justify-between text-xs uppercase tracking-wider text-sqr-brown/50 mb-3 px-2">
              <span>Rank</span>
              <span>Player</span>
              <span>Height</span>
            </div>
            <div className="space-y-2 text-sm text-sqr-brown/60">
              <p className="py-6 text-center">
                Be the first to set a record.
                <br />
                <Link href="/play" className="text-sqr-orange font-semibold hover:underline">
                  Start climbing →
                </Link>
              </p>
            </div>
          </div>
          <Link
            href="/leaderboard"
            className="inline-block border-2 border-sqr-orange text-sqr-orange font-semibold px-6 py-2.5 rounded-xl hover:bg-sqr-orange hover:text-white transition"
          >
            VIEW FULL LEADERBOARD
          </Link>
        </div>
      </section>

      {/* COMMUNITY */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-sqr-dark mb-3">
            Join the Community
          </h2>
          <p className="text-sqr-brown/70 mb-8">
            SQR is community-driven. Climb together. Share your records.
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-sqr-dark text-white px-6 py-3 rounded-xl font-semibold hover:bg-black transition"
            >
              Follow on X
            </a>
            <Link
              href="/play"
              className="bg-sqr-orange text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition"
            >
              Play Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
