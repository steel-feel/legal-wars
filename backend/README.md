# Elysia with Bun runtime

## Getting Started
To get started with this template, simply paste this command into your terminal:
```bash
bun create elysia ./elysia-example
```

## Development
To start the development server run:
```bash
bun run dev
```

Open http://localhost:3000/ with your browser to see the result.

## Getting Started

```bash
# 1. Copy and fill env vars
cp .env.example .env

# 2. Generate migrations
bun run db:generate

# 3. Run migrations
bun run db:migrate

# 4. Seed cases
bun run db:seed

# 5. Start dev server
bun run dev
```