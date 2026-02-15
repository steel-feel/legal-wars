"use client";

import { motion } from "motion/react";
import { LiquidGlassButton } from "./LiquidGlassButton";
import { GlassCard } from "./GlassCard";
import type { Game } from "@/lib/types";

interface StakePanelProps {
    game: Game;
    isCreator: boolean;
    onStake: () => Promise<void>;
    isStaking: boolean;
    error: string | null;
}

function formatStake(stakeAmount: string) {
    const value = Number(BigInt(stakeAmount)) / 1e6;
    return `${value.toLocaleString()} aUSD`;
}

function truncateAddress(addr: string) {
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function StakePanel({
    game,
    isCreator,
    onStake,
    isStaking,
    error,
}: StakePanelProps) {
    const playerHasStaked = isCreator ? game.creatorStaked : game.opponentStaked;

    return (
        <GlassCard padding="lg" className="space-y-6">
            <div className="text-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="text-5xl mb-4"
                >
                    💰
                </motion.div>
                <h2
                    className="text-xl font-light"
                    style={{ color: "var(--text-primary)" }}
                >
                    Stake Required
                </h2>
                <p
                    className="text-sm mt-2"
                    style={{ color: "var(--text-secondary)" }}
                >
                    Both players must stake{" "}
                    <span className="font-mono font-medium" style={{ color: "#eab308" }}>
                        {formatStake(game.stakeAmount)}
                    </span>{" "}
                    to begin the case.
                </p>
            </div>

            {/* Stake status */}
            <div className="grid grid-cols-2 gap-4">
                <div
                    className="rounded-lg p-4 text-center"
                    style={{
                        background: game.creatorStaked
                            ? "rgba(34, 197, 94, 0.1)"
                            : "rgba(255,255,255,0.03)",
                        border: `1px solid ${game.creatorStaked
                            ? "rgba(34, 197, 94, 0.3)"
                            : "rgba(255,255,255,0.08)"
                            }`,
                    }}
                >
                    <p
                        className="text-xs uppercase tracking-wider"
                        style={{ color: "var(--text-tertiary)" }}
                    >
                        Creator
                    </p>
                    <p
                        className="text-xs mt-1 font-mono"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        {truncateAddress(game.creator?.walletAddress || "")}
                    </p>
                    <p
                        className="text-lg font-bold mt-2"
                        style={{
                            color: game.creatorStaked
                                ? "var(--accent-success-solid)"
                                : "var(--text-tertiary)",
                        }}
                    >
                        {game.creatorStaked ? "✓ Staked" : "Pending"}
                    </p>
                </div>
                <div
                    className="rounded-lg p-4 text-center"
                    style={{
                        background: game.opponentStaked
                            ? "rgba(34, 197, 94, 0.1)"
                            : "rgba(255,255,255,0.03)",
                        border: `1px solid ${game.opponentStaked
                            ? "rgba(34, 197, 94, 0.3)"
                            : "rgba(255,255,255,0.08)"
                            }`,
                    }}
                >
                    <p
                        className="text-xs uppercase tracking-wider"
                        style={{ color: "var(--text-tertiary)" }}
                    >
                        Opponent
                    </p>
                    <p
                        className="text-xs mt-1 font-mono"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        {truncateAddress(game.opponent?.walletAddress || "")}
                    </p>
                    <p
                        className="text-lg font-bold mt-2"
                        style={{
                            color: game.opponentStaked
                                ? "var(--accent-success-solid)"
                                : "var(--text-tertiary)",
                        }}
                    >
                        {game.opponentStaked ? "✓ Staked" : "Pending"}
                    </p>
                </div>
            </div>

            {/* Stake button */}
            {!playerHasStaked && (
                <div className="space-y-3">
                    <LiquidGlassButton
                        onClick={onStake}
                        fullWidth
                        disabled={isStaking}
                    >
                        <span className="text-sm uppercase tracking-wider">
                            {isStaking
                                ? "Staking..."
                                : `Stake ${formatStake(game.stakeAmount)}`}
                        </span>
                    </LiquidGlassButton>
                    {error && (
                        <p className="text-sm text-red-400 text-center">{error}</p>
                    )}
                </div>
            )}

            {playerHasStaked && (
                <p
                    className="text-center text-sm"
                    style={{ color: "var(--text-secondary)" }}
                >
                    ✅ You have staked. Waiting for opponent...
                </p>
            )}
        </GlassCard>
    );
}
