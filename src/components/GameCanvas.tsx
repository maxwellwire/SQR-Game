"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createGameLoop } from "@/game/engine";
import Link from "next/link";

type Props = {
  bestHeight: number;
  runId: string | null;
  onNeedAuth: () => void;
};

type EndStats = {
  height: number;
  acorns: number;
  goldenAcorns: number;
  duration: number;
  platformsLanded: number;
  enemiesHit: number;
  maxJumpHeight: number;
};

export default function GameCanvas({ bestHeight, runId, onNeedAuth }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<ReturnType<typeof createGameLoop> | null>(null);
  const [height, setHeight] = useState(0);
  const [acorns, setAcorns] = useState(0);
  const [best, setBest] = useState(bestHeight);
  const [gameOver, setGameOver] = useState(false);
  const [endStats, setEndStats] = useState<EndStats | null>(null);
  const [newBest, setNewBest] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);

  const handleGameOver = useCallback(
    async (stats: EndStats) => {
      setEndStats(stats);
      setGameOver(true);
      setHeight(stats.height);
      setAcorns(stats.acorns);

      if (!runId) return;

      setSubmitting(true);
      setSubmitError(null);
      try {
        const res = await fetch("/api/game/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            runId,
            height: stats.height,
            duration: stats.duration,
            acorns: stats.acorns,
            goldenAcorns: stats.goldenAcorns,
            platformsLanded: stats.platformsLanded,
            enemiesHit: stats.enemiesHit,
            maxJumpHeight: stats.maxJumpHeight,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setSubmitError(data.error || "Submit failed");
        } else {
          if (data.newBest) {
            setNewBest(true);
            setBest(data.bestHeight);
          }
        }
      } catch {
        setSubmitError("Network error");
      } finally {
        setSubmitting(false);
      }
    },
    [runId]
  );

  useEffect(() => {
    if (!canvasRef.current || gameOver) return;

    const game = createGameLoop(canvasRef.current, bestHeight, {
      onGameOver: handleGameOver,
      onHeightUpdate: (h) => {
        setHeight(h);
        const s = gameRef.current?.getStats();
        if (s) {
          setAcorns(s.acorns);
          setBest(s.bestHeight);
          setPaused(s.paused);
        }
      },
    });
    gameRef.current = game;

    return () => {
      game.destroy();
      gameRef.current = null;
    };
  }, [bestHeight, handleGameOver, gameOver]);

  const restart = () => {
    window.location.reload();
  };

  const shareOnX = () => {
    const h = endStats?.height ?? height;
    const text = `🐿️ I just climbed ${h.toLocaleString()}m in SQR CLIMB!\n\nCan you beat me?\n\n$SQR #SQR #SQRCLIMB`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  return (
    <div className="relative w-full h-full min-h-[100dvh] bg-[#A8DADC] flex flex-col">
      {/* HUD */}
      {!gameOver && (
        <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
          <div className="flex justify-between items-start p-3 sm:p-4">
            <div className="bg-black/50 backdrop-blur-sm rounded-xl px-3 py-2 text-white">
              <div className="text-[10px] uppercase tracking-wider opacity-70">Height</div>
              <div className="font-pixel text-sm sm:text-base text-sqr-gold">
                {height.toLocaleString()}m
              </div>
            </div>
            <div className="bg-black/50 backdrop-blur-sm rounded-xl px-3 py-2 text-white text-right">
              <div className="text-[10px] uppercase tracking-wider opacity-70">Best</div>
              <div className="font-pixel text-sm sm:text-base">{best.toLocaleString()}m</div>
            </div>
          </div>
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5 text-white flex items-center gap-2">
            <span>🌰</span>
            <span className="font-pixel text-xs">{acorns}</span>
          </div>
          {paused && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg font-pixel text-xs">
              PAUSED
            </div>
          )}
        </div>
      )}

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <canvas
          ref={canvasRef}
          id="game-canvas"
          className="w-full h-full"
          style={{ touchAction: "none" }}
        />
      </div>

      {/* Mobile controls */}
      {!gameOver && (
        <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-between px-6 sm:px-12 pointer-events-none">
          <button
            className="touch-btn pointer-events-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-black/40 backdrop-blur border-2 border-white/30 text-white text-3xl font-bold active:bg-black/60"
            onTouchStart={(e) => {
              e.preventDefault();
              gameRef.current?.setLeft(true);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              gameRef.current?.setLeft(false);
            }}
            onMouseDown={() => gameRef.current?.setLeft(true)}
            onMouseUp={() => gameRef.current?.setLeft(false)}
            onMouseLeave={() => gameRef.current?.setLeft(false)}
            aria-label="Move left"
          >
            ◀
          </button>
          <button
            className="touch-btn pointer-events-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-black/40 backdrop-blur border-2 border-white/30 text-white text-3xl font-bold active:bg-black/60"
            onTouchStart={(e) => {
              e.preventDefault();
              gameRef.current?.setRight(true);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              gameRef.current?.setRight(false);
            }}
            onMouseDown={() => gameRef.current?.setRight(true)}
            onMouseUp={() => gameRef.current?.setRight(false)}
            onMouseLeave={() => gameRef.current?.setRight(false)}
            aria-label="Move right"
          >
            ▶
          </button>
        </div>
      )}

      {/* Game Over overlay */}
      {gameOver && endStats && (
        <div className="absolute inset-0 z-30 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-sqr-cream rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
            <div className="text-4xl mb-2">🐿️</div>
            <h2 className="font-pixel text-sm text-sqr-brown mb-4">RUN OVER</h2>

            {newBest && (
              <div className="bg-sqr-gold/20 border border-sqr-gold rounded-xl px-4 py-2 mb-4">
                <div className="text-sqr-orange font-bold text-sm">🏆 NEW PERSONAL BEST!</div>
              </div>
            )}

            <div className="space-y-2 mb-6">
              <div>
                <div className="text-xs text-sqr-brown/60 uppercase">Height</div>
                <div className="font-pixel text-xl text-sqr-orange">
                  {endStats.height.toLocaleString()}m
                </div>
              </div>
              <div className="flex justify-center gap-8 text-sm">
                <div>
                  <div className="text-xs text-sqr-brown/60">Best</div>
                  <div className="font-semibold">{best.toLocaleString()}m</div>
                </div>
                <div>
                  <div className="text-xs text-sqr-brown/60">Acorns</div>
                  <div className="font-semibold">🌰 {endStats.acorns}</div>
                </div>
              </div>
            </div>

            {submitting && (
              <p className="text-xs text-sqr-brown/50 mb-3">Saving run...</p>
            )}
            {submitError && (
              <p className="text-xs text-red-600 mb-3">{submitError}</p>
            )}

            <div className="space-y-2">
              <button
                onClick={restart}
                className="w-full bg-sqr-orange text-white font-bold py-3 rounded-xl hover:bg-orange-600 transition"
              >
                PLAY AGAIN
              </button>
              <button
                onClick={shareOnX}
                className="w-full bg-[#1DA1F2] text-white font-semibold py-3 rounded-xl hover:bg-sky-500 transition"
              >
                SHARE ON X
              </button>
              <div className="flex gap-2">
                <Link
                  href="/leaderboard"
                  className="flex-1 border border-sqr-brown/30 text-sqr-brown font-semibold py-2.5 rounded-xl hover:bg-orange-50 transition text-center text-sm"
                >
                  LEADERBOARD
                </Link>
                <Link
                  href="/"
                  className="flex-1 border border-sqr-brown/30 text-sqr-brown font-semibold py-2.5 rounded-xl hover:bg-orange-50 transition text-center text-sm"
                >
                  HOME
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
