# Database Schema

## There is no application database

This repository **does not own, run, or migrate a database**. It is a
Next.js BFF/UI layer in front of two external REST services (the Auth API and
the Remittance API — see [01-architecture.md](./01-architecture.md)), which
own their own persistence out of scope for this repo.

What follows instead is the **domain data model** as understood by the
frontend: the TypeScript interfaces in `data/*.ts` that describe (a) the
shape of upstream request/response payloads, confirmed against the API
documentation where noted, and (b) demo/mock records used in Static mode.

> **Reading the comments matters here.** Several fields are explicitly marked
> `MOCKONLY` (present only for the demo experience, stripped before reaching
> the real endpoint — see `lib/rateApi.ts`) or `UNCONFIRMED with backend`
> (an educated guess pending confirmation of the real API contract). Treat
> those as flagged, not authoritative.

## Entity relationship overview

```
Partner (RemittancePartnerRecord)
  ├─ has many → PayoutPartnerConfigRecord   (payout configuration)
  ├─ has many → PayoutBankRecord             (payout bank details)
  ├─ has many → CommissionRecord             (per corridor: sendCurrency + destinationCountry)
  ├─ has many → PartnerOfferRateRecord       (wholesale rate proposals, maker-checker)
  └─ is the "agentName"/"targetPartner" referenced by:
        ServiceChargeRecord, MarginRecord

ExchangeRateRecord (per currency symbol)      ─┐
PartnerOfferRateRecord (per corridor)          ├─ feed lib/transferMath.ts's
ServiceChargeRecord (per country+agent+method) ├─ calculateTransfer() to
MarginRecord (per partner+currency+method)     ├─ produce a TransferRateBreakdown
CommissionRecord (per currency+country)       ─┘

Beneficiary (BeneficiaryApiRecord + client-only fields)
  └─ referenced by → TransferRecord.beneficiaryId

TransferRecord ("Track A", /transfers)          ─┐  two distinct,
RemittanceTransactionRecord ("Track B", /transactions/*) ┘  unmerged shapes

CustomerRecord / KycRecord (KYC & customer profile)
  └─ referenced informally by Beneficiary.beneficiaryKycStatus

ComplianceRule
  └─ has many → ComplianceRuleValue (per country/agent override)
```

## Core entities

### Partner — `data/partnerData.ts`, `lib/partnersApi.ts`

```ts
interface InsertRemittancePartnerPayload {
  userName: string; partnerCode: string; description: string;
  partnerCountry: string; partnerAddress: string; remitterType: string;
  settlementCurrency: string; acceptPartnerPin: boolean; apiUser: boolean; email: string;
}
interface RemittancePartnerRecord extends InsertRemittancePartnerPayload {
  id: number; balance: number; accountBalance: number;
  registeredDate: string; updatedDate: string;
}
```
The root entity for every agent/partner in the system. `settlementCurrency`
determines what currency the partner's own transactions are quoted from.

### Payout configuration — `data/payoutConfigData.ts`, `data/payoutBankData.ts`

```ts
interface PayoutPartnerConfigPayload { /* per-partner payout channel settings */ }
interface PayoutPartnerConfigRecord extends PayoutPartnerConfigPayload { /* + server fields */ }

interface PayoutBankUpdatePayload { /* bank details for payout */ }
type PayoutBankRecord = PayoutBankUpdatePayload;
```

### Exchange rate — `data/exchangeRateData.ts`

```ts
// Response — GET /getAllCountries, POST /getCountryWiseExRate
interface ExchangeRateItem {
  symbol: string; currency: string; currencyAcro: string; countryName: string;
  unit: number; buying: number; selling: number; flag: string;
}

// Request — POST /UpdateRate, POST /UpdateCsvRate
interface ExchangeRateUpsertPayload {
  symbol: string; countryName: string; currencyName: string;
  unit: number; buying: number; selling: number; flag: string;
  countryIsoCode: string; priority: number; active: boolean;
  partnerNameMOCKONLY: string;   // form-only, stripped before the real call
  setupTypeMOCKONLY: SetupType;  // "COUNTRY" | "PARTNER" | "THIRD_PARTY_AGENT"
}
interface ExchangeRateRecord extends ExchangeRateUpsertPayload {
  id: number; createdDate: string; updatedDate: string;
}
```
`buying`/`selling` are quoted **against the home currency** (`NPR`) — see
`HOME_CURRENCY` in `lib/transferMath.ts`. `unit` is the currency unit the
rate is quoted per (e.g. rate per 100 JPY).

### Service charge — `data/serviceChargeData.ts`

```ts
interface ServiceChargeUpsertPayload {
  id: number; countrySymbol: string; agentName: string; deliveryOption: string;
  active: boolean; setupTypeMOCKONLY: SetupType;
}
interface ServiceChargeRecord extends ServiceChargeUpsertPayload {
  createdDate: string; updatedDate: string;
  feeAmountMOCKONLY: number;  // stand-in — real schema has no fee-amount field yet
}
```
Despite the field name `countrySymbol`, seeded values are **currency codes**
(e.g. `INR`, `NPR`), not country names.

