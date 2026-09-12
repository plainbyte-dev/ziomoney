# Deployment Guide

## 1. Build

```bash
npm install
npm run build
```

`next build` produces an optimized production build in `.next/`. Run this on
a machine/CI runner with network access to `npm`'s registry; it does **not**
need access to `AUTH_API_BASE_URL`/`REMIT_API_BASE_URL` at build time (those
are only read at request time inside route handlers).

## 2. Test before deploying

```bash
npm run lint     # ESLint via next lint
npm test         # Vitest — lib/transferMath.test.ts
npx tsc --noEmit # Type-check (no dedicated script; run directly)
```

Run these in CI as a gate before any deploy. There is no end-to-end/UI test
suite in this repo — manually verify the golden paths (login, opening a few
tabs in both Static and Live mode) against a staging build before promoting
to production.

## 3. Required environment variables

| Variable | Required | Description |
|---|---|---|
| `AUTH_API_BASE_URL` | Yes | Base URL of the Auth Service (e.g. `https://auth.internal.example.com`) |
| `REMIT_API_BASE_URL` | Yes | Base URL of the Remittance Service, including its gateway prefix (e.g. `https://gateway.internal.example.com/api/remittance`) |

Set these in your hosting platform's environment configuration (not
`.env.local`, which is for local development only and is git-ignored). Both
are read server-side only, inside `app/api/auth/proxy.ts` and
`app/api/remittance-proxy.ts` — never exposed to the browser bundle.

`npm run build` will succeed even without these set; a **deployed instance**
missing either one will return `HTTP 500` from every route that needs it,
so treat them as deploy-blocking, not optional.

## 4. Production behavior differences

- The Static/Live data-mode toggle (`components/DataModeToggle.tsx`) is
  automatically disabled when `NODE_ENV === "production"` — production always
  runs in **Live mode**, talking to the real upstream services. There is no
  extra flag to set; this falls out of `next build`/`next start` setting
  `NODE_ENV=production` automatically.
- Confirm both upstream base URLs are reachable **from the server**, not just
  from your local machine — a common misconfiguration is an internal-only
  hostname that resolves on a dev laptop's VPN but not from the production
  host/container network.

## 5. Running the production server

```bash
npm start
```

This runs `next start`, serving the build from step 1 on port 3000 by
default (override with `-p <port>` or the `PORT` env var). Put this behind a
reverse proxy (nginx, an ALB, etc.) for TLS termination in production.

### Process management

Run `npm start` under a process supervisor so it restarts on crash and boots
on server restart — e.g.:

```bash
# pm2 example
pm2 start npm --name "zio-money-admin" -- start
pm2 save
```

Or containerize it (see below) and let your orchestrator (Docker
Compose/Kubernetes/ECS/etc.) manage the process lifecycle instead.

## 6. Containerized deployment (recommended pattern)

There is no `Dockerfile` checked into this repository. If you containerize
it, a standard Next.js multi-stage build looks like:

```dockerfile
# syntax=docker/dockerfile:1
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
CMD ["npm", "start"]
```

Pass `AUTH_API_BASE_URL` / `REMIT_API_BASE_URL` as runtime environment
variables to the container (`docker run -e AUTH_API_BASE_URL=... -e
REMIT_API_BASE_URL=...`), not baked into the image — they can differ per
environment (staging vs. production) without a rebuild.

> Note: this project has no `output: "standalone"` set in `next.config.js`.
> If you adopt the Dockerfile pattern above, either add
> `output: "standalone"` to `next.config.js` for a smaller final image, or
> keep the `node_modules`/`.next` copy shown above, which works without it.

## 7. Platform-specific notes

- **Vercel:** works out of the box with zero config beyond setting
  `AUTH_API_BASE_URL` / `REMIT_API_BASE_URL` as project environment
  variables (Production + Preview). No `vercel.json` is required.
- **Any Node host (VM, ECS, etc.):** follow steps 1–5 above directly.
- **Static export is not an option** — this app relies on server-side API
  Route Handlers (`app/api/**`) as a BFF proxy layer, which requires a
  running Node server; `next export` is not applicable here.

## 8. Post-deploy smoke test checklist

After deploying, verify:

- [ ] `/login` loads and the Static/Live toggle is **absent** (confirms
      `NODE_ENV=production` took effect)
- [ ] Logging in with real credentials succeeds (`POST /api/auth/login` →
      `200`, not `500 Auth API is not configured on the server.`)
- [ ] At least one Remittance-backed panel loads data (e.g. Partner Info,
      Exchange Rates) without a `401 MISSING_BEARER_TOKEN` or `500` error
- [ ] Token refresh works: leave a tab open past `expiresIn` and confirm a
      subsequent action doesn't force an unexpected logout
- [ ] Browser devtools show no `AUTH_API_BASE_URL`/`REMIT_API_BASE_URL`
      values leaking into any client-side request or bundle
