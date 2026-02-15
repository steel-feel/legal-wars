"use client";

import { useState, useEffect, useCallback } from "react";
import { useApi } from "./useApi";
import type { Game } from "@/lib/types";

export function useGames() {
    const { apiFetch } = useApi();
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchGames = useCallback(async () => {
        try {
            const res = await apiFetch<{ success: boolean; data: Game[] }>("/games");
            setGames(res.data || []);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch games");
        } finally {
            setLoading(false);
        }
    }, [apiFetch]);

    useEffect(() => {
        fetchGames();
        const interval = setInterval(fetchGames, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, [fetchGames]);

    const createGame = useCallback(
        async (opponentWalletAddress: string, stakeAmount: string) => {
            const res = await apiFetch<{
                success: boolean;
                data: {
                    game: Game;
                    gameIdOnchain: string;
                    message: string;
                };
            }>("/games", {
                method: "POST",
                body: JSON.stringify({ opponentWalletAddress, stakeAmount }),
            });
            // Refresh game list
            await fetchGames();
            return res.data;
        },
        [apiFetch, fetchGames]
    );

    const activeGames = games.filter((g) => g.currentStage !== "completed");
    const pastGames = games.filter((g) => g.currentStage === "completed");

    return {
        games,
        activeGames,
        pastGames,
        loading,
        error,
        createGame,
        refetch: fetchGames,
    };
}
