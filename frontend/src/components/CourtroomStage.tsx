"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { GlassCard } from "./GlassCard";
import { LiquidGlassButton } from "./LiquidGlassButton";
import type { Game, StageType } from "@/lib/types";
import { STAGE_LABELS } from "@/lib/types";

interface CourtroomStageProps {
    game: Game;
    playerId: string;
    onSubmit: (
        argumentText: string,
        selectedEvidences?: string[],
        selectedWitnesses?: string[]
    ) => Promise<unknown>;
    submitting: boolean;
}

export function CourtroomStage({
    game,
    playerId,
    onSubmit,
    submitting,
}: CourtroomStageProps) {
    const [argumentText, setArgumentText] = useState("");
    const [selectedEvidences, setSelectedEvidences] = useState<string[]>([]);
    const [selectedWitnesses, setSelectedWitnesses] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    const currentStage = game.currentStage as StageType;
    const isEvidenceStage = currentStage === "evidences_witnesses";
    const playerSide =
        game.prosecutionPlayerId === playerId ? "prosecution" : "defense";

    // Check if the player has already submitted for this stage
    const playerSubmission = game.stages?.find(
        (s) => s.stage === currentStage && s.playerId === playerId
    );
    const opponentSubmission = game.stages?.find(
        (s) => s.stage === currentStage && s.playerId !== playerId
    );

    const brief =
        playerSide === "prosecution"
            ? game.case?.prosecutionBrief
            : game.case?.defenseBrief;

    const handleSubmit = async () => {
        if (!argumentText.trim()) {
            setError("Please enter your argument");
            return;
        }
        setError(null);
        try {
            await onSubmit(
                argumentText,
                isEvidenceStage ? selectedEvidences : undefined,
                isEvidenceStage ? selectedWitnesses : undefined
            );
            setArgumentText("");
            setSelectedEvidences([]);
            setSelectedWitnesses([]);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Submission failed");
        }
    };

    const toggleEvidence = (ev: string) => {
        setSelectedEvidences((prev) =>
            prev.includes(ev) ? prev.filter((e) => e !== ev) : [...prev, ev]
        );
    };

    const toggleWitness = (w: string) => {
        setSelectedWitnesses((prev) =>
            prev.includes(w) ? prev.filter((x) => x !== w) : [...prev, w]
        );
    };

    // Player already submitted
    if (playerSubmission) {
        return (
            <GlassCard padding="lg" className="space-y-4">
                <div className="text-center">
                    <div className="text-4xl mb-3">✅</div>
                    <h2
                        className="text-lg font-light"
                        style={{ color: "var(--text-primary)" }}
                    >
                        {STAGE_LABELS[currentStage]} — Submitted
                    </h2>
                    <p
                        className="text-sm mt-2"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        {opponentSubmission
                            ? "Both sides have submitted. The case advances!"
                            : "Waiting for your opponent to submit their arguments..."}
                    </p>
                </div>

                {/* Show the player's own submission */}
                <div
                    className="rounded-lg p-4"
                    style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.08)",
                    }}
                >
                    <p
                        className="text-xs uppercase tracking-wider mb-2"
                        style={{ color: "var(--text-tertiary)" }}
                    >
                        Your Argument
                    </p>
                    <p
                        className="text-sm"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        {playerSubmission.argumentText}
                    </p>
                </div>
            </GlassCard>
        );
    }

    return (
        <GlassCard padding="lg" className="space-y-5">
            {/* Header */}
            <div>
                <div className="flex items-center justify-between">
                    <h2
                        className="text-lg font-light"
                        style={{ color: "var(--text-primary)" }}
                    >
                        {STAGE_LABELS[currentStage]}
                    </h2>
                    <span
                        className="text-xs px-2.5 py-1 rounded-full font-medium"
                        style={{
                            background:
                                playerSide === "prosecution"
                                    ? "rgba(239, 68, 68, 0.15)"
                                    : "rgba(59, 130, 246, 0.15)",
                            color:
                                playerSide === "prosecution" ? "#ef4444" : "#3b82f6",
                        }}
                    >
                        {playerSide === "prosecution" ? "⚔️ Prosecution" : "🛡️ Defense"}
                    </span>
                </div>

                {/* Opponent status */}
                <p
                    className="text-xs mt-1"
                    style={{ color: "var(--text-tertiary)" }}
                >
                    Opponent:{" "}
                    {opponentSubmission ? (
                        <span style={{ color: "var(--accent-success-solid)" }}>
                            Submitted ✓
                        </span>
                    ) : (
                        "Not yet submitted"
                    )}
                </p>
            </div>

            {/* Case brief */}
            {brief && (
                <div
                    className="rounded-lg p-4"
                    style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.08)",
                    }}
                >
                    <p
                        className="text-xs uppercase tracking-wider mb-2"
                        style={{ color: "var(--text-tertiary)" }}
                    >
                        📋 Your Brief
                    </p>
                    <p
                        className="text-sm leading-relaxed"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        {brief}
                    </p>
                </div>
            )}

            {/* Evidence selection (only in evidences_witnesses stage) */}
            {isEvidenceStage && game.case?.evidences && (
                <div>
                    <p
                        className="text-xs uppercase tracking-wider mb-3"
                        style={{ color: "var(--text-tertiary)" }}
                    >
                        🔍 Select Evidence
                    </p>
                    <div className="space-y-2">
                        {game.case.evidences.map((ev, i) => (
                            <motion.button
                                key={i}
                                onClick={() => toggleEvidence(ev)}
                                whileTap={{ scale: 0.98 }}
                                className="w-full text-left rounded-lg p-3 flex items-start gap-3 transition-all"
                                style={{
                                    background: selectedEvidences.includes(ev)
                                        ? "rgba(59, 130, 246, 0.1)"
                                        : "rgba(255,255,255,0.02)",
                                    border: `1px solid ${selectedEvidences.includes(ev)
                                        ? "rgba(59, 130, 246, 0.3)"
                                        : "rgba(255,255,255,0.06)"
                                        }`,
                                }}
                            >
                                <div
                                    className="w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center mt-0.5 text-xs"
                                    style={{
                                        borderColor: selectedEvidences.includes(ev)
                                            ? "var(--accent-primary-solid)"
                                            : "rgba(255,255,255,0.2)",
                                        background: selectedEvidences.includes(ev)
                                            ? "var(--accent-primary-solid)"
                                            : "transparent",
                                        color: "#fff",
                                    }}
                                >
                                    {selectedEvidences.includes(ev) && "✓"}
                                </div>
                                <p
                                    className="text-xs"
                                    style={{ color: "var(--text-secondary)" }}
                                >
                                    {ev}
                                </p>
                            </motion.button>
                        ))}
                    </div>
                </div>
            )}

            {/* Witness selection (only in evidences_witnesses stage) */}
            {isEvidenceStage && game.case?.witnesses && (
                <div>
                    <p
                        className="text-xs uppercase tracking-wider mb-3"
                        style={{ color: "var(--text-tertiary)" }}
                    >
                        👤 Call Witnesses
                    </p>
                    <div className="space-y-2">
                        {game.case.witnesses.map((w, i) => (
                            <motion.button
                                key={i}
                                onClick={() => toggleWitness(w)}
                                whileTap={{ scale: 0.98 }}
                                className="w-full text-left rounded-lg p-3 flex items-start gap-3 transition-all"
                                style={{
                                    background: selectedWitnesses.includes(w)
                                        ? "rgba(168, 85, 247, 0.1)"
                                        : "rgba(255,255,255,0.02)",
                                    border: `1px solid ${selectedWitnesses.includes(w)
                                        ? "rgba(168, 85, 247, 0.3)"
                                        : "rgba(255,255,255,0.06)"
                                        }`,
                                }}
                            >
                                <div
                                    className="w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center mt-0.5 text-xs"
                                    style={{
                                        borderColor: selectedWitnesses.includes(w)
                                            ? "#a855f7"
                                            : "rgba(255,255,255,0.2)",
                                        background: selectedWitnesses.includes(w)
                                            ? "#a855f7"
                                            : "transparent",
                                        color: "#fff",
                                    }}
                                >
                                    {selectedWitnesses.includes(w) && "✓"}
                                </div>
                                <p
                                    className="text-xs"
                                    style={{ color: "var(--text-secondary)" }}
                                >
                                    {w}
                                </p>
                            </motion.button>
                        ))}
                    </div>
                </div>
            )}

            {/* Argument textarea */}
            <div>
                <label
                    className="block text-xs uppercase tracking-wider mb-2"
                    style={{ color: "var(--text-tertiary)" }}
                >
                    ✍️ Your Argument
                </label>
                <textarea
                    value={argumentText}
                    onChange={(e) => setArgumentText(e.target.value)}
                    placeholder="Your honor, I would like to present..."
                    rows={5}
                    className="w-full rounded-lg p-4 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-500/50 placeholder-white/20"
                    style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "var(--text-primary)",
                    }}
                />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <LiquidGlassButton
                onClick={handleSubmit}
                fullWidth
                disabled={submitting || !argumentText.trim()}
            >
                <span className="text-sm uppercase tracking-wider">
                    {submitting ? "Submitting..." : "Submit Argument"}
                </span>
            </LiquidGlassButton>
        </GlassCard>
    );
}
