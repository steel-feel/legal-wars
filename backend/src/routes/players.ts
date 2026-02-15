import { Elysia } from "elysia";
import { authMiddleware } from "../middleware/auth";

export const playerRoutes = new Elysia({ prefix: "/players" })
    .use(authMiddleware)

    // ─── Get or create player profile ───────────────────────────────────────────
    .get("/me", async (ctx) => {
        const player = (ctx as any).player;

        return {
            success: true,
            data: player,
        };
    });
