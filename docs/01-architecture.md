# System Architecture & Overview

## 1. What this application is

Zio Money Admin is a **Backend-for-Frontend (BFF) admin panel** for a money-transfer
/ remittance business. It gives back-office staff and partner agents a single-page,
tab-based workspace to:

- Manage remittance **partners** (agents), their credit limits and balances
- Configure **exchange rates**, **service charges**, **margins**, and **commissions**
- Run **KYC approval** workflows and **compliance risk** rule setup
- Create and query remittance **transfers/transactions**
- Manage **users, roles, and privileges**
- Produce **reports** (daily, summary, audit, correspondence)

The app itself owns no business database. It is a **thin Next.js proxy + UI
layer** in front of two upstream microservices, with a built‑in **demo/static
data mode** for local development and screenshots.

## 2. Tech stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 14](https://nextjs.org/) (App Router), React 18, TypeScript 5 |
| Styling | Tailwind CSS 3 (+ PostCSS/Autoprefixer), CSS custom properties for theming |
| Icons | `lucide-react` |
| Fonts | `next/font/google` (Plus Jakarta Sans) |
| State management | React Context (no Redux/Zustand) — see [State management](#5-state-management) |
| Client-side persistence | `localStorage` via `lib/persist.ts` |
| Testing | [Vitest](https://vitest.dev/) (`lib/transferMath.test.ts`) |
| Backend | **None owned by this repo** — proxies to two external REST APIs (see below) |

## 3. High-level architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (React app)                       │
│                                                                    │
│  AppShell (tab workspace)                                         │
│   ├─ Sidebar / Topbar / TabBar                                    │
│   └─ TabbedWorkspace → renders tabRegistry[key].component         │
│                                                                    │
│  React Contexts (AuthContext, DataModeContext, PartnersContext,    │
│  RatesContext, KycContext, ComplianceRuleContext, VouchersContext, │
│  BeneficiariesContext, NotificationsContext, ThemeContext, …)      │
│                                                                    │
│  lib/*Api.ts  (typed wrappers: authApi, partnersApi, rateApi,     │
│  kycApi, transferApi, beneficiaryApi, complianceRuleApi, …)       │
│         │  fetch()                                                 │
└─────────┼───────────────────────────────────────────────────────┘
          │  same-origin, relative URLs (/api/...)
          ▼
┌─────────────────────────────────────────────────────────────────┐
│         Next.js Route Handlers  (app/api/**/route.ts)             │
│         — the BFF / proxy layer, runs server-side only            │
│                                                                     │
│   app/api/auth/proxy.ts            → proxyAuthRequest()            │
│   app/api/remittance-proxy.ts      → proxyRemittanceRequest()      │
│                                                                     │
│   Forwards method/body/Authorization header untouched, normalizes │
│   upstream errors into the shared { success, message, data,       │
│   errorCode, timestamp } envelope.                                 │
└─────────┬───────────────────────────────────────┬─────────────────┘
          │ AUTH_API_BASE_URL                       │ REMIT_API_BASE_URL
          ▼                                         ▼
┌───────────────────────┐               ┌─────────────────────────────┐
│   Auth Service (REST)  │               │   Remittance Service (REST)  │
│   login / refresh /     │               │   partners, rates, KYC,      │
│   logout / validate     │               │   compliance, transfers,     │
│                          │               │   beneficiaries, agent files │
└───────────────────────┘               └─────────────────────────────┘
```

**Key architectural decisions:**

- **The browser never talks to the upstream APIs directly.** Every call goes to
  a same-origin `/api/...` Next.js Route Handler first. This keeps
  `AUTH_API_BASE_URL` / `REMIT_API_BASE_URL` server-side secrets (they never
  reach the client bundle) and gives the app one place to normalize errors.
- **Bearer tokens are forwarded, not minted.** The Next.js server does not
  issue its own JWTs — the Auth Service is the source of truth. The BFF simply
  forwards whatever `Authorization` header the client sends.
- **A single response envelope.** Every upstream endpoint is expected to
  return `{ success, message, data, errorCode, timestamp }` (see
  `lib/apiClient.ts`'s `ApiResponse<T>`), and the proxy layer synthesizes that
  same shape when the upstream is unreachable or returns non-JSON.

## 4. Demo mode vs. Live mode

`contexts/DataModeContext.tsx` exposes a `DataMode` of `"static" | "live"`:

- **`static` (default in development):** components read from hard-coded mock
  data under `data/*.ts` and mutate local React state only — nothing is
  persisted server-side. Login accepts any user from `data/authData.ts`.
- **`live`:** components call the real `lib/*Api.ts` wrappers, which hit the
  `/api/...` proxy routes described above.

This toggle is only available when `NODE_ENV !== "production"`
(`DATA_MODE_TOGGLE_ALLOWED`) — a production build is hard-locked into `live`
mode so real users are never shown fabricated demo data. See
`components/DataModeToggle.tsx` and the toggle in `Topbar.tsx`.

Many feature areas (transfers, partners, rates, KYC, compliance, beneficiaries)
have a matching Context (e.g. `PartnersContext`, `RatesContext`) that branches
internally on `useDataMode().isLive` to decide whether to read mock arrays or
call the live API wrapper — so panel components themselves are unaware of the
mode.

## 5. State management

There is no global store library. State is composed from nested **React
Context providers**, mounted once in `app/layout.tsx` / `AppShell.tsx`:

```
ThemeProvider
  └─ DataModeProvider
       └─ AuthProvider
            └─ (inside AppShell) TabsProvider, PartnersProvider,
               RatesProvider, KycProvider, ComplianceRuleProvider,
               BeneficiariesProvider, VouchersProvider,
               NotificationsProvider, ToastProvider, ...
```

- **`AuthContext`** — current user, tokens, login/logout, and (in live mode)
  resolves the signed-in agent's own partner record for its settlement
  currency.
- **`DataModeContext`** — the static/live switch described above.
- **`TabsContext`** (`data/tabRegistry.tsx` + `contexts/TabsContext.tsx`) —
  drives the tab-based "single page app" navigation model: the sidebar opens
  keys from `tabRegistry`, and `TabbedWorkspace` renders the matching
  component with breadcrumbs.
- **Feature contexts** (`PartnersContext`, `RatesContext`, `KycContext`,
  `ComplianceRuleContext`, `BeneficiariesContext`, `VouchersContext`,
  `NotificationsContext`) — each owns fetching/caching for one domain area and
  exposes CRUD-style actions to panels.
- **`ToastContext`** — global toast/snackbar notifications.
- **`lib/useAsyncQuery.ts` / `lib/useAsyncMutation.ts`** — small generic hooks
  used by contexts/components to run an async call with `loading`/`error`
  state, without pulling in a data-fetching library like React Query.

Client-side persistence (session + demo overrides) goes through
`lib/persist.ts`, a thin `localStorage` JSON wrapper used by `AuthContext`,
`DataModeContext`, and others.

## 6. Navigation model

This is **not** a traditional multi-route app. Aside from `/login` (and the
root `/`), navigation happens entirely client-side via tabs:

- `data/staticData.ts` defines the sidebar's `navGroups` (labels + optional
  `tabKey` + nested `submenu`).
- `data/tabRegistry.tsx` maps each `tabKey` to a `{ title, breadcrumb,
  component, closable }` entry — this is the single source of truth for
  "what screen renders for this menu item."
- Clicking a sidebar item opens (or focuses) a tab; `TabbedWorkspace` renders
  `tabRegistry[activeKey].component`.
- `lib/sidebarPrivileges.ts` flattens `navGroups` into a checkable tree, reused
  by the role/privilege editor (`ManageRolesPanel`) so role permissions always
  mirror the real menu structure.

## 7. Project directory structure

```
app/
  layout.tsx                 Root layout: fonts, theme-flash-prevention script,
                              mounts Theme/DataMode/Auth providers
  page.tsx                   Renders <AppShell /> (the entire app)
  login/page.tsx              Login screen
  global.css                  Tailwind entry + design tokens
  api/                         BFF route handlers (see 03-api-reference.md)
    auth/                       login, logout, refresh, validate, proxy.ts
    partners/[action]/          partner CRUD/lookup/credit actions
    rates/[action]/             exchange rate / service charge / commission / margin actions
    kyc/[action]/                KYC approval workflow actions
    compliance-rules/[action]/   compliance rule CRUD
    agent-files/[action]/        agent file upload/list/content
    transactions/[action]/       transaction query actions ("Track B")
    beneficiaries/, beneficiaries/[id]/   beneficiary REST resource
    transfers/, transfers/[id]/, transfers/[id]/cancel/, transfers/ref/[referenceNumber]/
                                  transfer REST resource ("Track A")
    remittance-proxy.ts          shared proxy helper for the Remittance API

components/                  ~150 React components: one file per screen/panel/
                              modal/form-field, named after the feature it renders
  auth/                        Login screen building blocks
  AppShell.tsx, Sidebar.tsx, Topbar.tsx, TabBar.tsx, TabbedWorkspace.tsx,
  Breadcrumbs.tsx              App chrome / tab-workspace shell
  *Panel.tsx                   Feature screens (one per tabRegistry entry)
  *Modal.tsx                   Dialogs (confirm delete, KYC approval, ledger detail, …)
  *Form.tsx / *Field.tsx        Shared form building blocks (TextField, SelectField,
                                DateField, Checkbox, RadioPill, ...)

contexts/                    React Context providers — one per cross-cutting
                              concern or domain area (see §5 above)

data/                        Mock/demo data, TypeScript types for every domain
                              model, and static UI config (nav items, tab
                              registry, dropdown options). See 04-data-model.md.

lib/                         Framework-agnostic logic:
  apiClient.ts                 fetchWithAuth() — auth header + 401 refresh/retry
  apiResource.ts                createActionApi() / createPathApi() factories
  authApi.ts, authToken.ts      login/refresh/validate + localStorage token helpers
  partnersApi.ts, rateApi.ts, kycApi.ts, transferApi.ts, beneficiaryApi.ts,
  complianceRuleApi.ts, agentFileApi.ts    one typed wrapper module per domain,
                                            calling the matching app/api route
  transferMath.ts               pure rate/fee/commission/margin calculation
  transferMath.test.ts           Vitest unit tests for the above
  persist.ts                    localStorage JSON helpers
  format.ts, time.ts             formatting utilities
  useAsyncQuery.ts, useAsyncMutation.ts, useConfirmedRemittances.ts, useTransfers.ts
                                  small reusable data-fetching hooks
  sidebarPrivileges.ts           derives the role-privilege tree from staticData
  exportExcel.ts                  client-side CSV/Excel export helper
  currencyNames.ts, flagEmoji.ts  currency code → display name / flag helpers

config/
  businessRules.ts             Feature flags gating unconfirmed backend
                                behavior (see §8 below)

docs/                         This documentation set
```

## 8. Notable design decisions & caveats

- **`config/businessRules.ts`** centralizes every flag that gates a piece of
  business logic that is **not yet confirmed against the real backend**
  (e.g. whether Partner Offer Rate + Margin Setup form the real
  wholesale/retail split, or whether the plain exchange-rate table alone is
  the source of truth). These are meant to be flipped exactly once, when the
  backend contract is confirmed — not scattered duplicate booleans.
- **Two parallel transaction concepts exist**, per the upstream API's own
  documented shapes:
  - **"Track A"** — `POST/GET /transfers` (`data/transferData.ts`,
    `lib/transferApi.ts`) — a Spring-style paginated REST resource.
  - **"Track B"** — action-style endpoints under `/transactions/*`
    (`data/transactionData.ts`) such as `viewTransaction`,
    `getAllUnapprovedRemittances`. Whether these are two genuinely separate
    flows or two unmerged generations of the same feature is an open
    question for the backend team.
- Fields suffixed **`MOCKONLY`** (e.g. `feeAmountMOCKONLY`,
  `rateBreakdownMOCKONLY`) exist only to make the demo/static experience
  complete and are explicitly called out in code comments as not part of the
  real upstream schema.
