# Setup & Installation

## Prerequisites

- **Node.js** 18.18+ (Next.js 14 requirement) — Node 20 LTS recommended
- **npm** (the project ships a `package-lock.json`; use npm rather than
  yarn/pnpm to keep the lockfile consistent)
- Network access to the upstream Auth and Remittance APIs **only if** you
  intend to run in Live mode (see below) — Static/demo mode needs no backend
  at all

## 1. Clone the repository

```bash
git clone <repository-url>
cd zio-money-app
```

## 2. Install dependencies

```bash
npm install
```

## 3. Configure environment variables

Copy the example env file and fill in the two upstream API base URLs:

```bash
cp .env.local.example .env.local
```

`.env.local`:

```bash
# Bare host root + gateway service prefix for the Remittance API.
REMIT_API_BASE_URL=http://93.127.185.212/api/remittance

# Bare host root for the Auth API.
AUTH_API_BASE_URL=http://93.127.185.212
```

> **Important:** these are **server-only** variables (no `NEXT_PUBLIC_`
> prefix) — they are read exclusively inside `app/api/**/route.ts` handlers
> (`app/api/auth/proxy.ts`, `app/api/remittance-proxy.ts`) and are never sent
> to the browser. If either is unset, the corresponding proxy route returns
> `HTTP 500 { success: false, message: "... API is not configured on the
> server." }` instead of crashing.
>
> Point these at your own Auth/Remittance service instances for local
> development against a real backend, or leave them as-is and just use
> **Static mode** (see below), which needs no backend at all.

## 4. Run the project locally

```bash
npm run dev
```

Open **http://localhost:3000**. You'll land on `/login`.

### Signing in

- **Static (demo) mode** — the default outside production. Enter any
  username/password pair defined in `data/authData.ts`'s mock user list. No
  network calls are made; the whole app runs on in-memory/`localStorage` mock
  data.
- **Live mode** — toggle "Live" via the switch in the top bar
  (`DataModeToggle`, only visible when `NODE_ENV !== "production"`), then log
  in with real credentials. This calls `POST /api/auth/login`, which the
  server proxies to `AUTH_API_BASE_URL + /api/auth/login`.

The static/live toggle itself is **disabled in production builds** —
`npm run build && npm start` always runs in Live mode, so a deployed instance
never shows fabricated data to a real user.

## 5. Available scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Next.js dev server (hot reload) on port 3000 |
| `npm run build` | Production build (`next build`) |
| `npm start` | Serve the production build (`next start`) — requires `npm run build` first |
| `npm run lint` | Run `next lint` (ESLint) |
| `npm test` | Run the Vitest unit test suite (`vitest run`) |

## 6. Running tests

```bash
npm test
```

This runs `lib/transferMath.test.ts` against the pure calculation functions in
`lib/transferMath.ts` (rate conversion, fee/commission/margin resolution,
`calculateTransfer`). No environment variables or network access are needed
for tests — the math functions are pure and take all data as arguments.

## 7. Type checking

There's no dedicated `typecheck` script; use the TypeScript compiler directly
if you want a standalone check outside of `next build`:

```bash
npx tsc --noEmit
```

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `Auth API is not configured on the server.` (HTTP 500) | `AUTH_API_BASE_URL` missing from `.env.local` | Set it and restart `npm run dev` |
| `Remittance API is not configured on the server.` (HTTP 500) | `REMIT_API_BASE_URL` missing | Same as above |
| `Not authenticated.` / `MISSING_BEARER_TOKEN` on a Remittance API call | No access token in `localStorage`, but the app is in Live mode | Log in again in Live mode; static-mode sessions carry no token by design |
| Live-mode login succeeds but every panel 401s | Upstream host unreachable / wrong base URL | Verify `REMIT_API_BASE_URL`/`AUTH_API_BASE_URL` are correct and reachable from the server running `next dev`/`next start` |
| Env var changes have no effect | Next.js only reads `.env.local` at server start | Restart the dev/prod server after editing `.env.local` |
