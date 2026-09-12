# API & Module Reference

This app has two kinds of "API" worth documenting:

1. **BFF routes** — the Next.js Route Handlers under `app/api/**`, which the
   browser actually calls. These are thin proxies onto the upstream Auth and
   Remittance services.
2. **Library modules** — the `lib/*Api.ts` typed wrapper functions that
   components/contexts call, which in turn call the BFF routes above.

All BFF responses (except `GET /api/auth/validate`) share this envelope,
defined in `lib/apiClient.ts`:

```ts
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  errorCode: string | null;
  timestamp: string;
}
```

## 1. Proxy infrastructure

### `app/api/auth/proxy.ts` — `proxyAuthRequest(path, options)`

Forwards a request to `${AUTH_API_BASE_URL}${path}`.

| Param | Type | Notes |
|---|---|---|
| `path` | `string` | Upstream path, e.g. `/api/auth/login` |
| `options.method` | `"GET" \| "POST"` | |
| `options.body` | `string?` | Raw JSON text, forwarded as-is |
| `options.authorization` | `string \| null` | Forwarded verbatim as `Authorization` header (login/refresh take none — credentials travel in the body) |

Returns `500` if `AUTH_API_BASE_URL` is unset, `502` if the upstream is
unreachable, and synthesizes an `ApiResponse` envelope if the upstream
returns non-JSON.

### `app/api/remittance-proxy.ts` — `proxyRemittanceRequest(path, options)`

Same shape as above, but targets `${REMIT_API_BASE_URL}${path}` and — unlike
the auth proxy — **requires** `options.authorization`; if absent, it
short-circuits with:

```json
{ "success": false, "message": "Not authenticated.", "data": null, "errorCode": "MISSING_BEARER_TOKEN", "timestamp": "..." }
```
(HTTP 401, without ever calling upstream).

## 2. Auth routes (`app/api/auth/**`)

| Route | Method | Upstream | Auth header required | Purpose |
|---|---|---|---|---|
| `/api/auth/login` | POST | `POST /api/auth/login` | No | Exchange username/password for a token pair |
| `/api/auth/logout` | POST | `POST /api/auth/logout` | Yes (forwarded) | Invalidate the session server-side |
| `/api/auth/refresh` | POST | `POST /api/auth/refresh` | No | Exchange a refresh token for a new token pair |
| `/api/auth/validate` | GET | `GET /api/auth/validate` | Yes | Validate an access token, returning username/roles. **Not wrapped in `ApiResponse`** — returns `{ valid, username, roles, error }` directly |

Client wrapper: **`lib/authApi.ts`**

```ts
login(username: string, password: string): Promise<ApiResponse<TokenPair>>
refreshToken(refreshTokenValue: string): Promise<ApiResponse<TokenPair>>
logout(accessToken: string): Promise<ApiResponse<Record<string, never>>>
validateToken(accessToken: string): Promise<ValidateResult | null>

interface TokenPair { accessToken: string; refreshToken: string; expiresIn: number; tokenType: string }
interface ValidateResult { valid: boolean; username: string; roles: string[]; error: string | null }
```

`authApi.ts` uses plain `fetch` (not `fetchWithAuth`), since login/refresh
must work with no existing token.

## 3. Partner routes — `app/api/partners/[action]/route.ts`

`GET /api/partners/{action}` or `POST /api/partners/{action}` → dispatches to
one upstream Remittance API path:

