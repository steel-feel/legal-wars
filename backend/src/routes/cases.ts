import { Elysia, t } from "elysia";
import { authMiddleware } from "../middleware/auth";
import { db } from "../db/db";
import { cases } from "../db/schema";
import { eq } from "drizzle-orm";

export const caseRoutes = new Elysia({ prefix: "/cases" })
    .use(authMiddleware)

    // ─── List all cases ─────────────────────────────────────────────────────────
    .get("/", async () => {
        const allCases = await db.select().from(cases);

        return {
            success: true,
            data: allCases,
        };
    })

    // ─── Get case by ID ────────────────────────────────────────────────────────
    .get(
        "/:id",
        async ({ params }) => {
            const caseData = await db.query.cases.findFirst({
                where: eq(cases.id, parseInt(params.id)),
            });

            if (!caseData) {
                throw new Error("Case not found");
            }

            return {
                success: true,
                data: caseData,
            };
        },
        {
            params: t.Object({
                id: t.String(),
            }),
        }
    );
