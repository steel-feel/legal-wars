import { db } from "../db/db";
import { games, gameStages, players, cases } from "../db/schema";
import { eq, and, or, sql } from "drizzle-orm";
import { triggerJudgment } from "./aiJudge";
import { resolveGame } from "./contractService";
import {
    notifyGameInvitation,
    notifyOpponentStaked,
    notifyBothStaked,
    notifySideSelected,
    notifyYourTurn,
    notifyOpponentSubmitted,
    notifyJudgmentDelivered,
} from "./notificationService";
import { randomBytes } from "crypto";
import type { Player } from "../db/schema";

/**
 * Generate a bytes32 game ID for on-chain use
 */
export function generateGameId(): string {
    return `0x${randomBytes(32).toString("hex")}`;
}

/**
 * Create a new game challenge
 */
export async function createGame(
    creator: Player,
    opponentWalletAddress: string,
    stakeAmount: string
) {
    // Find opponent by wallet address
    const opponent = await db.query.players.findFirst({
        where: eq(players.walletAddress, opponentWalletAddress.toLowerCase()),
    });

    if (!opponent) {
        throw new Error("Opponent wallet address not found. They must sign in first.");
    }

    if (opponent.id === creator.id) {
        throw new Error("Cannot challenge yourself");
    }

    const gameIdOnchain = generateGameId();

    const [game] = await db
        .insert(games)
        .values({
            gameIdOnchain,
            creatorId: creator.id,
            opponentId: opponent.id,
            stakeAmount,
            currentStage: "pending_stake",
            status: "active",
        })
        .returning();

    // Notify opponent about the challenge
    await notifyGameInvitation(
        opponent.id,
        creator.walletAddress,
        stakeAmount,
        game.id
    );

    return { game, gameIdOnchain };
}

/**
 * Handle staking event — called when contract emits Staked event
 */
export async function onStake(gameIdOnchain: string, playerAddress: string) {
    const game = await db.query.games.findFirst({
        where: eq(games.gameIdOnchain, gameIdOnchain),
        with: { creator: true, opponent: true },
    });

    if (!game) {
        console.warn(`Game not found for on-chain ID: ${gameIdOnchain}`);
        return;
    }

    const isCreator =
        game.creator.walletAddress.toLowerCase() === playerAddress.toLowerCase();
    const isOpponent =
        game.opponent.walletAddress.toLowerCase() === playerAddress.toLowerCase();

    if (!isCreator && !isOpponent) {
        console.warn(`Staker ${playerAddress} is not a player in game ${gameIdOnchain}`);
        return;
    }

    // Update staking status
    const updateData = isCreator
        ? { creatorStaked: true }
        : { opponentStaked: true };

    await db.update(games).set(updateData).where(eq(games.id, game.id));

    // Notify the other player that their opponent staked
    const otherPlayerId = isCreator ? game.opponentId : game.creatorId;
    const stakerWallet = isCreator
        ? game.creator.walletAddress
        : game.opponent.walletAddress;
    await notifyOpponentStaked(otherPlayerId, stakerWallet, game.id);

    // Check if both have staked
    const updatedGame = await db.query.games.findFirst({
        where: eq(games.id, game.id),
    });

    if (updatedGame && updatedGame.creatorStaked && updatedGame.opponentStaked) {
        // Both staked — assign case and pick side-chooser
        await assignCaseAndSidePicker(game.id);
    }
}

/**
 * Randomly assign a case and pick which player chooses sides
 */
