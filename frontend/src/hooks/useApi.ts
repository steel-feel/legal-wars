"use client";

import { useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

/**
 * Hook that provides an auth-aware fetch wrapper.
 * Automatically attaches the Privy access token to all requests.
 */
export function useApi() {
    const { getAccessToken } = usePrivy();

    const apiFetch = useCallback(
        async <T = unknown>(
            path: string,
            options: RequestInit = {}
        ): Promise<T> => {
            const token = await getAccessToken();
            if (!token) throw new Error("Not authenticated");

            const res = await fetch(`${API_URL}${path}`, {
                ...options,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    ...options.headers,
                },
            });

            const json = await res.json();

            if (!res.ok) {
                throw new Error(json.error || `API error: ${res.status}`);
            }

            return json;
        },
        [getAccessToken]
    );

    const authHeaders = useCallback(async () => {
        const token = await getAccessToken();
        return {
            authorization: `Bearer ${token}`,
        };
    }, [getAccessToken]);

    return { apiFetch, authHeaders };
}