| Action | Method | Upstream path | Wrapper (`lib/partnersApi.ts`) |
|---|---|---|---|
| `register` | POST | `/insertRemittancePartner` | `insertRemittancePartner(payload)` |
| `list` | GET | `/obtainAllRemittancePartner` | `listRemittancePartners()` |
| `lookup` | POST | `/obtainRemittancePartner` | `lookupRemittancePartner(userName)` |
| `info` | POST | `/getRemittancePartnerInfo` | `getRemittancePartnerInfo(userName)` |
| `update-credit-limit` | POST | `/updateCreditLimit` | `updateCreditLimit(childUserName, amount, description)` |
| `add-actual-balance` | POST | `/addActualBalance` | `addActualBalance(childUserName, amount, description)` |
| `update-email` | POST | `/updateRemittancePartnerEmail` | `updateRemittancePartnerEmail(userName, email)` |
| `update-accept-pin` | POST | `/updateRemittancePartnerAcceptPin` | `updateRemittancePartnerAcceptPin(userName, acceptPartnerPin)` |
| `insert-txn-currency` | POST | `/insertRemittancePartnerTxnCurrency` | `insertRemittancePartnerTxnCurrency(remittancePartnerUserName, txnCurrency)` |
| `insert-country` | POST | `/insertRemittancePartnerCountry` | `insertRemittancePartnerCountry(remittancePartnerUserName, destCountry)` |
| `insert-agent-partner` | POST | `/insertAgentPartner` | `insertAgentPartner()` — registers the fixed default agent, no payload |
| `change-password` | POST | `/changeRemittancePartnerPassword` | `changeRemittancePartnerPassword(userName, newPassword)` |
| `insert-payout-config` | POST | `/insertRemittancePayoutPartnerConfiguration` | `insertRemittancePayoutPartnerConfiguration(payload)` |
| `get-payout-config` | POST | `/obtainRemittancePayoutPartnerConfiguration` | `obtainRemittancePayoutPartnerConfiguration(remittancePartnerUserName)` |
| `update-payout-config` | POST | `/updateRemittancePayoutPartnerConfiguration` | `updateRemittancePayoutPartnerConfiguration(payload)` |
| `payout-bank-update` | POST | `/requestPayoutBankUpdate` | `requestPayoutBankUpdate(payload)` |
| `payout-partner-networks` | GET | `/getPayoutPartner` | `getPayoutPartner()` — response shape is ambiguous upstream; treat `data` as `unknown` |

**Payload/record shapes** (`lib/partnersApi.ts`):

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

## 4. Rate / commission / margin routes — `app/api/rates/[action]/route.ts`

| Action | Method | Upstream path |
|---|---|---|
| `get-all-countries` | GET | `/getAllCountries` |
| `get-country-wise-ex-rate` | POST | `/getCountryWiseExRate` |
| `update-rate` | POST | `/UpdateRate` |
| `update-csv-rate` | POST | `/UpdateCsvRate` |
| `get-service-charge` | GET | `/getServiceCharge` |
| `get-se-rate` | GET | `/GetSeRate` |
| `service-charges-save` | POST | `/Service_Charges_save` |
| `service-charges-insert` | POST | `/Service_Charges_Insert` |
| `update-csv-file-for-countries` | POST | `/UpdateCsvfileForCountries` |
| `obtain-partner-commission` | POST | `/obtainRemittancePartnerCommission` |
| `insert-or-update-partner-commission` | POST | `/insertOrUpdateRemittancePartnerCommission` |
| `obtain-all-pending-partner-offer-rates` | GET | `/obtainAllPendingPartnerOfferRates` |
| `add-or-update-margin` | POST | `/addOrUpdateMargin` |
| `obtain-partner-rates` | POST | `/obtainRemittancePartnerRates` |
| `obtain-partner-all-rates` | POST | `/obtainRemittancePartnerAllRates` |
| `insert-partner-rates` | POST | `/insertRemittancePartnerRates` |
| `confirm-partner-rate` | POST | `/confirmRemittancePartnerRate` |
| `cancel-partner-rate` | POST | `/cancelRemittancePartnerRate` |

Wrapper: **`lib/rateApi.ts`** (mirrors each action 1:1; see `data/exchangeRateData.ts`,
`data/partnerOfferRateData.ts`, `data/marginSetupData.ts`,
`data/partnerCommissionData.ts` for the associated record types).

## 5. KYC routes — `app/api/kyc/[action]/route.ts`

