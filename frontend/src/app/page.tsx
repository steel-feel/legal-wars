"use client";

import { usePrivy } from "@privy-io/react-auth";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { LoginView } from "@/components/LoginView";
import { NotificationBell } from "@/components/NotificationBell";
import { GameCard } from "@/components/GameCard";
import { NewGameModal } from "@/components/NewGameModal";
import { UserPill } from "@/components/UserPill";
import { useGames } from "@/hooks/useGames";
import { useStake } from "@/hooks/useStake";

export default function Home() {
  const { ready, authenticated, login } = usePrivy();
  const { activeGames, pastGames, loading, createGame } = useGames();
  const { createAndStake } = useStake();
  const [showNewGame, setShowNewGame] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateGame = async (
    opponentEmail: string,
    stakeAmount: string
  ) => {
    setIsCreating(true);
    try {
      // 1. Resolve email → wallet address via /api/find
      const findRes = await fetch("/api/find", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: opponentEmail }),
      });
      const findData = await findRes.json();
      if (!findRes.ok || !findData.address) {
        throw new Error(findData.error || "Could not find opponent wallet");
      }
      const opponentAddress = findData.address;

      // 2. Create game via backend API
      const result = await createGame(opponentAddress, stakeAmount);

      // 3. Create on-chain + stake
      await createAndStake(
        result.gameIdOnchain,
        opponentAddress,
        stakeAmount
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      {/* Unauthenticated skeleton background */}
      {!authenticated && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="h-full w-full" style={{ background: "#000" }} />
        </div>
      )}

      {/* Login */}
      <AnimatePresence>
        {ready && !authenticated && <LoginView onLogin={login} />}
      </AnimatePresence>

      {/* Authenticated dashboard */}
      <AnimatePresence>
        {authenticated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="min-h-screen w-full"
            style={{ background: "var(--background)" }}
          >
            {/* Top bar */}
            <header className="sticky top-0 z-40 backdrop-blur-xl border-b border-white/5">
              <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">⚖️</span>
                  <h1
                    className="text-base font-light tracking-wide"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Legal Wars
                  </h1>
                </div>
                <div className="flex items-center gap-2">
                  <NotificationBell />
                  <UserPill />
                </div>
              </div>
            </header>

            {/* Content */}
            <main className="max-w-2xl mx-auto px-4 py-6 space-y-8">
              {/* New Game CTA */}
              <motion.button
                onClick={() => setShowNewGame(true)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full rounded-xl p-6 text-center transition-all group"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(234, 179, 8, 0.08), rgba(234, 179, 8, 0.03))",
                  border: "1px solid rgba(234, 179, 8, 0.2)",
                }}
              >
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl">⚔️</span>
                  <span
                    className="text-sm font-medium uppercase tracking-wider group-hover:text-white transition-colors"
                    style={{ color: "#eab308" }}
                  >
                    New Game — Challenge Opponent
                  </span>
                </div>
              </motion.button>

              {/* Active Games */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <h2
                    className="text-xs uppercase tracking-wider font-medium"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    Active Games
                  </h2>
                  {activeGames.length > 0 && (
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full"
                      style={{
                        background: "rgba(59, 130, 246, 0.15)",
                        color: "#3b82f6",
                      }}
                    >
                      {activeGames.length}
                    </span>
                  )}
                </div>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="rounded-xl p-5 animate-pulse"
                        style={{
                          background: "var(--glass-bg)",
                          border: "1px solid var(--glass-border)",
                        }}
                      >
                        <div className="h-4 w-3/4 rounded bg-white/5" />
                        <div className="h-3 w-1/2 rounded bg-white/5 mt-2" />
                      </div>
                    ))}
                  </div>
                ) : activeGames.length === 0 ? (
                  <div
                    className="rounded-xl p-8 text-center"
                    style={{
                      background: "var(--glass-bg)",
                      border: "1px solid var(--glass-border)",
                    }}
                  >
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      No active games. Challenge someone to begin!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeGames.map((game) => (
                      <GameCard key={game.id} game={game} />
                    ))}
                  </div>
                )}
              </section>

              {/* Past Games */}
              {pastGames.length > 0 && (
                <section>
                  <h2
                    className="text-xs uppercase tracking-wider font-medium mb-4"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    Past Games
                  </h2>
                  <div className="space-y-3">
                    {pastGames.map((game) => (
                      <GameCard key={game.id} game={game} />
                    ))}
                  </div>
                </section>
              )}
            </main>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Game Modal */}
      <NewGameModal
        isOpen={showNewGame}
        onClose={() => setShowNewGame(false)}
        onCreateGame={handleCreateGame}
        isCreating={isCreating}
      />
    </>
  );
}
