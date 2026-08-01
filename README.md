# Zio Money — Admin Panel

A component-wise Next.js (App Router) rebuild of the Zio Money admin screens,
using static/mock data (no backend calls).

## Routes

- `/login` — Sign in
- `/register` — Create account
- `/` — Correspondence Report (filter form + expandable full-report results)
- `/ledger` — Ledger List (table, view/delete per row, bulk select + delete)
- `/ledger/create` — Create New Ledger (form)

## Structure

```
app/
  layout.tsx                 Root layout, loads global styles
  page.tsx                   Correspondence Report route
  login/page.tsx              Login route
  register/page.tsx           Register route
  ledger/
    page.tsx                 Ledger List route
    create/page.tsx          Create New Ledger route
  globals.css                Tailwind entry point

components/
  auth/
    AuthLayout.tsx             Split-screen shell (brand panel + form) shared by login/register
    AuthField.tsx               Text/email/password input with show/hide toggle
    LoginForm.tsx                Email + password, "Remember me", fake-auth submit
    RegisterForm.tsx             Name/email/company/password + confirm-password check
    SettlementFlowGraphic.tsx    Signature illustration: the 5-stage settlement flow

  AppShell.tsx                Shared shell: Sidebar + Topbar + Breadcrumbs + content
  Sidebar.tsx                 Left nav — active item is derived from the current route
  Topbar.tsx                  Search bar, language switch, notifications, profile
  Breadcrumbs.tsx              Renders whatever breadcrumb trail a page passes in

  # Correspondence Report
  CorrespondenceReportCard.tsx  Filter form; reveals ReportResults on "View Full Report"
  ReportResults.tsx             Toolbar + Active/Cancelled transaction lists
  ReportToolbar.tsx             Search, column-view tabs, "Customize" section toggles
  StageLegend.tsx                Colored-dot legend row
  TransactionCard.tsx            Expandable active-transaction row w/ 5-stage breakdown
  CancelledTransactionCard.tsx   Reversed-transaction row

  # Ledger
  LedgerListPanel.tsx           Owns selection/pagination/modal state for the list
  LedgerListHeader.tsx          Title, "Create Ledger" link, Bulk Delete / selection bar
  LedgerTable.tsx                Table with optional checkbox column + view/delete icons
  Pagination.tsx                 "Showing X-Y of Z" + page buttons
  ConfirmDeleteModal.tsx         Shared single/bulk delete confirmation dialog
  LedgerDetailModal.tsx          Read-only detail popup (eye icon)
  CreateLedgerForm.tsx           Create New Ledger form; "Save" returns to the list

  # Shared form inputs
  SelectField.tsx / DateField.tsx / TextField.tsx / RadioPill.tsx

data/
  staticData.ts       Nav items, user info, Correspondence Report breadcrumbs/options
  transactionsData.ts  Active/cancelled transaction mock data
  ledgerData.ts         Ledger entries, breadcrumbs, and create-form options
```

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Notes

- All data lives under `data/` — swap any of these files for real API calls later
  without touching the UI components.
- The sidebar's active state is computed from the current route (`usePathname`),
  so clicking "Ledger" highlights it and clicking "Accounts Detail" returns you to
  the Correspondence Report.
- Ledger List keeps its entries in local component state so bulk/single delete
  actually removes rows from the UI (resets on page refresh, since there's no backend).
- "Create Ledger" → Save simulates a save, then routes back to `/ledger`.
