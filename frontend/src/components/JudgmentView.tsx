"use client";

import { motion } from "motion/react";
import { GlassCard } from "./GlassCard";
import type { Game } from "@/lib/types";

interface JudgmentViewProps {
    game: Game;
    playerId: string;
    onTriggerJudgment?: () => Promise<unknown>;
    submitting?: boolean;
}

function truncateAddress(addr: string) {
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function formatStake(stakeAmount: string) {
    const value = Number(BigInt(stakeAmount)) / 1e6;
    return `${value.toLocaleString()} aUSD`;
}

export function JudgmentView({
    game,
    playerId,
    onTriggerJudgment,
    submitting,
}: JudgmentViewProps) {
    const isJudgmentStage = game.currentStage === "judgment";
    const isWinner = game.winnerId === playerId;

    // Awaiting judgment
    if (isJudgmentStage && !game.judgmentText) {
        return (
            <GlassCard padding="lg">
                <div className="text-center space-y-5">
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-6xl"
                    >
                        ⚖️
                    </motion.div>
                    <h2
                        className="text-xl font-light"
                        style={{ color: "var(--text-primary)" }}
                    >
                        Awaiting Judgment
                    </h2>
                    <p
                        className="text-sm"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        All arguments have been submitted. The AI Judge is reviewing the
                        case...
                    </p>
                    {onTriggerJudgment && (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onTriggerJudgment}
                            disabled={submitting}
                            className="mx-auto px-6 py-3 rounded-lg text-sm font-medium transition-all"
                            style={{
                                background:
                                    "linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(234, 179, 8, 0.1))",
                                border: "1px solid rgba(234, 179, 8, 0.3)",
                                color: "#eab308",
                            }}
                        >
                            {submitting ? "Requesting Judgment..." : "⚡ Request Judgment"}
                        </motion.button>
                    )}
                </div>
            </GlassCard>
        );
    }

    // Verdict
    return (
        <GlassCard padding="lg" className="space-y-6">
            <div className="text-center">
                <motion.div
                    initial={{ scale: 0, rotateZ: -20 }}
                    animate={{ scale: 1, rotateZ: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 12 }}
                    className="text-6xl mb-4"
                >
                    {isWinner ? "🏆" : "⚖️"}
                </motion.div>
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl font-light"
                    style={{
                        color: isWinner ? "#22c55e" : "var(--text-primary)",
                    }}
                >
                    {isWinner ? "You Won!" : "Case Concluded"}
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-sm mt-2"
                    style={{ color: "var(--text-secondary)" }}
                >
                    {isWinner
                        ? `Congratulations! You won ${formatStake(
                            (BigInt(game.stakeAmount) * 2n).toString()
                        )}`
                        : `The court has ruled. Better luck next time.`}
                </motion.p>
            </div>

            {/* Winner info */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="rounded-xl p-4 text-center"
                style={{
                    background: "linear-gradient(135deg, rgba(234, 179, 8, 0.08), rgba(234, 179, 8, 0.03))",
                    border: "1px solid rgba(234, 179, 8, 0.2)",
                }}
            >
                <p
                    className="text-xs uppercase tracking-wider"
                    style={{ color: "var(--text-tertiary)" }}
                >
                    Winner
                </p>
                <p
                    className="text-sm font-mono mt-1"
                    style={{ color: "#eab308" }}
                >
                    {game.winnerId
                        ? game.winnerId === game.creator?.id
                            ? truncateAddress(game.creator?.walletAddress || "")
                            : truncateAddress(game.opponent?.walletAddress || "")
                        : "N/A"}
                </p>
                <p
                    className="text-lg font-bold mt-1"
                    style={{ color: "#eab308" }}
                >
                    {formatStake((BigInt(game.stakeAmount) * 2n).toString())} payout
                </p>
            </motion.div>

            {/* Judgment text */}
            {game.judgmentText && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="rounded-lg p-5 space-y-3"
                    style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.08)",
                    }}
                >
                    <p
                        className="text-xs uppercase tracking-wider"
                        style={{ color: "var(--text-tertiary)" }}
                    >
                        ⚖️ Judge&apos;s Ruling
                    </p>
                    <p
                        className="text-sm leading-relaxed italic"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        &ldquo;{game.judgmentText}&rdquo;
                    </p>
                </motion.div>
            )}
        </GlassCard>
    );
}
