// ─── Game Stages ──────────────────────────────────────────────────────────────
export type GameStageType =
    | "pending_stake"
    | "side_selection"
    | "initial_arguments"
    | "evidences_witnesses"
    | "final_arguments"
    | "judgment"
    | "completed";

export type Side = "prosecution" | "defense";

export type StageType =
    | "initial_arguments"
    | "evidences_witnesses"
    | "final_arguments";

export type NotificationType =
    | "game_invitation"
    | "opponent_staked"
    | "both_staked"
    | "side_selected"
    | "your_turn"
    | "opponent_submitted"
    | "judgment_delivered";

// ─── Entities ─────────────────────────────────────────────────────────────────
export interface Player {
    id: string;
    walletAddress: string;
    privyDid: string;
    createdAt: string;
}

export interface Case {
    id: number;
    title: string;
    description: string;
    prosecutionBrief: string;
    defenseBrief: string;
    evidences: string[];
    witnesses: string[];
    createdAt: string;
}

export interface GameStageSubmission {
    id: string;
    gameId: string;
    playerId: string;
    stage: StageType;
    side: Side;
    argumentText: string;
    selectedEvidences: string[] | null;
    selectedWitnesses: string[] | null;
    submittedAt: string;
}

export interface Game {
    id: string;
    gameIdOnchain: string;
    creatorId: string;
    opponentId: string;
    caseId: number | null;
    stakeAmount: string;
    creatorStaked: boolean;
    opponentStaked: boolean;
    prosecutionPlayerId: string | null;
    defensePlayerId: string | null;
    sidePickerId: string | null;
    currentStage: GameStageType;
    winnerId: string | null;
    judgmentText: string | null;
    status: "active" | "archived";
    createdAt: string;
    updatedAt: string;
    // Populated via relations
    creator?: Player;
    opponent?: Player;
    case?: Case | null;
    stages?: GameStageSubmission[];
}

export interface Notification {
    id: string;
    playerId: string;
    gameId: string | null;
    type: NotificationType;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
}

// ─── Stage display helpers ────────────────────────────────────────────────────
export const STAGE_LABELS: Record<GameStageType, string> = {
    pending_stake: "Pending Stake",
    side_selection: "Side Selection",
    initial_arguments: "Opening Arguments",
    evidences_witnesses: "Evidence & Witnesses",
    final_arguments: "Closing Arguments",
    judgment: "Awaiting Judgment",
    completed: "Completed",
};

export const STAGE_ORDER: GameStageType[] = [
    "pending_stake",
    "side_selection",
    "initial_arguments",
    "evidences_witnesses",
    "final_arguments",
    "judgment",
    "completed",
];
