"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import type { Game } from "@/lib/types";
import { STAGE_LABELS } from "@/lib/types";

interface GameCardProps {
    game: Game;
}

function truncateAddress(addr: string) {
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function formatStake(stakeAmount: string) {
    // stakeAmount is in wei-like units — display in aUSD (6 decimals)
    const value = Number(BigInt(stakeAmount)) / 1e6;
    return `${value.toLocaleString()} aUSD`;
}

const stageBadgeColors: Record<string, { bg: string; text: string }> = {
    pending_stake: { bg: "rgba(234, 179, 8, 0.15)", text: "#eab308" },
    side_selection: { bg: "rgba(168, 85, 247, 0.15)", text: "#a855f7" },
    initial_arguments: { bg: "rgba(59, 130, 246, 0.15)", text: "#3b82f6" },
    evidences_witnesses: { bg: "rgba(14, 165, 233, 0.15)", text: "#0ea5e9" },
    final_arguments: { bg: "rgba(249, 115, 22, 0.15)", text: "#f97316" },
    judgment: { bg: "rgba(239, 68, 68, 0.15)", text: "#ef4444" },
    completed: { bg: "rgba(34, 197, 94, 0.15)", text: "#22c55e" },
};

export function GameCard({ game }: GameCardProps) {
    const router = useRouter();
    const colors = stageBadgeColors[game.currentStage] || {
        bg: "rgba(255,255,255,0.1)",
        text: "#fff",
    };

    const opponentAddr =
        game.opponent?.walletAddress ||
        game.creator?.walletAddress ||
        "Unknown";

    return (
        <motion.button
            onClick={() => router.push(`/game/${game.id}`)}
            whileHover={{ scale: 1.01, y: -2 }}
            whileTap={{ scale: 0.99 }}
            className="w-full text-left rounded-xl p-5 backdrop-blur-xl transition-all group"
            style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
            }}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <h3
                        className="text-sm font-medium truncate group-hover:text-white transition-colors"
                        style={{ color: "var(--text-primary)" }}
                    >
                        {game.case?.title || "Case Pending..."}
                    </h3>
                    <p
                        className="text-xs mt-1"
                        style={{ color: "var(--text-tertiary)" }}
                    >
                        vs {truncateAddress(opponentAddr)}
                    </p>
                </div>
                <span
                    className="text-[10px] font-medium px-2.5 py-1 rounded-full shrink-0"
                    style={{ background: colors.bg, color: colors.text }}
                >
                    {STAGE_LABELS[game.currentStage]}
                </span>
            </div>

            <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-4">
                    <div>
                        <p
                            className="text-[10px] uppercase tracking-wider"
                            style={{ color: "var(--text-tertiary)" }}
                        >
                            Stake
                        </p>
                        <p
                            className="text-sm font-mono"
                            style={{ color: "var(--text-secondary)" }}
                        >
                            {formatStake(game.stakeAmount)}
                        </p>
                    </div>
                    <div>
                        <p
                            className="text-[10px] uppercase tracking-wider"
                            style={{ color: "var(--text-tertiary)" }}
                        >
                            Staked
                        </p>
                        <div className="flex gap-1 mt-0.5">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{
                                    background: game.creatorStaked
                                        ? "var(--accent-success-solid)"
                                        : "rgba(255,255,255,0.1)",
                                }}
                                title="Creator"
                            />
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{
                                    background: game.opponentStaked
                                        ? "var(--accent-success-solid)"
                                        : "rgba(255,255,255,0.1)",
                                }}
                                title="Opponent"
                            />
                        </div>
                    </div>
                </div>
                <p
                    className="text-[10px]"
                    style={{ color: "var(--text-tertiary)" }}
                >
                    {new Date(game.createdAt).toLocaleDateString()}
                </p>
            </div>
        </motion.button>
    );
}
