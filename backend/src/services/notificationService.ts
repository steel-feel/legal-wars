import { db } from "../db/db";
import { notifications } from "../db/schema";
import { eq, and, desc } from "drizzle-orm";

type NotificationType =
    | "game_invitation"
    | "opponent_staked"
    | "both_staked"
    | "side_selected"
    | "your_turn"
    | "opponent_submitted"
    | "judgment_delivered";

/**
 * Create a notification for a player
 */
export async function createNotification(
    playerId: string,
    type: NotificationType,
    title: string,
    message: string,
    gameId?: string
) {
    const [notification] = await db
        .insert(notifications)
        .values({
            playerId,
            type,
            title,
            message,
            gameId: gameId || null,
        })
        .returning();

    return notification;
}

/**
 * Get all notifications for a player (newest first)
 */
export async function getPlayerNotifications(
    playerId: string,
    limit: number = 50,
    unreadOnly: boolean = false
) {
    const conditions = [eq(notifications.playerId, playerId)];
    if (unreadOnly) {
        conditions.push(eq(notifications.read, false));
    }

    return db.query.notifications.findMany({
        where: and(...conditions),
        orderBy: [desc(notifications.createdAt)],
        limit,
    });
}

/**
 * Get unread notification count for a player
 */
export async function getUnreadCount(playerId: string): Promise<number> {
    const unread = await db.query.notifications.findMany({
        where: and(
            eq(notifications.playerId, playerId),
            eq(notifications.read, false)
        ),
    });
    return unread.length;
}

/**
 * Mark a single notification as read
 */
export async function markAsRead(notificationId: string, playerId: string) {
    const [updated] = await db
        .update(notifications)
        .set({ read: true })
        .where(
            and(
                eq(notifications.id, notificationId),
                eq(notifications.playerId, playerId)
            )
        )
        .returning();

    return updated;
}

/**
 * Mark all notifications as read for a player
 */
export async function markAllAsRead(playerId: string) {
    await db
        .update(notifications)
        .set({ read: true })
        .where(
            and(
                eq(notifications.playerId, playerId),
                eq(notifications.read, false)
            )
        );
}

// ─── Game event notification helpers ─────────────────────────────────────────

export async function notifyGameInvitation(
    opponentId: string,
    creatorWallet: string,
    stakeAmount: string,
    gameId: string
) {
    return createNotification(
        opponentId,
        "game_invitation",
        "⚔️ New Game Challenge!",
        `You've been challenged by ${creatorWallet} to a Legal Wars match! Stake: ${stakeAmount} alphaUSD. Accept by staking on-chain.`,
        gameId
    );
}

export async function notifyOpponentStaked(
    playerId: string,
    stakerWallet: string,
    gameId: string
) {
    return createNotification(
        playerId,
        "opponent_staked",
        "💰 Opponent Staked",
        `${stakerWallet} has staked their alphaUSD. Waiting for your stake to begin the trial.`,
        gameId
    );
}

export async function notifyBothStaked(
    playerId: string,
    gameId: string,
    isSidePicker: boolean
) {
    const message = isSidePicker
        ? "Both players have staked! You've been chosen to pick your side — prosecution or defense."
        : "Both players have staked! Waiting for your opponent to choose sides.";

    return createNotification(
        playerId,
        "both_staked",
        "🎲 Case Assigned!",
        message,
        gameId
    );
}

export async function notifySideSelected(
    playerId: string,
    assignedSide: string,
    gameId: string
) {
    return createNotification(
        playerId,
        "side_selected",
        "⚖️ Sides Chosen",
        `You are playing as the ${assignedSide}. The trial begins — submit your initial arguments!`,
        gameId
    );
}

export async function notifyYourTurn(
    playerId: string,
    stage: string,
    gameId: string
) {
    const stageNames: Record<string, string> = {
        initial_arguments: "Initial Arguments",
        evidences_witnesses: "Evidence & Witnesses",
        final_arguments: "Final Arguments",
    };

    return createNotification(
        playerId,
        "your_turn",
        "📝 Your Turn!",
        `It's time for ${stageNames[stage] || stage}. Submit your arguments now.`,
        gameId
    );
}

export async function notifyOpponentSubmitted(
    playerId: string,
    stage: string,
    gameId: string
) {
    const stageNames: Record<string, string> = {
        initial_arguments: "Initial Arguments",
        evidences_witnesses: "Evidence & Witnesses",
        final_arguments: "Final Arguments",
    };

    return createNotification(
        playerId,
        "opponent_submitted",
        "📋 Opponent Submitted",
        `Your opponent has submitted their ${stageNames[stage] || stage}. Your turn if you haven't already.`,
        gameId
    );
}

export async function notifyJudgmentDelivered(
    playerId: string,
    isWinner: boolean,
    gameId: string
) {
    const title = isWinner ? "🏆 Victory!" : "⚖️ Verdict Delivered";
    const message = isWinner
        ? "The AI judge ruled in your favor! Your winnings have been sent to your wallet."
        : "The AI judge has delivered the verdict. Unfortunately, the ruling was not in your favor this time.";

    return createNotification(
        playerId,
        "judgment_delivered",
        title,
        message,
        gameId
    );
}
