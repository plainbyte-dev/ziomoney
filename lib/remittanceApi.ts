export interface InsertRemittancePartnerPayload {
  userName: string;
  partnerCode: string;
  description: string;
  partnerCountry: string;
  partnerAddress: string;
  remitterType: string;
  settlementCurrency: string;
  acceptPartnerPin: boolean;
  apiUser: boolean;
  email: string;
}

export interface InsertRemittancePartnerData extends InsertRemittancePartnerPayload {
  id: number;
  balance: number;
  accountBalance: number;
  registeredDate: string;
  updatedDate: string;
}

export interface InsertRemittancePartnerResponse {
  success: boolean;
  message: string;
  data: InsertRemittancePartnerData | null;
  errorCode: string | null;
  timestamp: string;
}

export async function insertRemittancePartner(
  payload: InsertRemittancePartnerPayload
): Promise<InsertRemittancePartnerResponse> {
  const res = await fetch("/api/partners", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);
  if (!data) {
    return {
      success: false,
      message: `Unexpected response from server (HTTP ${res.status}).`,
      data: null,
      errorCode: null,
      timestamp: new Date().toISOString(),
    };
  }
  return data as InsertRemittancePartnerResponse;
}
