"use client";

import { motion } from "motion/react";
import { GlassCard } from "./GlassCard";
import type { Game, Side } from "@/lib/types";

interface SideSelectorProps {
    game: Game;
    isSidePicker: boolean;
    onSelectSide: (side: Side) => Promise<unknown>;
    submitting: boolean;
}

export function SideSelector({
    game,
    isSidePicker,
    onSelectSide,
    submitting,
}: SideSelectorProps) {
    if (!isSidePicker) {
        return (
            <GlassCard padding="lg">
                <div className="text-center space-y-4">
                    <div className="text-5xl">🎲</div>
                    <h2
                        className="text-xl font-light"
                        style={{ color: "var(--text-primary)" }}
                    >
                        Side Selection
                    </h2>
                    <p
                        className="text-sm"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        The coin toss selected your opponent to choose their side.
                        Waiting for them to decide...
                    </p>
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="inline-block text-3xl"
                    >
                        ⏳
                    </motion.div>
                </div>
            </GlassCard>
        );
    }

    return (
        <GlassCard padding="lg" className="space-y-6">
            <div className="text-center">
                <motion.div
                    initial={{ rotateY: 0 }}
                    animate={{ rotateY: 360 }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="text-5xl mb-4 inline-block"
                >
                    🎲
                </motion.div>
                <h2
                    className="text-xl font-light"
                    style={{ color: "var(--text-primary)" }}
                >
                    You Won the Coin Toss!
                </h2>
                <p
                    className="text-sm mt-2"
                    style={{ color: "var(--text-secondary)" }}
                >
                    Read the case and choose your side wisely.
                </p>
            </div>

            {/* Case brief preview */}
            {game.case && (
                <div
                    className="rounded-lg p-4 space-y-2"
                    style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.08)",
                    }}
                >
                    <h3
                        className="text-sm font-medium"
                        style={{ color: "var(--text-primary)" }}
                    >
                        📋 {game.case.title}
                    </h3>
                    <p
                        className="text-xs leading-relaxed"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        {game.case.description}
                    </p>
                </div>
            )}

            {/* Side selection buttons */}
            <div className="grid grid-cols-2 gap-4">
                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => !submitting && onSelectSide("prosecution")}
                    disabled={submitting}
                    className="rounded-xl p-6 text-center transition-all group"
                    style={{
                        background:
                            "linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                    }}
                >
                    <div className="text-4xl mb-3">⚔️</div>
                    <h4
                        className="text-sm font-medium"
                        style={{ color: "#ef4444" }}
                    >
                        Prosecution
                    </h4>
                    <p
                        className="text-[10px] mt-1"
                        style={{ color: "var(--text-tertiary)" }}
                    >
                        Argue the case
                    </p>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => !submitting && onSelectSide("defense")}
                    disabled={submitting}
                    className="rounded-xl p-6 text-center transition-all group"
                    style={{
                        background:
                            "linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05))",
                        border: "1px solid rgba(59, 130, 246, 0.3)",
                    }}
                >
                    <div className="text-4xl mb-3">🛡️</div>
                    <h4
                        className="text-sm font-medium"
                        style={{ color: "#3b82f6" }}
                    >
                        Defense
                    </h4>
                    <p
                        className="text-[10px] mt-1"
                        style={{ color: "var(--text-tertiary)" }}
                    >
                        Defend the accused
                    </p>
                </motion.button>
            </div>

            {submitting && (
                <p
                    className="text-center text-sm"
                    style={{ color: "var(--text-secondary)" }}
                >
                    Submitting your choice...
                </p>
            )}
        </GlassCard>
    );
}
