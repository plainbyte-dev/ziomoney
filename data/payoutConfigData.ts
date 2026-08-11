// Fields accepted by POST /insertRemittancePayoutPartnerConfiguration and
// POST /updateRemittancePayoutPartnerConfiguration — same shape, insert vs.
// update is which endpoint it's sent to, not a different payload. Confirmed
// against the Swagger doc — no commissionType/settlementCurrency/channel
// list; payout method is exactly two booleans (cash vs. account credit),
// each with its own commission rate and limit.
export interface PayoutPartnerConfigPayload {
  remittancePartnerUserName: string;
  allowCash: boolean;
  allowAccountCredit: boolean;
  cashPayoutCommissionRate: number;
  accountPayoutCommissionRate: number;
  cashLimit: number;
  accountLimit: number;
}

// Response shape from POST /obtainRemittancePayoutPartnerConfiguration
export interface PayoutPartnerConfigRecord extends PayoutPartnerConfigPayload {
  id: number;
}

export function emptyPayoutPartnerConfigPayload(remittancePartnerUserName = ""): PayoutPartnerConfigPayload {
  return {
    remittancePartnerUserName,
    allowCash: false,
    allowAccountCredit: false,
    cashPayoutCommissionRate: 0,
    accountPayoutCommissionRate: 0,
    cashLimit: 0,
    accountLimit: 0,
  };
}
