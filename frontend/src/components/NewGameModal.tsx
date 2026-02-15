"use client";

import { useState } from "react";
import { Modal } from "./Modal";
import { LiquidGlassButton } from "./LiquidGlassButton";
import { Input } from "./Input";

interface NewGameModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateGame: (
        opponentEmail: string,
        stakeAmount: string
    ) => Promise<void>;
    isCreating: boolean;
}

export function NewGameModal({
    isOpen,
    onClose,
    onCreateGame,
    isCreating,
}: NewGameModalProps) {
    const [opponentEmail, setOpponentEmail] = useState("");
    const [stakeAmount, setStakeAmount] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        setError(null);

        if (!opponentEmail || !opponentEmail.includes("@")) {
            setError("Please enter a valid email address");
            return;
        }
        if (!stakeAmount || isNaN(Number(stakeAmount)) || Number(stakeAmount) <= 0) {
            setError("Please enter a valid stake amount");
            return;
        }

        try {
            // Convert aUSD to its smallest unit (6 decimals)
            const stakeInSmallestUnit = (
                BigInt(Math.floor(Number(stakeAmount) * 1e6))
            ).toString();
            await onCreateGame(opponentEmail, stakeInSmallestUnit);
            setOpponentEmail("");
            setStakeAmount("");
            onClose();
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to create game"
            );
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="⚔️ New Game">
            <div className="space-y-5">
                <Input
                    label="Opponent Email"
                    value={opponentEmail}
                    onChange={setOpponentEmail}
                    placeholder="opponent@example.com"
                />

                <Input
                    label="Stake Amount (aUSD)"
                    value={stakeAmount}
                    onChange={setStakeAmount}
                    placeholder="1.0"
                />

                {error && (
                    <p className="text-sm text-red-400">{error}</p>
                )}

                <LiquidGlassButton
                    onClick={handleSubmit}
                    fullWidth
                    disabled={isCreating}
                >
                    <span className="text-sm uppercase tracking-wider">
                        {isCreating ? "Creating..." : "Create & Challenge"}
                    </span>
                </LiquidGlassButton>
            </div>
        </Modal>
    );
}
