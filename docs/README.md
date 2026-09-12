# Zio Money Admin — Documentation

Welcome to the documentation for **Zio Money Admin**, the internal admin panel for
managing money-transfer partners, exchange rates, compliance, KYC, and remittance
transactions.

This documentation is split into the following guides:

| Guide | Description |
|---|---|
| [01-architecture.md](./01-architecture.md) | System architecture, tech stack, and directory structure |
| [02-setup.md](./02-setup.md) | Cloning, installing, configuring, and running the project locally |
| [03-api-reference.md](./03-api-reference.md) | Every API route, action, and library module, with inputs/outputs |
| [04-data-model.md](./04-data-model.md) | Domain data models (no relational database — see note inside) |
| [05-deployment.md](./05-deployment.md) | Build, test, and production deployment guide |

## Quick facts

- **Framework:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Persistence:** No application database. This app is a Backend-for-Frontend
  (BFF) that proxies to two external REST services — an **Auth API** and a
  **Remittance API** — and (in demo mode) falls back to in-memory/`localStorage`
  mock data.
- **Testing:** Vitest (unit tests for calculation logic)
- **Entry point:** `app/page.tsx` renders a single-page, tab-based workspace
  (`AppShell`) — there is effectively one route (`/`) plus `/login`.