| Action | Method | Upstream path | Purpose |
|---|---|---|---|
| `update-customer` | POST | `/updateCustomer` | Update customer/KYC details |
| `approve` | POST | `/InsertApprovedKYC` | Approve a KYC application |
| `compliance-approve` | POST | `/InsertApprovedCompilenceKYC` | Compliance-team KYC approval |
| `approved` | GET | `/getAllapprovedKycs` | List approved KYCs |
| `pending` | GET | `/getAllUnapprovedKycs` | List pending KYCs |
| `compliance-hold` | GET | `/getAllCompilenceHoldKycs` | List KYCs on compliance hold |

Wrapper: **`lib/kycApi.ts`**, consumed by `contexts/KycContext.tsx` and
rendered by `KycApprovalQueuePanel`, `ApprovedKycsPanel`, `KycApprovalModal`.

## 6. Compliance rule routes — `app/api/compliance-rules/[action]/route.ts`

| Action | Method | Upstream path |
|---|---|---|
| `add` | POST | `/addComplianceRule` |
| `update` | POST | `/updateComplianceRule` |
| `delete` | POST | `/deleteComplianceRule` |
| `list` | POST | `/obtainComplianceRule` |
| `add-value` | POST | `/addComplianceRuleValue` |
| `update-value` | POST | `/updateComplianceRuleValue` |
| `value-specific` | POST | `/obtainComplianceRuleValueSpecific` |
| `value-specific-country` | POST | `/obtainComplianceRuleValueSpecificCountry` |

Wrapper: **`lib/complianceRuleApi.ts`**, consumed by
`contexts/ComplianceRuleContext.tsx` and `ComplianceRulesSetupPanel` /
`ComplianceRuleValuesPanel`.

## 7. Agent file routes — `app/api/agent-files/[action]/route.ts`

| Action | Method | Upstream path |
|---|---|---|
| `list` | POST | `/obtainFileUploadedByAgent` |
| `content` | POST | `/obtainFileContentByFileName` |

Wrapper: **`lib/agentFileApi.ts`**, used by `AgentFileUploadPanel`.

## 8. Transaction query routes ("Track B") — `app/api/transactions/[action]/route.ts`

| Action | Method | Upstream path |
|---|---|---|
| `view-transaction` | POST | `/viewTransaction` |
| `by-staff` | POST | `/getTransactionByStaff` |
| `by-ref-no` | POST | `/getRemittanceByrefno` |
| `latest-by-username` | POST | `/getRemittanceByUsernamefrompartners` |
| `compliance-holds` | GET | `/getAllCompileHoldRemittance` |
| `unconfirmed-admin` | GET | `/getAllUnapprovedRemittances` |
| `unconfirmed-partner` | GET | `/getAllUnapprovedRemittances2` |
| `confirmed` | GET | `/getAllConformedRemittances` |

Wrapper: **`lib/transactionApi.ts`**, used by `TransactionQueryPanel`,
`UnconfirmedListPanel`, `UnconfirmedListPartnerApiPanel`,
`ComplianceTxnHoldsPanel`, `PendingTransactionPanel`.

