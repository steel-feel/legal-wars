CREATE TYPE "public"."game_stage" AS ENUM('pending_stake', 'side_selection', 'initial_arguments', 'evidences_witnesses', 'final_arguments', 'judgment', 'completed');--> statement-breakpoint
CREATE TYPE "public"."game_status" AS ENUM('active', 'archived');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('game_invitation', 'opponent_staked', 'both_staked', 'side_selected', 'your_turn', 'opponent_submitted', 'judgment_delivered');--> statement-breakpoint
CREATE TYPE "public"."side" AS ENUM('prosecution', 'defense');--> statement-breakpoint
CREATE TYPE "public"."stage_type" AS ENUM('initial_arguments', 'evidences_witnesses', 'final_arguments');--> statement-breakpoint
CREATE TABLE "cases" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"prosecution_brief" text NOT NULL,
	"defense_brief" text NOT NULL,
	"evidences" jsonb NOT NULL,
	"witnesses" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "game_stages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_id" uuid NOT NULL,
	"player_id" uuid NOT NULL,
	"stage" "stage_type" NOT NULL,
	"side" "side" NOT NULL,
	"argument_text" text NOT NULL,
	"selected_evidences" jsonb,
	"selected_witnesses" jsonb,
	"submitted_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "games" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_id_onchain" varchar(66) NOT NULL,
	"creator_id" uuid NOT NULL,
	"opponent_id" uuid NOT NULL,
	"case_id" serial NOT NULL,
	"stake_amount" varchar(78) NOT NULL,
	"creator_staked" boolean DEFAULT false NOT NULL,
	"opponent_staked" boolean DEFAULT false NOT NULL,
	"prosecution_player_id" uuid,
	"defense_player_id" uuid,
	"side_picker_id" uuid,
	"current_stage" "game_stage" DEFAULT 'pending_stake' NOT NULL,
	"winner_id" uuid,
	"judgment_text" text,
	"status" "game_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "games_game_id_onchain_unique" UNIQUE("game_id_onchain")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" uuid NOT NULL,
	"game_id" uuid,
	"type" "notification_type" NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wallet_address" varchar(42) NOT NULL,
	"privy_did" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "players_wallet_address_unique" UNIQUE("wallet_address"),
	CONSTRAINT "players_privy_did_unique" UNIQUE("privy_did")
);
--> statement-breakpoint
ALTER TABLE "game_stages" ADD CONSTRAINT "game_stages_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_stages" ADD CONSTRAINT "game_stages_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_creator_id_players_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_opponent_id_players_id_fk" FOREIGN KEY ("opponent_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_case_id_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."cases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_prosecution_player_id_players_id_fk" FOREIGN KEY ("prosecution_player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_defense_player_id_players_id_fk" FOREIGN KEY ("defense_player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_side_picker_id_players_id_fk" FOREIGN KEY ("side_picker_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_winner_id_players_id_fk" FOREIGN KEY ("winner_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE no action ON UPDATE no action;