async function assignCaseAndSidePicker(gameId: string) {
    // Pick a random case
    const allCases = await db.select().from(cases);
    if (allCases.length === 0) {
        throw new Error("No cases available. Please seed the database.");
    }
    const randomCase = allCases[Math.floor(Math.random() * allCases.length)];

    // Get the game to know the players
    const game = await db.query.games.findFirst({
        where: eq(games.id, gameId),
    });

    if (!game) throw new Error("Game not found");

    // Randomly pick side chooser
    const sidePickerId =
        Math.random() < 0.5 ? game.creatorId : game.opponentId;

    await db
        .update(games)
        .set({
            caseId: randomCase.id,
            sidePickerId,
            currentStage: "side_selection",
            updatedAt: new Date(),
        })
        .where(eq(games.id, gameId));

    // Notify both players
    const otherPlayerId =
        sidePickerId === game.creatorId ? game.opponentId : game.creatorId;
    await notifyBothStaked(sidePickerId, gameId, true);
    await notifyBothStaked(otherPlayerId, gameId, false);
}

/**
 * Selected player picks prosecution or defense
 */
export async function selectSide(
    gameId: string,
    playerId: string,
    side: "prosecution" | "defense"
) {
    const game = await db.query.games.findFirst({
        where: eq(games.id, gameId),
    });

    if (!game) throw new Error("Game not found");
    if (game.currentStage !== "side_selection") {
        throw new Error("Game is not in side selection stage");
    }
    if (game.sidePickerId !== playerId) {
        throw new Error("You are not the designated side picker");
    }

    // Determine who gets which side
    const otherPlayerId =
        playerId === game.creatorId ? game.opponentId : game.creatorId;

    const prosecutionPlayerId =
        side === "prosecution" ? playerId : otherPlayerId;
    const defensePlayerId = side === "defense" ? playerId : otherPlayerId;

    await db
        .update(games)
        .set({
            prosecutionPlayerId,
            defensePlayerId,
            currentStage: "initial_arguments",
            updatedAt: new Date(),
        })
        .where(eq(games.id, gameId));

    // Notify both players of their assigned sides
    await notifySideSelected(prosecutionPlayerId, "prosecution", gameId);
    await notifySideSelected(defensePlayerId, "defense", gameId);

    // Notify both it's their turn for initial arguments
    await notifyYourTurn(prosecutionPlayerId, "initial_arguments", gameId);
    await notifyYourTurn(defensePlayerId, "initial_arguments", gameId);

    return { prosecutionPlayerId, defensePlayerId };
}

/**
 * Submit a stage entry (argument, evidences, witnesses)
 */
export async function submitStage(
    gameId: string,
    playerId: string,
    argumentText: string,
    selectedEvidences?: string[],
    selectedWitnesses?: string[]
) {
    const game = await db.query.games.findFirst({
        where: eq(games.id, gameId),
    });

    if (!game) throw new Error("Game not found");

    const validStages = [
        "initial_arguments",
        "evidences_witnesses",
        "final_arguments",
    ] as const;
    const currentStage = game.currentStage as (typeof validStages)[number];
    if (!validStages.includes(currentStage)) {
        throw new Error(`Cannot submit in current stage: ${game.currentStage}`);
    }

    // Determine player's side
    let side: "prosecution" | "defense";
    if (playerId === game.prosecutionPlayerId) {
        side = "prosecution";
    } else if (playerId === game.defensePlayerId) {
        side = "defense";
    } else {
        throw new Error("You are not a player in this game");
    }

    // Check if already submitted for this stage
    const existingSubmission = await db.query.gameStages.findFirst({
        where: and(
            eq(gameStages.gameId, gameId),
            eq(gameStages.playerId, playerId),
            eq(gameStages.stage, currentStage)
        ),
    });

    if (existingSubmission) {
        throw new Error("You have already submitted for this stage");
    }

    // Save submission
    const [submission] = await db
        .insert(gameStages)
        .values({
            gameId,
            playerId,
            stage: currentStage,
            side,
            argumentText,
            selectedEvidences: selectedEvidences || [],
            selectedWitnesses: selectedWitnesses || [],
        })
        .returning();

    // Check if both players have submitted for this stage
    const submissions = await db.query.gameStages.findMany({
        where: and(
            eq(gameStages.gameId, gameId),
            eq(gameStages.stage, currentStage)
        ),
    });

    if (submissions.length === 2) {
        // Both submitted → advance to next stage
        await advanceStage(gameId, currentStage);
    } else {
        // Notify the other player that opponent submitted
        const otherPlayerId =
            playerId === game.prosecutionPlayerId
                ? game.defensePlayerId!
                : game.prosecutionPlayerId!;
        await notifyOpponentSubmitted(otherPlayerId, currentStage, gameId);
    }

    return submission;
}

