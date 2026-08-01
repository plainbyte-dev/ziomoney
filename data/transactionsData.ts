export interface TransactionDetail {
  refCode: string;
  country: string;
  via: string;
  collectedAmount: string;
  payoutAmount: string;
  settlementAgentAmount: string;
  settlementPartnerAmount: string;
  collection: {
    transferAmount: string;
    serviceCharge: string;
    discount: string;
    collectedAmount: string;
  };
  payout: {
    customerRate: string;
    receiveAmount: string;
  };
  settlementAgent: {
    commission: string;
    exchangeRate: string;
    settlementAmount: string;
  };
  settlementPartner: {
    settleRate: string;
    principal: string;
    commission: string;
    settlementAmount: string;
  };
  headOffice: {
    serviceCharge: string;
    exchangeGain: string;
    netAmount: string;
  };
}

export const activeTransactions: TransactionDetail[] = [
  {
    refCode: "COR-88291",
    country: "Australia",
    via: "Transcash Sydney",
    collectedAmount: "₹4,14,472",
    payoutAmount: "A$7,730",
    settlementAgentAmount: "A$4,07,500",
    settlementPartnerAmount: "A$7,679.60",
    collection: {
      transferAmount: "₹4,12,000",
      serviceCharge: "₹2,472",
      discount: "₹0",
      collectedAmount: "₹4,14,472",
    },
    payout: {
      customerRate: "53.62",
      receiveAmount: "A$7,730",
    },
    settlementAgent: {
      commission: "(1.11%) ₹4,532",
      exchangeRate: "1,843",
      settlementAmount: "A$4,07,500",
    },
    settlementPartner: {
      settleRate: "0.01864",
      principal: "₹4,12,000",
      commission: "(0.55%) A$42.90",
      settlementAmount: "A$7,679.60",
    },
    headOffice: {
      serviceCharge: "₹2,472",
      exchangeGain: "₹3,120",
      netAmount: "A$5,592",
    },
  },
  {
    refCode: "COR-88291",
    country: "Australia",
    via: "Transcash Sydney",
    collectedAmount: "₹4,14,472",
    payoutAmount: "A$7,730",
    settlementAgentAmount: "A$4,07,500",
    settlementPartnerAmount: "A$7,679.60",
    collection: {
      transferAmount: "₹4,12,000",
      serviceCharge: "₹2,472",
      discount: "₹0",
      collectedAmount: "₹4,14,472",
    },
    payout: {
      customerRate: "53.62",
      receiveAmount: "A$7,730",
    },
    settlementAgent: {
      commission: "(1.11%) ₹4,532",
      exchangeRate: "1,843",
      settlementAmount: "A$4,07,500",
    },
    settlementPartner: {
      settleRate: "0.01864",
      principal: "₹4,12,000",
      commission: "(0.55%) A$42.90",
      settlementAmount: "A$7,679.60",
    },
    headOffice: {
      serviceCharge: "₹2,472",
      exchangeGain: "₹3,120",
      netAmount: "A$5,592",
    },
  },
];

export interface CancelledTransaction {
  refCode: string;
  country: string;
  via: string;
  collectedAmount: string;
  worldRePayoutAmount: string;
  status: string;
}

export const cancelledTransactions: CancelledTransaction[] = [
  {
    refCode: "COR-88347",
    country: "Australia",
    via: "Transcash Canberra, cancelled",
    collectedAmount: "₹1,50,900",
    worldRePayoutAmount: "A$2,790.70",
    status: "Reversed",
  },
];

export const stageLegend = [
  { label: "Collection (customer)", color: "bg-brand-blue" },
  { label: "Payout", color: "bg-sky-400" },
  { label: "Settlement - Agent", color: "bg-brand-green" },
  { label: "Settlement - Partner", color: "bg-emerald-400" },
  { label: "Head office", color: "bg-orange-400" },
];

export const columnViews = ["Essentials", "Settlement detail", "Full audit"];

export const reportSections = [
  { key: "collection", label: "Collection (customer)" },
  { key: "payout", label: "Payout" },
  { key: "settlementAgent", label: "Settlement - Agent" },
  { key: "settlementPartner", label: "Settlement - Partner" },
  { key: "headOffice", label: "Head office" },
] as const;

export type ReportSectionKey = (typeof reportSections)[number]["key"];
