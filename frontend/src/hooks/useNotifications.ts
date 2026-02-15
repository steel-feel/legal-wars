"use client";

import { useState, useEffect, useCallback } from "react";
import { useApi } from "./useApi";
import type { Notification } from "@/lib/types";

export function useNotifications() {
    const { apiFetch } = useApi();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = useCallback(async () => {
        try {
            const [notifsRes, countRes] = await Promise.all([
                apiFetch<{ success: boolean; data: Notification[] }>(
                    "/notifications?limit=20"
                ),
                apiFetch<{ success: boolean; data: { count: number } }>(
                    "/notifications/unread-count"
                ),
            ]);
            setNotifications(notifsRes.data || []);
            setUnreadCount(countRes.data?.count || 0);
        } catch {
            // Silently fail notification polling
        } finally {
            setLoading(false);
        }
    }, [apiFetch]);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 15000); // Poll every 15s
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const markAsRead = useCallback(
        async (notificationId: string) => {
            try {
                await apiFetch(`/notifications/${notificationId}/read`, {
                    method: "PATCH",
                });
                setNotifications((prev) =>
                    prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
                );
                setUnreadCount((prev) => Math.max(0, prev - 1));
            } catch {
                // Silently fail
            }
        },
        [apiFetch]
    );

    const markAllAsRead = useCallback(async () => {
        try {
            await apiFetch("/notifications/read-all", { method: "POST" });
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch {
            // Silently fail
        }
    }, [apiFetch]);

    return {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        refetch: fetchNotifications,
    };
}
