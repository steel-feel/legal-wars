import { Elysia, t } from "elysia";
import { authMiddleware } from "../middleware/auth";
import {
    getPlayerNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
} from "../services/notificationService";

export const notificationRoutes = new Elysia({ prefix: "/notifications" })
    .use(authMiddleware)

    // ─── List notifications ─────────────────────────────────────────────────────
    .get(
        "/",
        async ({ query, ...ctx }) => {
            const player = (ctx as any).player;
            const limit = query.limit ? parseInt(query.limit) : 50;
            const unreadOnly = query.unread_only === "true";

            const notifs = await getPlayerNotifications(player.id, limit, unreadOnly);

            return {
                success: true,
                data: notifs,
            };
        },
        {
            query: t.Object({
                limit: t.Optional(t.String({ description: "Max results (default 50)" })),
                unread_only: t.Optional(
                    t.String({ description: "Set to 'true' to get only unread" })
                ),
            }),
        }
    )

    // ─── Unread count ───────────────────────────────────────────────────────────
    .get("/unread-count", async (ctx) => {
        const player = (ctx as any).player;
        const count = await getUnreadCount(player.id);

        return {
            success: true,
            data: { count },
        };
    })

    // ─── Mark single notification as read ───────────────────────────────────────
    .patch(
        "/:id/read",
        async ({ params, ...ctx }) => {
            const player = (ctx as any).player;
            const updated = await markAsRead(params.id, player.id);

            if (!updated) {
                throw new Error("Notification not found");
            }

            return {
                success: true,
                data: updated,
            };
        },
        {
            params: t.Object({
                id: t.String(),
            }),
        }
    )

    // ─── Mark all notifications as read ─────────────────────────────────────────
    .post("/read-all", async (ctx) => {
        const player = (ctx as any).player;
        await markAllAsRead(player.id);

        return {
            success: true,
            message: "All notifications marked as read",
        };
    });