/**
 * Advance game to next stage after both players submit
 */
async function advanceStage(
    gameId: string,
    currentStage: "initial_arguments" | "evidences_witnesses" | "final_arguments"
) {
    const stageProgression: Record<string, string> = {
        initial_arguments: "evidences_witnesses",
        evidences_witnesses: "final_arguments",
        final_arguments: "judgment",
    };

    const nextStage = stageProgression[currentStage];

    await db
        .update(games)
        .set({
            currentStage: nextStage as any,
            updatedAt: new Date(),
        })
        .where(eq(games.id, gameId));

    // If moving to judgment, auto-trigger AI judge
    if (nextStage === "judgment") {
        // Run judgment asynchronously
        handleJudgment(gameId).catch((err) =>
            console.error(`Judgment failed for game ${gameId}:`, err)
        );
    } else {
        // Notify both players it's their turn for the next stage
        const game = await db.query.games.findFirst({
            where: eq(games.id, gameId),
        });
        if (game && game.prosecutionPlayerId && game.defensePlayerId) {
            await notifyYourTurn(game.prosecutionPlayerId, nextStage, gameId);
            await notifyYourTurn(game.defensePlayerId, nextStage, gameId);
        }
    }
}

/**
 * Handle the full judgment flow: AI judge → resolve on-chain
 */
export async function handleJudgment(gameId: string) {
    const game = await db.query.games.findFirst({
        where: eq(games.id, gameId),
        with: {
            case: true,
            creator: true,
            opponent: true,
            stages: {
                with: { player: true },
            },
        },
    });

    if (!game) throw new Error("Game not found");
    if (!game.case) throw new Error("No case assigned to game");

    // Build trial transcript
    const result = await triggerJudgment(game);

    // Determine winner player ID
    const winnerId =
        result.winner === "prosecution"
            ? game.prosecutionPlayerId
            : game.defensePlayerId;

    const winnerPlayer =
        winnerId === game.creator.id ? game.creator : game.opponent;

    // Update game with judgment
    await db
        .update(games)
        .set({
            winnerId,
            judgmentText: result.judgment,
            currentStage: "completed",
            status: "archived",
            updatedAt: new Date(),
        })
        .where(eq(games.id, gameId));

    // Call smart contract to release funds to winner
    try {
        await resolveGame(game.gameIdOnchain, winnerPlayer.walletAddress);
        console.log(
            `✅ Game ${gameId} resolved. Winner: ${winnerPlayer.walletAddress}`
        );
    } catch (err) {
        console.error(`❌ Failed to resolve game on-chain: ${gameId}`, err);
    }

    // Notify both players of the verdict
    const loserPlayer =
        winnerId === game.creator.id ? game.opponent : game.creator;
    await notifyJudgmentDelivered(winnerPlayer.id, true, gameId);
    await notifyJudgmentDelivered(loserPlayer.id, false, gameId);

    return { winnerId, judgment: result.judgment, reasoning: result.reasoning };
}

/**
 * Get a game with all details
 */
export async function getGameDetails(gameId: string) {
    return db.query.games.findFirst({
        where: eq(games.id, gameId),
        with: {
            creator: true,
            opponent: true,
            case: true,
            stages: {
                with: { player: true },
                orderBy: (stages, { asc }) => [asc(stages.submittedAt)],
            },
        },
    });
}

/**
 * List games for a player
 */
export async function listPlayerGames(playerId: string) {
    return db.query.games.findMany({
        where: or(eq(games.creatorId, playerId), eq(games.opponentId, playerId)),
        with: {
            creator: true,
            opponent: true,
            case: true,
        },
        orderBy: (games, { desc }) => [desc(games.createdAt)],
    });
}