### Margin — `data/marginSetupData.ts`

```ts
interface MarginUpsertPayload {
  id: number; targetPartner: string; service: string; remittanceType: string;
  marginRate: number; marginRateWrtParent: number; marginType: string; // "PERCENT" | "FLAT"
  marginBindString: string; // destination currency, e.g. "INR"
  expiryDate: string; status: string; // "ACTIVE" | "INACTIVE" | "EXPIRED"
}
interface MarginRecord extends MarginUpsertPayload { createdDate: string }
```
A margin row binds to a payout corridor by `(targetPartner,
marginBindString, service)` — a payout-side markup applied regardless of
which currency the sender sent from. Only consulted when
`WHOLESALE_RETAIL_SPLIT_CONFIRMED` is `true`.

### Partner commission — `data/partnerCommissionData.ts`

```ts
type CommissionType = "PERCENT" | "FLAT"; // "FLAT" unconfirmed with backend

interface CommissionUpsertPayload {
  userName: string; commissionRate: number; commissionType: CommissionType;
  service: string; sendCurrency: string; destinationCountry: string; remittanceType: string;
}
interface CommissionRecord {
  id: number; remittancePartner: string; commissionRate: number; commissionType: CommissionType;
  service: string; sendCurrency: string; destinationCountry: string; remittanceType: string;
}
```

### Partner offer rate (wholesale rate, maker-checker) — `data/partnerOfferRateData.ts`

```ts
type QuoteType = "DIRECT";
type OfferRateStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

interface PartnerOfferRateRecord {
  id: number; uniqueId: string; remittancePartner: string;
  sendCurrency: string; receiveCurrency: string; destCountry: string;
  sendCurrencyPerUsd: number; receiveCurrencyPerUsd: number;
  directQuote: number; rate: number; quoteType: QuoteType; status: OfferRateStatus;
  makerUser: string; checkerUser: string | null;
  createdDateTime: string; updatedDateTime: string;
}
```
Follows a **maker-checker** workflow: one user proposes (`makerUser`), a
different user confirms/cancels (`checkerUser`) via
`confirmRemittancePartnerRate` / `cancelRemittancePartnerRate`. Self-approval
is normally blocked (`SELF_APPROVAL_RESTRICTION_ENABLED` in
`config/businessRules.ts`, currently loosened for testing).

### Beneficiary — `data/beneficiaryData.ts`

```ts
// Real API shape (GET/POST /beneficiaries)
interface BeneficiaryApiRecord {
  id: number; username: string; fullName: string; email: string; phone: string;
  bankName: string; bankBranch: string; accountNumber: string; country: string;
  relationship: string; createdAt: string; updatedAt: string;
}

// UI-facing shape: API fields + client-only fields merged in after fetch
interface Beneficiary extends BeneficiaryApiRecord {
  senderUserName: string;      // not a backend field — tracked client-side only
  beneficiaryKycStatus: KycStatus;
}

interface AddBeneficiaryPayload {
  fullName: string; accountNumber: string; bankName: string; country: string;
  phone: string; email: string; bankBranch: string; relationship: string;
}
```

### Transfer — "Track A" — `data/transferData.ts`

```ts
interface TransferInsertPayload {
  beneficiaryId: number; amount: number; sourceCurrency: string;
  destinationCurrency: string; destinationCountry: string; purpose: string; remarks: string;
}

interface TransferRecord extends TransferInsertPayload {
  id: number; referenceNumber: string; senderName: string; receiverName: string;
  status: string; // no confirmed enum; expected PENDING/CONFIRMED/PAID/CANCELLED
  provider: string; providerReference: string;
  exchangeRate: number; fee: number; totalAmount: number; receiverAmount: number;
  createdAt?: string; updatedAt?: string;
  rateBreakdownMOCKONLY?: TransferRateBreakdown; // demo-only creation-time snapshot
}

interface PagedTransfers<T> { // Spring Page<T> shape
  content: T[]; totalPages: number; totalElements: number;
  number: number; size: number; first: boolean; last: boolean; empty: boolean;
}
```

### Transaction — "Track B" — `data/transactionData.ts`

