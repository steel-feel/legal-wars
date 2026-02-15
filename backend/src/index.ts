import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { gameRoutes } from "./routes/games";
import { caseRoutes } from "./routes/cases";
import { notificationRoutes } from "./routes/notifications";
import { playerRoutes } from "./routes/players";
import { watchStakingEvents } from "./services/contractService";

const app = new Elysia()
  .use(cors())

  // Error handling
  .onError(({ error, set }) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error:", errorMessage);

    if (errorMessage.includes("Missing") || errorMessage.includes("Invalid or expired")) {
      set.status = 401;
      return { success: false, error: errorMessage };
    }

    if (errorMessage.includes("not found") || errorMessage.includes("Not found")) {
      set.status = 404;
      return { success: false, error: errorMessage };
    }

    if (errorMessage.includes("not a player") || errorMessage.includes("not the designated")) {
      set.status = 403;
      return { success: false, error: errorMessage };
    }

    set.status = 400;
    return { success: false, error: errorMessage };
  })

  // Health check
  .get("/", () => ({
    success: true,
    message: "⚖️ Legal Wars API is running!",
    version: "1.0.0",
  }))

  // Routes
  .use(gameRoutes)
  .use(caseRoutes)
  .use(notificationRoutes)
  .use(playerRoutes)

  .listen(process.env.PORT || 3000);

console.log(
  `⚖️ Legal Wars API is running at ${app.server?.hostname}:${app.server?.port}`
);

// Start watching for staking events from the smart contract
try {
  watchStakingEvents();
} catch (err) {
  console.warn("⚠️ Could not start staking event watcher:", err);
}

// Export type for Eden Treaty (frontend type-safe client)
export type App = typeof app;