> See [Architecture §8](./01-architecture.md#8-notable-design-decisions--caveats)
> — this is a **separate** data model from the `/transfers` resource below
> ("Track A"), confirmed as two distinct upstream shapes.

## 9. Beneficiary REST resource

| Route | Method | Upstream | Purpose |
|---|---|---|---|
| `/api/beneficiaries` | GET | `GET /beneficiaries` | List beneficiaries |
| `/api/beneficiaries` | POST | `POST /beneficiaries` | Create a beneficiary |
| `/api/beneficiaries/{id}` | GET | `GET /beneficiaries/{id}` | Get one beneficiary |
| `/api/beneficiaries/{id}` | DELETE | `DELETE /beneficiaries/{id}` | Delete a beneficiary |

Wrapper: **`lib/beneficiaryApi.ts`**, consumed by
`contexts/BeneficiariesContext.tsx` and `BeneficiariesPanel`.

## 10. Transfer REST resource ("Track A")

| Route | Method | Upstream | Purpose |
|---|---|---|---|
| `/api/transfers` | GET | `GET /transfers?page&size&sort` | Paginated transfer list (Spring `Page<T>` shape) |
| `/api/transfers` | POST | `POST /transfers` | Create a transfer |
| `/api/transfers/{id}` | GET | `GET /transfers/{id}` | Get one transfer by numeric id |
| `/api/transfers/{id}/cancel` | PUT | `PUT /transfers/{id}/cancel` | Cancel a transfer |
| `/api/transfers/ref/{referenceNumber}` | GET | `GET /transfers/ref/{referenceNumber}` | Get one transfer by reference number |

Wrapper: **`lib/transferApi.ts`**:

```ts
insertTransfer(payload: TransferInsertPayload): Promise<ApiResponse<TransferRecord>>
listTransfers(params: { page: number; size: number; sort?: string }): Promise<ApiResponse<PagedTransfers<TransferRecord>>>
getTransferById(id: number): Promise<ApiResponse<TransferRecord>>
getTransferByRef(referenceNumber: string): Promise<ApiResponse<TransferRecord>>
cancelTransfer(id: number): Promise<ApiResponse<TransferRecord>>
```

See [04-data-model.md](./04-data-model.md#transfer-track-a) for
`TransferInsertPayload` / `TransferRecord` field definitions.

## 11. Shared client-side library modules

### `lib/apiClient.ts`

- `ApiResponse<T>` — the shared response envelope (see top of this document).
- `fetchWithAuth(url, init)` — the single fetch primitive every `lib/*Api.ts`
  wrapper (except `authApi.ts`) goes through. Attaches
  `Authorization: Bearer <accessToken>`, and on an `HTTP 401`:
  1. If there was no token to begin with, returns the 401 as-is (lets the
     caller handle it — this is not necessarily an expired session).
  2. Otherwise, attempts exactly one silent token refresh
     (coalescing concurrent 401s into a single in-flight refresh call), retries
     the original request with the new token, and if the refresh itself
     fails, calls `endSession()` (clears stored auth state, dispatches the
     `"zio:session-expired"` window event that `AuthContext` listens for, and
     sets a one-shot `sessionStorage` flag `LoginForm` reads to show a
     "session expired" notice).
- `consumeSessionExpiredFlag()` — reads and clears that one-shot flag.

### `lib/apiResource.ts`

Two factory functions used to build every domain-specific `lib/*Api.ts` module:

- `createActionApi(basePath, networkErrorMessage)` — for action-name-style
  resources (`kyc`, `rates`, `partners`, `compliance-rules`, `agent-files`,
  `transactions`): returns a `callAction<T>(action, { method, body })`
  function that POSTs/GETs `${basePath}/${action}`.
- `createPathApi(basePath, networkErrorMessage)` — for REST-path-style
  resources (`beneficiaries`, `transfers`): returns a `callPath<T>(path,
  init?)` function that requests `${basePath}${path}` directly.

Both route through `fetchWithAuth` and normalize any non-JSON/network failure
into an `ApiResponse` with `success: false`.

### `lib/authToken.ts`

`localStorage` helpers reading/writing the same `zio-auth-state` entry that
`AuthContext` persists to — needed because plain `lib/*Api.ts` functions run
outside React and can't call `useAuth()`.

```ts
getAccessToken(): string | null
getRefreshToken(): string | null
setStoredTokens(tokens: TokenPair): void   // after a successful refresh
clearStoredAuthState(): void               // wipes the session
```

### `lib/transferMath.ts`

Pure, framework-agnostic calculation module — no I/O, fully unit-tested in
`lib/transferMath.test.ts`. This is the single source of truth for
rate/fee/commission/margin math, shared by the live transfer-send flow and
the admin approval/report views.

| Function | Purpose |
|---|---|
| `convertAmount(amount, sourceCurrency, destinationCurrency, rates, allowCrossCurrency?)` | Converts an amount between currencies via the home-currency (`NPR`)-quoted rate table. Handles Foreign→NPR, NPR→Foreign, and (if enabled) Foreign→Foreign triangulation. Returns `null` if the required rate(s) are missing. |
| `isCrossCurrencyCorridor(source, destination)` | `true` when neither currency is the home currency |
| `resolveWholesaleRate(input)` | Looks up a CONFIRMED Partner Offer Rate for a corridor — only when `WHOLESALE_RETAIL_SPLIT_CONFIRMED` |
| `resolveFee(input)` | Resolves the transfer fee — currently the mock-only `feeAmountMOCKONLY` field until `SERVICE_FEE_SOURCE_CONFIRMED` |
| `resolveCommissionRate(sourceCurrency, destinationCountry, amount, commissions)` | Resolves the agent's commission as a decimal rate, normalizing FLAT commissions to an equivalent rate |
| `resolveMargin(input)` | Looks up the payout-side Margin Setup row for `(targetPartner, destinationCurrency, deliveryOption)` |
| `calculateTransfer(input): CalculateTransferResult` | The full breakdown: `retailRate`, `wholesaleRate`, `fee`, `totalToPay`, `receiverAmount`, `fxSpread`, `commission`, `marginRate`, `netEarning` |
| `getOrComputeBreakdown(transfer, context)` | Returns a transfer's stored `rateBreakdownMOCKONLY` snapshot if present, else recomputes live via `calculateTransfer` — shared by `TransfersPanel`'s detail view and the Transaction Rate Report |

### Other `lib/` utilities

| Module | Purpose |
|---|---|
| `lib/persist.ts` | `loadState<T>(key)` / `saveState<T>(key, value)` — JSON `localStorage` wrapper |
| `lib/format.ts` | Currency/number/date display formatting helpers |
| `lib/time.ts` | Date/time helpers |
| `lib/useAsyncQuery.ts` | Generic `{ data, loading, error }` hook for a single async fetch |
| `lib/useAsyncMutation.ts` | Generic hook for a triggered async action (create/update/delete) with loading/error state |
| `lib/useConfirmedRemittances.ts` | Hook for loading confirmed remittances (Track B) |
| `lib/useTransfers.ts` | Hook wrapping `lib/transferApi.ts` for list/paginate/cancel flows |
| `lib/sidebarPrivileges.ts` | Flattens `data/staticData.ts`'s `navGroups` into a `PrivilegeGroup[]` tree, and `allPrivilegeIds()` to enumerate every leaf id — used by the role/privilege editor |
| `lib/exportExcel.ts` | Client-side table → CSV/Excel export |
| `lib/currencyNames.ts` | Currency code → display name lookup |
| `lib/flagEmoji.ts` | Country/currency code → flag emoji lookup |

## 12. Feature flags — `config/businessRules.ts`

| Flag | Default | Meaning when `true` |
|---|---|---|
| `WHOLESALE_RETAIL_SPLIT_CONFIRMED` | `false` | Partner Offer Rate is the wholesale rate; the matching Margin Setup rate is layered on top to derive the retail rate. When `false`, `getCountryWiseExRate`'s buying/selling is the sole source of truth and Partner Offer Rate/Margin Setup are not consulted. |
| `SERVICE_FEE_SOURCE_CONFIRMED` | `false` | `resolveFee` uses a real confirmed fee field/endpoint. When `false`, it reads the mock-only `feeAmountMOCKONLY` field and logs a one-time console warning. |
| `ALLOW_CROSS_CURRENCY_CONVERSION` | `true` | Enables foreign→foreign triangulated conversion in `convertAmount`/`calculateTransfer`. |
| `SELF_APPROVAL_RESTRICTION_ENABLED` | `false` | Restricts a maker-checker approval flow (`PartnerOfferRateApprovals`) so a proposer cannot approve/cancel their own proposal (except admins, always exempt). Loosened while real roles aren't yet confirmed against the live auth service. |

These are intentionally the **only** place such flags live — do not add
equivalent booleans elsewhere; flip these once the corresponding backend
contract is confirmed.
