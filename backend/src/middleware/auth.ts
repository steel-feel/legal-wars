import { Elysia } from "elysia";
import { PrivyClient } from "@privy-io/server-auth";
import { db } from "../db/db";
import { players } from "../db/schema";
import { eq } from "drizzle-orm";

const privyAppId = process.env.PRIVY_APP_ID;
const privyAppSecret = process.env.PRIVY_APP_SECRET;

if (!privyAppId || !privyAppSecret) {
    throw new Error("PRIVY_APP_ID and PRIVY_APP_SECRET must be set");
}

const privyClient = new PrivyClient(privyAppId, privyAppSecret);

export const authMiddleware = new Elysia({ name: "auth" }).derive(
    async ({ headers, set }) => {
        const authHeader = headers["authorization"];

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            set.status = 401;
            throw new Error("Missing or invalid Authorization header");
        }

        const token = authHeader.replace("Bearer ", "");

        try {
            const verifiedClaims = await privyClient.verifyAuthToken(token);
            const privyDid = verifiedClaims.userId;

            // Get user's linked wallet
            const user = await privyClient.getUser(privyDid);
            const wallet = user.linkedAccounts.find(
                (account) => account.type === "wallet"
            );

            if (!wallet || !("address" in wallet)) {
                set.status = 400;
                throw new Error("No wallet linked to this Privy account");
            }

            const walletAddress = wallet.address.toLowerCase();

            // Upsert player
            const existingPlayer = await db.query.players.findFirst({
                where: eq(players.privyDid, privyDid),
            });

            let player;
            if (existingPlayer) {
                player = existingPlayer;
            } else {
                const [newPlayer] = await db
                    .insert(players)
                    .values({
                        privyDid,
                        walletAddress,
                    })
                    .onConflictDoUpdate({
                        target: players.privyDid,
                        set: { walletAddress },
                    })
                    .returning();
                player = newPlayer;
            }

            return { player };
        } catch (error: any) {
            if (error.message?.includes("Missing") || error.message?.includes("No wallet")) {
                throw error;
            }
            set.status = 401;
            throw new Error("Invalid or expired token");
        }
    }
);
