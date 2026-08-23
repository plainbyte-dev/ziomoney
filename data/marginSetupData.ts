import { payoutMethodOptions } from "./transferData";
import { remittanceTypeOptions } from "./partnerCommissionData";

// Fields accepted by POST /addOrUpdateMargin
export interface MarginUpsertPayload {
  id: number;
  targetPartner: string;
  service: string;
  remittanceType: string;
  marginRate: number;
  marginRateWrtParent: number;
  marginType: string;
  marginBindString: string;
  expiryDate: string;
  status: string;
}

export interface MarginRecord extends MarginUpsertPayload {
  createdDate: string;
}

export const marginTypeValues = ["PERCENT", "FLAT"];
export const marginStatusValues = ["ACTIVE", "INACTIVE", "EXPIRED"];

export function emptyMarginPayload(): MarginUpsertPayload {
  return {
    id: 0,
    targetPartner: "",
    service: payoutMethodOptions[0],
    remittanceType: remittanceTypeOptions[0],
    marginRate: 0,
    marginRateWrtParent: 0,
    marginType: marginTypeValues[0],
    marginBindString: "",
    expiryDate: "",
    status: marginStatusValues[0],
  };
}

export const marginRecords: MarginRecord[] = [
  {
    id: 1,
    targetPartner: "TRANS CASH INTERNATIONAL",
    service: "Cash",
    remittanceType: "International",
    marginRate: 0.25,
    marginRateWrtParent: 0.1,
    marginType: "PERCENT",
    marginBindString: "INR",
    expiryDate: "2027-01-01",
    status: "ACTIVE",
    createdDate: "2026-06-01",
  },
  {
    id: 2,
    targetPartner: "remitteragent",
    service: "Bank",
    remittanceType: "Inward",
    marginRate: 300,
    marginRateWrtParent: 100,
    marginType: "FLAT",
    marginBindString: "NPR",
    expiryDate: "2027-01-01",
    status: "ACTIVE",
    createdDate: "2026-06-15",
  },
  {
    id: 3,
    targetPartner: "KOPERASI SINEMI BERDIKARI UTAMA",
    service: "Wallet",
    remittanceType: "Domestic",
    marginRate: 0.5,
    marginRateWrtParent: 0.2,
    marginType: "PERCENT",
    marginBindString: "IDR",
    expiryDate: "2026-12-31",
    status: "ACTIVE",
    createdDate: "2026-07-01",
  },
  {
    id: 4,
    targetPartner: "AISA CO. LTD",
    service: "Bank",
    remittanceType: "Outward",
    marginRate: 150,
    marginRateWrtParent: 50,
    marginType: "FLAT",
    marginBindString: "USD",
    expiryDate: "2027-03-01",
    status: "INACTIVE",
    createdDate: "2026-05-20",
  },
  {
    id: 5,
    targetPartner: "TRANS CASH INTERNATIONAL",
    service: "Cash",
    remittanceType: "International",
    marginRate: 0.3,
    marginRateWrtParent: 0.15,
    marginType: "PERCENT",
    marginBindString: "INR",
    expiryDate: "2026-09-01",
    status: "EXPIRED",
    createdDate: "2026-04-10",
  },
];
