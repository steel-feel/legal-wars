import { Elysia, t } from "elysia";
import { authMiddleware } from "../middleware/auth";
import {
    createGame,
    selectSide,
    submitStage,
    getGameDetails,
    listPlayerGames,
    handleJudgment,
} from "../services/gameService";

export const gameRoutes = new Elysia({ prefix: "/games" })
    .use(authMiddleware)

    // ─── Create a new game ─────────────────────────────────────────────────────
    .post(
        "/",
        async ({ body, store, ...ctx }) => {
            const { opponentWalletAddress, stakeAmount } = body;
            const player = (ctx as any).player;
            const result = await createGame(player, opponentWalletAddress, stakeAmount);

            return {
                success: true,
                data: {
                    game: result.game,
                    gameIdOnchain: result.gameIdOnchain,
                    message:
                        "Game created! Share the gameIdOnchain with your opponent. Both players must stake on-chain.",
                },
            };
        },
        {
            body: t.Object({
                opponentWalletAddress: t.String({
                    description: "Wallet address of the opponent to challenge",
                }),
                stakeAmount: t.String({
                    description: "Stake amount in alphaUSD (as string)",
                }),
            }),
        }
    )

    // ─── List my games ─────────────────────────────────────────────────────────
    .get("/", async (ctx) => {
        const player = (ctx as any).player;
        const playerGames = await listPlayerGames(player.id);

        return {
            success: true,
            data: playerGames,
        };
    })

    // ─── Get game details ──────────────────────────────────────────────────────
    .get(
        "/:id",
        async ({ params, ...ctx }) => {
            const player = (ctx as any).player;
            const game = await getGameDetails(params.id);

            if (!game) {
                throw new Error("Game not found");
            }

            // Verify player is part of the game
            if (game.creatorId !== player.id && game.opponentId !== player.id) {
                throw new Error("You are not a player in this game");
            }

            return {
                success: true,
                data: game,
            };
        },
        {
            params: t.Object({
                id: t.String(),
            }),
        }
    )

    // ─── Select side (prosecution/defense) ──────────────────────────────────────
    .post(
        "/:id/select-side",
        async ({ params, body, ...ctx }) => {
            const player = (ctx as any).player;
            const result = await selectSide(params.id, player.id, body.side);

            return {
                success: true,
                data: {
                    ...result,
                    message: `You chose ${body.side}. The game advances to Initial Arguments!`,
                },
            };
        },
        {
            params: t.Object({
                id: t.String(),
            }),
            body: t.Object({
                side: t.Union([t.Literal("prosecution"), t.Literal("defense")], {
                    description: "Choose prosecution or defense",
                }),
            }),
        }
    )

    // ─── Submit stage arguments/evidence ────────────────────────────────────────
    .post(
        "/:id/submit-stage",
        async ({ params, body, ...ctx }) => {
            const player = (ctx as any).player;
            const submission = await submitStage(
                params.id,
                player.id,
                body.argumentText,
                body.selectedEvidences,
                body.selectedWitnesses
            );

            return {
                success: true,
                data: {
                    submission,
                    message: "Stage submission recorded successfully",
                },
            };
        },
        {
            params: t.Object({
                id: t.String(),
            }),
            body: t.Object({
                argumentText: t.String({
                    description: "Your argument text for this stage",
                }),
                selectedEvidences: t.Optional(
                    t.Array(t.String(), {
                        description: "Evidence items you want to present",
                    })
                ),
                selectedWitnesses: t.Optional(
                    t.Array(t.String(), {
                        description: "Witnesses you want to call",
                    })
                ),
            }),
        }
    )

    // ─── Trigger judgment (manual fallback) ─────────────────────────────────────
    .post(
        "/:id/judge",
        async ({ params, ...ctx }) => {
            const player = (ctx as any).player;
            const game = await getGameDetails(params.id);

            if (!game) throw new Error("Game not found");
            if (game.creatorId !== player.id && game.opponentId !== player.id) {
                throw new Error("You are not a player in this game");
            }
            if (game.currentStage !== "judgment") {
                throw new Error(
                    "Cannot trigger judgment. Game must be in judgment stage."
                );
            }

            const result = await handleJudgment(params.id);

            return {
                success: true,
                data: {
                    winnerId: result.winnerId,
                    judgment: result.judgment,
                    reasoning: result.reasoning,
                    message: "Judgment delivered! The case has been resolved.",
                },
            };
        },
        {
            params: t.Object({
                id: t.String(),
            }),
        }
    );
