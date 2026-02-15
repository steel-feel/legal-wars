"use client";

import { useState, useEffect, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useApi } from "./useApi";
import type { Player } from "@/lib/types";

/**
 * Hook to fetch / create the current player's profile via GET /players/me.
 * Automatically fires once the user is authenticated.
 */
export function usePlayer() {
    const { authenticated } = usePrivy();
    const { apiFetch } = useApi();
    const [player, setPlayer] = useState<Player | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPlayer = useCallback(async () => {
        try {
            setLoading(true);
            const res = await apiFetch<{ success: boolean; data: Player }>(
                "/players/me"
            );
            setPlayer(res.data);
            setError(null);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to fetch player"
            );
        } finally {
            setLoading(false);
        }
    }, [apiFetch]);

    useEffect(() => {
        if (authenticated) {
            fetchPlayer();
        }
    }, [authenticated, fetchPlayer]);

    return { player, loading, error, refetch: fetchPlayer };
}