```ts
type TxnStatus = "INSERTED" | "CONFIRMED" | "CANCELLED" | "PAID";

interface RemittanceTransactionRecord { /* fields returned by viewTransaction / getAllUnapprovedRemittances etc. */ }
interface ViewTransactionPayload { /* POST /viewTransaction request */ }
interface StaffTransactionPayload { /* POST /getTransactionByStaff request */ }
interface TransactionByRefPayload { /* POST /getRemittanceByrefno request */ }
interface PartnerLatestTransactionPayload { /* POST /getRemittanceByUsernamefrompartners request */ }
```
See [Architecture §8](./01-architecture.md#8-notable-design-decisions--caveats)
for why this exists alongside `TransferRecord` as a separate, unmerged shape.

### KYC / Customer — `data/kycData.ts`

```ts
type KycStatus = "NOT_VERIFIED" | "COMPLIANCE_HOLD" | "VERIFIED" | "REJECTED";

// Fields accepted by POST /updateCustomer
interface CustomerRecord {
  userName: string; fullName: string; firstName: string; middleName: string; lastName: string;
  gender: string; dob: string; nationality: string; emailAddress: string;
  mobileNo: string; telephoneNo: string; sourceOfincome: string; occupation: string;
  zipCode: string; prefecture: string; city: string; town: string; streetAddress: string;
  primaryIdNo: string; primaryIdIssueDate: string; primaryIdExpiryDate: string;
  secondaryIdNo: string; remarks: string;
}

interface KycApprovalFields { /* additional fields required by approve endpoints */ }
type ApproveKycPayload = Omit<CustomerRecord, "remarks"> & KycApprovalFields;
interface KycRecord extends CustomerRecord { /* + status/workflow fields */ }
interface KycApiRecord { /* raw upstream shape before normalization */ }
```

### Compliance rule — `data/complianceRuleData.ts`

```ts
type ComplianceRuleDirection = "SEND" | "RECEIVE";

interface ComplianceRule {
  id: number; ruleName: string; identifier: string; criteria: string;
  dataType: string; field: string; direction: ComplianceRuleDirection; deleted: boolean;
}
type ComplianceRulePayload = Omit<ComplianceRule, "id" | "deleted">;

// Response uses `ruleIdentifier`; normalized to `complianceRuleIdentifier`
// everywhere downstream via normalizeRuleValue() to avoid the mismatch leaking
// into forms/tables.
interface ComplianceRuleValue {
  id: number; ruleIdentifier: string; direction: ComplianceRuleDirection;
  value: string; country: string; agent: string;
}
interface NormalizedComplianceRuleValue {
  id: number; complianceRuleIdentifier: string; direction: ComplianceRuleDirection;
  value: string; country: string; agent: string;
}
```

## Other supporting models (`data/*.ts`)

| File | Key types | Used by |
|---|---|---|
| `countryCurrencyData.ts` | `CountryCurrencyRecord`, `CountryCurrencyUpsertPayload` | `CountryCurrencyPanel` |
| `riskProfilingData.ts` | `HighRiskManagementRow`, `RiskBand`, `RiskScoreRow`, `TransactionFrequencyRule`, `BranchRiskRow` | Risk-profiling panels (High Risk Countries/Management, Payment Mode, Age Group, etc.) |
| `securityData.ts` | `DaysExceededTxnRow`, `AuditLogEntry` | `DaysExceededTxnPanel`, `AuditTranLogPanel` |
| `userManagementData.ts` | `HeadOfficeUserRow`, `RoleRecord` | User/role management panels |
| `remittanceListsData.ts` | `UnconfirmedListRow`, `UnpaidTransactionRow`, `PendingTransactionRow` | Transfers list panels |
| `voucherEntryData.ts` | `VoucherLine`, `VoucherStatus`, `VoucherLogEntry` | Voucher entry/approval |
| `ledgerData.ts` | `LedgerEntry` | Ledger panels |
| `creditLimitData.tsx` | `CreditLimitEntry` | Credit limit panels |
| `statementOfAccountData.ts`, `statementOfAccountReportData.ts` | `SoaBatchLogEntry`, `SoaTransaction`, `SoaReportDetail` | Statement of Account panels |
| `correspondenceReportData.ts` | `PartnerSummaryRow`, `DailyTransactionRow`, `DailyTransactionGroup` | Correspondence/summary reports |
| `reportWriterData.ts` | `ReportColumn`, `ReportParam`, `SavedReport` | Report Writer / Report List |
| `agentFileData.ts` | `AgentFileLine` | Agent file upload/list |
| `notificationsData.ts` | `NotificationEntry` | `NotificationsPanel` |
| `authData.ts` | `MockUser` | Static-mode login |
| `staticData.ts` | `NavItem`, `NavGroup`, `NavSubItem`, `BreadcrumbItem` | Sidebar / breadcrumbs |
| `tabRegistry.tsx` | `TabRegistryEntry` | Tab-based navigation (see [01-architecture.md §6](./01-architecture.md#6-navigation-model)) |

## Response envelope (applies to nearly every upstream call)

```ts
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  errorCode: string | null;
  timestamp: string;
}
```
Defined once in `lib/apiClient.ts` and expected from every Remittance/Auth
API endpoint except `GET /api/auth/validate`, which returns
`{ valid, username, roles, error }` directly.
