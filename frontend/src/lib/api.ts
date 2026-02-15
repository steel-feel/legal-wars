import { treaty } from "@elysiajs/eden";
import type { App } from "@backend/index";

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

/**
 * Create an Eden Treaty client for the Legal Wars backend.
 * This is un-authenticated — each hook adds the auth header per-request.
 */
export const api = treaty<App>(API_URL);

export type ApiClient = typeof api;
