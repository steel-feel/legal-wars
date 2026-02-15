"use client";

import { useParams, useRouter } from "next/navigation";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { motion } from "motion/react";
import { useGame } from "@/hooks/useGame";
import { useStake } from "@/hooks/useStake";
import { GameTimeline } from "@/components/GameTimeline";
import { StakePanel } from "@/components/StakePanel";
import { SideSelector } from "@/components/SideSelector";
import { CourtroomStage } from "@/components/CourtroomStage";
import { JudgmentView } from "@/components/JudgmentView";
import { GlassCard } from "@/components/GlassCard";
import { useState, useEffect } from "react";

export default function GamePage() {
    const params = useParams();
    const router = useRouter();
    const gameId = params.id as string;
    const { authenticated } = usePrivy();
    const { wallets } = useWallets();
    const {
        game,
        loading,
        error,
        submitting,
        selectSide,
        submitStage,
        triggerJudgment,
    } = useGame(gameId);
    const {
        stakeOnGame,
        createAndStake,
        isStaking,
        error: stakeError,
    } = useStake();
    const [playerId, setPlayerId] = useState<string | null>(null);

    const embeddedWallet = wallets.find((w) => w.walletClientType === "privy");

    // Resolve playerId from wallet address by looking at game's creator/opponent
    useEffect(() => {
        if (game && embeddedWallet) {
            const addr = embeddedWallet.address.toLowerCase();
            if (game.creator?.walletAddress?.toLowerCase() === addr) {
                setPlayerId(game.creatorId);
            } else if (game.opponent?.walletAddress?.toLowerCase() === addr) {
                setPlayerId(game.opponentId);
            }
        }
    }, [game, embeddedWallet]);

    if (!authenticated) {
        router.push("/");
        return null;
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="text-4xl"
                >
                    ⚖️
                </motion.div>
            </div>
        );
    }

    if (error || !game) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <GlassCard padding="lg">
                    <div className="text-center space-y-4">
                        <p className="text-4xl">❌</p>
                        <p
                            className="text-sm"
                            style={{ color: "var(--text-secondary)" }}
                        >
                            {error || "Game not found"}
                        </p>
                        <button
                            onClick={() => router.push("/")}
                            className="text-sm underline"
                            style={{ color: "var(--accent-primary-solid)" }}
                        >
                            Back to Home
                        </button>
                    </div>
                </GlassCard>
            </div>
        );
    }

    const isCreator = playerId === game.creatorId;
    const isSidePicker = game.sidePickerId === playerId;

    const handleStake = async () => {
        await stakeOnGame(game.gameIdOnchain, game.stakeAmount);
        // if (isCreator) {

        //     await createAndStake(
        //         game.gameIdOnchain,
        //         game.opponent?.walletAddress || "",
        //         game.stakeAmount
        //     );
        // } else {
        //     await stakeOnGame(game.gameIdOnchain, game.stakeAmount);
        // }
    };

    // Determine which stage view to show
    const renderStageView = () => {
        switch (game.currentStage) {
            case "pending_stake":
                return (
                    <StakePanel
                        game={game}
                        isCreator={isCreator}
                        onStake={handleStake}
                        isStaking={isStaking}
                        error={stakeError}
                    />
                );
            case "side_selection":
                return (
                    <SideSelector
                        game={game}
                        isSidePicker={isSidePicker}
                        onSelectSide={selectSide}
                        submitting={submitting}
                    />
                );
            case "initial_arguments":
            case "evidences_witnesses":
            case "final_arguments":
                return playerId ? (
                    <CourtroomStage
                        game={game}
                        playerId={playerId}
                        onSubmit={submitStage}
                        submitting={submitting}
                    />
                ) : null;
            case "judgment":
            case "completed":
                return playerId ? (
                    <JudgmentView
                        game={game}
                        playerId={playerId}
                        onTriggerJudgment={
                            game.currentStage === "judgment"
                                ? triggerJudgment
                                : undefined
                        }
                        submitting={submitting}
                    />
                ) : null;
            default:
                return null;
        }
    };

    return (
        <div
            className="min-h-screen w-full"
            style={{ background: "var(--background)" }}
        >
            {/* Top bar */}
            <header className="sticky top-0 z-40 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
                    <button
                        onClick={() => router.push("/")}
                        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            style={{ color: "var(--text-secondary)" }}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M15.75 19.5L8.25 12l7.5-7.5"
                            />
                        </svg>
                    </button>
                    <div className="flex-1 min-w-0">
                        <h1
                            className="text-sm font-light truncate"
                            style={{ color: "var(--text-primary)" }}
                        >
                            {game.case?.title || "⚖️ Courtroom"}
                        </h1>
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                {/* Timeline */}
                <GameTimeline currentStage={game.currentStage} />

                {/* Stage-specific view */}
                {renderStageView()}

                {/* Case info (collapsed if visible in stage) */}
                {game.case &&
                    game.currentStage !== "side_selection" && (
                        <GlassCard padding="md">
                            <details>
                                <summary
                                    className="text-xs uppercase tracking-wider cursor-pointer"
                                    style={{ color: "var(--text-tertiary)" }}
                                >
                                    📋 Case Details
                                </summary>
                                <div className="mt-3 space-y-2">
                                    <h3
                                        className="text-sm font-medium"
                                        style={{ color: "var(--text-primary)" }}
                                    >
                                        {game.case.title}
                                    </h3>
                                    <p
                                        className="text-xs leading-relaxed"
                                        style={{ color: "var(--text-secondary)" }}
                                    >
                                        {game.case.description}
                                    </p>
                                </div>
                            </details>
                        </GlassCard>
                    )}

                {/* Previous stage submissions */}
                {game.stages && game.stages.length > 0 && (
                    <GlassCard padding="md">
                        <details>
                            <summary
                                className="text-xs uppercase tracking-wider cursor-pointer"
                                style={{ color: "var(--text-tertiary)" }}
                            >
                                📜 Previous Submissions ({game.stages.length})
                            </summary>
                            <div className="mt-3 space-y-3">
                                {game.stages.map((stage) => (
                                    <div
                                        key={stage.id}
                                        className="rounded-lg p-3"
                                        style={{
                                            background: "rgba(255,255,255,0.02)",
                                            border: "1px solid rgba(255,255,255,0.06)",
                                        }}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span
                                                className="text-[10px] uppercase tracking-wider"
                                                style={{ color: "var(--text-tertiary)" }}
                                            >
                                                {stage.stage} •{" "}
                                                {stage.side === "prosecution"
                                                    ? "⚔️ Prosecution"
                                                    : "🛡️ Defense"}
                                            </span>
                                            <span
                                                className="text-[10px]"
                                                style={{ color: "var(--text-tertiary)" }}
                                            >
                                                {new Date(stage.submittedAt).toLocaleString()}
                                            </span>
                                        </div>
                                        <p
                                            className="text-xs leading-relaxed"
                                            style={{ color: "var(--text-secondary)" }}
                                        >
                                            {stage.argumentText}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </details>
                    </GlassCard>
                )}
            </main>
        </div>
    );
}
