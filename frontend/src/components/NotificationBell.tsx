"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNotifications } from "@/hooks/useNotifications";
import { useRouter } from "next/navigation";

export function NotificationBell() {
    const { notifications, unreadCount, markAsRead, markAllAsRead } =
        useNotifications();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const handleNotificationClick = (notif: (typeof notifications)[0]) => {
        markAsRead(notif.id);
        if (notif.gameId) {
            router.push(`/game/${notif.gameId}`);
            setOpen(false);
        }
    };

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="relative p-2 rounded-lg transition-colors hover:bg-white/10"
            >
                {/* Bell SVG */}
                <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ color: "var(--text-secondary)" }}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                    />
                </svg>
                {/* Badge */}
                {unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                        style={{
                            background: "linear-gradient(135deg, #ef4444, #dc2626)",
                            color: "#fff",
                        }}
                    >
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </motion.span>
                )}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto rounded-xl backdrop-blur-2xl z-50"
                        style={{
                            background: "rgba(10, 10, 15, 0.95)",
                            border: "1px solid var(--glass-border)",
                        }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                            <h4
                                className="text-sm font-medium"
                                style={{ color: "var(--text-primary)" }}
                            >
                                Notifications
                            </h4>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs transition-colors hover:text-white"
                                    style={{ color: "var(--accent-primary-solid)" }}
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {/* Notification list */}
                        {notifications.length === 0 ? (
                            <div
                                className="px-4 py-8 text-center text-sm"
                                style={{ color: "var(--text-tertiary)" }}
                            >
                                No notifications yet
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <button
                                    key={notif.id}
                                    onClick={() => handleNotificationClick(notif)}
                                    className="w-full text-left px-4 py-3 transition-colors hover:bg-white/5 border-b border-white/5 last:border-b-0"
                                >
                                    <div className="flex items-start gap-3">
                                        <div
                                            className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${notif.read ? "opacity-0" : ""
                                                }`}
                                            style={{
                                                background:
                                                    "var(--accent-primary-solid)",
                                            }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p
                                                className="text-sm font-medium truncate"
                                                style={{
                                                    color: notif.read
                                                        ? "var(--text-secondary)"
                                                        : "var(--text-primary)",
                                                }}
                                            >
                                                {notif.title}
                                            </p>
                                            <p
                                                className="text-xs mt-0.5 line-clamp-2"
                                                style={{ color: "var(--text-tertiary)" }}
                                            >
                                                {notif.message}
                                            </p>
                                            <p
                                                className="text-[10px] mt-1"
                                                style={{ color: "var(--text-tertiary)" }}
                                            >
                                                {new Date(notif.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
