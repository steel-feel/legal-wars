"use client";

import { useState, useEffect, useCallback } from "react";
import { useApi } from "./useApi";
import type { Game, Side } from "@/lib/types";

export function useGame(gameId: string | null) {
    const { apiFetch } = useApi();
    const [game, setGame] = useState<Game | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const fetchGame = useCallback(async () => {
        if (!gameId) return;
        try {
            const res = await apiFetch<{ success: boolean; data: Game }>(
                `/games/${gameId}`
            );
            setGame(res.data);
            setError(null);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to fetch game"
            );
        } finally {
            setLoading(false);
        }
    }, [gameId, apiFetch]);

    useEffect(() => {
        if (!gameId) return;
        fetchGame();
        const interval = setInterval(fetchGame, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, [gameId, fetchGame]);

    const selectSide = useCallback(
        async (side: Side) => {
            if (!gameId) throw new Error("No game ID");
            setSubmitting(true);
            try {
                const res = await apiFetch<{
                    success: boolean;
                    data: {
                        prosecutionPlayerId: string;
                        defensePlayerId: string;
                        message: string;
                    };
                }>(`/games/${gameId}/select-side`, {
                    method: "POST",
                    body: JSON.stringify({ side }),
                });
                await fetchGame();
                return res.data;
            } finally {
                setSubmitting(false);
            }
        },
        [gameId, apiFetch, fetchGame]
    );

    const submitStage = useCallback(
        async (
            argumentText: string,
            selectedEvidences?: string[],
            selectedWitnesses?: string[]
        ) => {
            if (!gameId) throw new Error("No game ID");
            setSubmitting(true);
            try {
                const res = await apiFetch<{
                    success: boolean;
                    data: { submission: unknown; message: string };
                }>(`/games/${gameId}/submit-stage`, {
                    method: "POST",
                    body: JSON.stringify({
                        argumentText,
                        selectedEvidences,
                        selectedWitnesses,
                    }),
                });
                await fetchGame();
                return res.data;
            } finally {
                setSubmitting(false);
            }
        },
        [gameId, apiFetch, fetchGame]
    );

    const triggerJudgment = useCallback(async () => {
        if (!gameId) throw new Error("No game ID");
        setSubmitting(true);
        try {
            const res = await apiFetch<{
                success: boolean;
                data: {
                    winnerId: string;
                    judgment: string;
                    reasoning: string;
                    message: string;
                };
            }>(`/games/${gameId}/judge`, {
                method: "POST",
            });
            await fetchGame();
            return res.data;
        } finally {
            setSubmitting(false);
        }
    }, [gameId, apiFetch, fetchGame]);

    return {
        game,
        loading,
        error,
        submitting,
        selectSide,
        submitStage,
        triggerJudgment,
        refetch: fetchGame,
    };
}
