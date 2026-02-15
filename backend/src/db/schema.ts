import {
    pgTable,
    uuid,
    varchar,
    text,
    timestamp,
    boolean,
    serial,
    jsonb,
    pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const gameStageEnum = pgEnum("game_stage", [
    "pending_stake",
    "side_selection",
    "initial_arguments",
    "evidences_witnesses",
    "final_arguments",
    "judgment",
    "completed",
]);

export const gameStatusEnum = pgEnum("game_status", ["active", "archived"]);

export const sideEnum = pgEnum("side", ["prosecution", "defense"]);

export const stageTypeEnum = pgEnum("stage_type", [
    "initial_arguments",
    "evidences_witnesses",
    "final_arguments",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
    "game_invitation",
    "opponent_staked",
    "both_staked",
    "side_selected",
    "your_turn",
    "opponent_submitted",
    "judgment_delivered",
]);

// ─── Players ─────────────────────────────────────────────────────────────────

export const players = pgTable("players", {
    id: uuid("id").defaultRandom().primaryKey(),
    walletAddress: varchar("wallet_address", { length: 42 }).notNull().unique(),
    privyDid: varchar("privy_did", { length: 255 }).notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const playersRelations = relations(players, ({ many }) => ({
    createdGames: many(games, { relationName: "creator" }),
    opponentGames: many(games, { relationName: "opponent" }),
}));

// ─── Cases ───────────────────────────────────────────────────────────────────

export const cases = pgTable("cases", {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),
    prosecutionBrief: text("prosecution_brief").notNull(),
    defenseBrief: text("defense_brief").notNull(),
    evidences: jsonb("evidences").$type<string[]>().notNull(),
    witnesses: jsonb("witnesses").$type<string[]>().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Games ───────────────────────────────────────────────────────────────────

export const games = pgTable("games", {
    id: uuid("id").defaultRandom().primaryKey(),
    gameIdOnchain: varchar("game_id_onchain", { length: 66 }).notNull().unique(),
    creatorId: uuid("creator_id")
        .notNull()
        .references(() => players.id),
    opponentId: uuid("opponent_id")
        .notNull()
        .references(() => players.id),
    caseId: serial("case_id").references(() => cases.id),
    stakeAmount: varchar("stake_amount", { length: 78 }).notNull(),
    creatorStaked: boolean("creator_staked").default(false).notNull(),
    opponentStaked: boolean("opponent_staked").default(false).notNull(),
    prosecutionPlayerId: uuid("prosecution_player_id").references(
        () => players.id
    ),
    defensePlayerId: uuid("defense_player_id").references(() => players.id),
    sidePickerId: uuid("side_picker_id").references(() => players.id),
    currentStage: gameStageEnum("current_stage")
        .default("pending_stake")
        .notNull(),
    winnerId: uuid("winner_id").references(() => players.id),
    judgmentText: text("judgment_text"),
    status: gameStatusEnum("status").default("active").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const gamesRelations = relations(games, ({ one, many }) => ({
    creator: one(players, {
        fields: [games.creatorId],
        references: [players.id],
        relationName: "creator",
    }),
    opponent: one(players, {
        fields: [games.opponentId],
        references: [players.id],
        relationName: "opponent",
    }),
    case: one(cases, {
        fields: [games.caseId],
        references: [cases.id],
    }),
    stages: many(gameStages),
}));

// ─── Game Stages (submissions per stage per player) ──────────────────────────

export const gameStages = pgTable("game_stages", {
    id: uuid("id").defaultRandom().primaryKey(),
    gameId: uuid("game_id")
        .notNull()
        .references(() => games.id),
    playerId: uuid("player_id")
        .notNull()
        .references(() => players.id),
    stage: stageTypeEnum("stage").notNull(),
    side: sideEnum("side").notNull(),
    argumentText: text("argument_text").notNull(),
    selectedEvidences: jsonb("selected_evidences").$type<string[]>(),
    selectedWitnesses: jsonb("selected_witnesses").$type<string[]>(),
    submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

export const gameStagesRelations = relations(gameStages, ({ one }) => ({
    game: one(games, {
        fields: [gameStages.gameId],
        references: [games.id],
    }),
    player: one(players, {
        fields: [gameStages.playerId],
        references: [players.id],
    }),
}));

// ─── Notifications ───────────────────────────────────────────────────────────

export const notifications = pgTable("notifications", {
    id: uuid("id").defaultRandom().primaryKey(),
    playerId: uuid("player_id")
        .notNull()
        .references(() => players.id),
    gameId: uuid("game_id").references(() => games.id),
    type: notificationTypeEnum("type").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),
    read: boolean("read").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
    player: one(players, {
        fields: [notifications.playerId],
        references: [players.id],
    }),
    game: one(games, {
        fields: [notifications.gameId],
        references: [games.id],
    }),
}));

// ─── Type exports ────────────────────────────────────────────────────────────

export type Player = typeof players.$inferSelect;
export type NewPlayer = typeof players.$inferInsert;
export type Case = typeof cases.$inferSelect;
export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;
export type GameStage = typeof gameStages.$inferSelect;
export type NewGameStage = typeof gameStages.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
