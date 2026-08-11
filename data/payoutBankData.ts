// Fields accepted by POST /requestPayoutBankUpdate — confirmed against the
// Swagger doc. This is NCHL (Nepal Clearing House) bank/branch reference
// data, upserted by id (0/omitted = insert, existing id = update). It is NOT
// scoped to a remittance partner — no userName field exists on this payload.
export interface PayoutBankUpdatePayload {
  id: number;
  payoutBank: string;
  nchlBankId: number;
  payoutBankBranch: string;
  nchlBankBranchId: number;
}

export type PayoutBankRecord = PayoutBankUpdatePayload;

export function emptyPayoutBankPayload(): PayoutBankUpdatePayload {
  return {
    id: 0,
    payoutBank: "",
    nchlBankId: 0,
    payoutBankBranch: "",
    nchlBankBranchId: 0,
  };
}
