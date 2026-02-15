# ⚖️ Legal Wars API Documentation

Base URL: `http://localhost:3000`

## Authentication

All routes (except `/`) require a **Privy bearer token** in the `Authorization` header:

```
Authorization: Bearer <privy_access_token>
```

The backend verifies the token via Privy's server SDK, extracts the user's linked wallet address, and upserts a player record.

---

## Endpoints

### Health Check

```
GET /
```

**Response:**
```json
{ "success": true, "message": "⚖️ Legal Wars API is running!", "version": "1.0.0" }
```

---

### Games

#### Create Game

```
POST /games
```

Creates a new game and challenges an opponent. Both players must then stake alphaUSD on-chain.

**Body:**
```json
{
  "opponentWalletAddress": "0x...",
  "stakeAmount": "1000000000000000000"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "game": { "id": "uuid", "gameIdOnchain": "0x...", "currentStage": "pending_stake", ... },
    "gameIdOnchain": "0x...",
    "message": "Game created! Share the gameIdOnchain with your opponent."
  }
}
```

---

#### List My Games

```
GET /games
```

Returns all games where the authenticated player is creator or opponent.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "currentStage": "initial_arguments",
      "creator": { "walletAddress": "0x..." },
      "opponent": { "walletAddress": "0x..." },
      "case": { "title": "..." },
      ...
    }
  ]
}
```

---

#### Get Game Details

```
GET /games/:id
```

Returns full game details including case info and all stage submissions.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "currentStage": "evidences_witnesses",
    "creator": { ... },
    "opponent": { ... },
    "case": { "title": "...", "evidences": [...], "witnesses": [...] },
    "stages": [
      { "stage": "initial_arguments", "side": "prosecution", "argumentText": "...", ... }
    ]
  }
}
```

---

#### Select Side

```
POST /games/:id/select-side
```

Only the designated side-picker (randomly chosen after staking) can call this.

**Body:**
```json
{
  "side": "prosecution"  // or "defense"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "prosecutionPlayerId": "uuid",
    "defensePlayerId": "uuid",
    "message": "You chose prosecution. The game advances to Initial Arguments!"
  }
}
```

---

#### Submit Stage

```
POST /games/:id/submit-stage
```

Submit arguments, evidence, and witnesses for the current stage. Both players must submit before the game advances.

**Body:**
```json
{
  "argumentText": "Your honor, the evidence clearly shows...",
  "selectedEvidences": ["USB access logs showing 2.3GB transfer", "Code similarity report"],
  "selectedWitnesses": ["Dr. James Liu — TechCorp CTO"]
}
```

> `selectedEvidences` and `selectedWitnesses` are optional but recommended during the `evidences_witnesses` stage.

**Response:**
```json
{
  "success": true,
  "data": {
    "submission": { "id": "uuid", "stage": "initial_arguments", "side": "prosecution", ... },
    "message": "Stage submission recorded successfully"
  }
}
```

---

#### Trigger Judgment

```
POST /games/:id/judge
```

Manually trigger the AI judge. Only available when the game is in the `judgment` stage (auto-triggered when both players complete final arguments).

**Response:**
```json
{
  "success": true,
  "data": {
    "winnerId": "uuid",
    "judgment": "This court finds in favor of the prosecution...",
    "reasoning": "The prosecution presented compelling evidence...",
    "message": "Judgment delivered! The case has been resolved."
  }
}
```

---

### Cases

#### List All Cases

```
GET /cases
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "TechCorp vs. InnovateLabs — Trade Secret Theft",
      "description": "...",
      "prosecutionBrief": "...",
      "defenseBrief": "...",
      "evidences": ["..."],
      "witnesses": ["..."]
    }
  ]
}
```

---

#### Get Case by ID

```
GET /cases/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "TechCorp vs. InnovateLabs — Trade Secret Theft",
    ...
  }
}
```

---

### Notifications

#### List Notifications

```
GET /notifications?limit=50&unread_only=true
```

Returns notifications for the authenticated player (newest first).

| Query Param | Type | Default | Description |
|-------------|------|---------|-------------|
| `limit` | string | `"50"` | Max results to return |
| `unread_only` | string | `"false"` | Set to `"true"` to get only unread |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "game_invitation",
      "title": "⚔️ New Game Challenge!",
      "message": "You've been challenged by 0x... to a Legal Wars match!",
      "read": false,
      "gameId": "uuid",
      "createdAt": "2026-02-15T12:00:00Z"
    }
  ]
}
```

---

#### Unread Count

```
GET /notifications/unread-count
```

**Response:**
```json
{ "success": true, "data": { "count": 3 } }
```

---

#### Mark Notification as Read

```
PATCH /notifications/:id/read
```

**Response:**
```json
{ "success": true, "data": { "id": "uuid", "read": true, ... } }
```

---

#### Mark All as Read

```
POST /notifications/read-all
```

**Response:**
```json
{ "success": true, "message": "All notifications marked as read" }
```

---

#### Notification Types

| Type | Triggered When |
|------|---------------|
| `game_invitation` | Opponent creates a game challenging you |
| `opponent_staked` | The other player stakes their alphaUSD |
| `both_staked` | Both players have staked; case assigned |
| `side_selected` | Sides have been chosen (prosecution/defense) |
| `your_turn` | A new stage begins, time to submit arguments |
| `opponent_submitted` | Your opponent submitted their stage entry |
| `judgment_delivered` | AI judge has delivered the final verdict |

---

## Game Flow


```
1. POST /games                    → Create game (stage: pending_stake)
2. Both players stake on-chain    → Backend detects Staked events
3. Backend assigns case + side-picker → (stage: side_selection)
4. POST /games/:id/select-side   → Pick prosecution/defense (stage: initial_arguments)
5. POST /games/:id/submit-stage  → Both submit (stage → evidences_witnesses)
6. POST /games/:id/submit-stage  → Both submit (stage → final_arguments)
7. POST /games/:id/submit-stage  → Both submit (stage → judgment)
8. AI Judge delivers verdict      → Contract resolves, winner gets 2x stake
```

## Game Stages

| Stage | Description |
|-------|-------------|
| `pending_stake` | Waiting for both players to stake alphaUSD on-chain |
| `side_selection` | Random player picks prosecution or defense |
| `initial_arguments` | Both sides present opening arguments |
| `evidences_witnesses` | Present evidence and call witnesses |
| `final_arguments` | Closing arguments |
| `judgment` | AI judge reviews transcript and delivers verdict |
| `completed` | Game archived, funds released to winner |

## Error Codes

| Status | Description |
|--------|-------------|
| `400` | Bad request / validation error |
| `401` | Missing or invalid auth token |
| `403` | Not authorized for this action |
| `404` | Resource not found |

## Eden Treaty (Frontend)

For type-safe API calls from the frontend:

```typescript
import { treaty } from "@elysiajs/eden";
import type { App } from "legal-wars-backend/src/index";

const api = treaty<App>("localhost:3000");

// Fully typed!
const { data } = await api.games.index.get({
  headers: { authorization: "Bearer <token>" }
});
```
