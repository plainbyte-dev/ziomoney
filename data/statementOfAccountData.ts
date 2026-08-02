export const soaMainPartnerOptions = [
  "--Select--",
  "WORLD FOOD NAGOYA",
  "TOCHIGI ASIAN MART",
  "SUNAINA CO. LTD.",
  "SPICE TOWN-RAMESH KHAREL",
  "SMART TRADING CO LTD",
  "SHREEJA SOUTH ASIAN SPICE MART",
];

export const soaLedgerHeadOptions = [
  "--Select--",
  "Sales",
  "Commission",
  "Settlement",
  "Bank Charges",
];

export const soaCurrencyOptions = ["USD", "FCY", "JPY"] as const;
export type SoaCurrency = (typeof soaCurrencyOptions)[number];

export const soaReportTypeOptions = ["Summary Report", "Detail Report"] as const;
export type SoaReportType = (typeof soaReportTypeOptions)[number];

export const soaDefaults = {
  fromDate: "2026-08-01",
  toDate: "2026-08-02",
};

export type SoaBatchLogEntry = {
  id: string;
  batchDate: string; // e.g. "2026-08-01 6:54:38 PM"
  description: string;
  runBy: string;
};

const batchPartners = [
  "WORLD FOOD NAGOYA",
  "TOCHIGI ASIAN MART",
  "SUNAINA CO. LTD.",
  "SPICE TOWN-RAMESH KHAREL",
  "SMART TRADING CO LTD",
  "SHREEJA SOUTH ASIAN SPICE MART",
  "SHREEJA SOUTH ASIAN SPICE MART",
];

function buildBatchLog(): SoaBatchLogEntry[] {
  const times = [
    "6:54:38 PM",
    "6:53:51 PM",
    "6:53:02 PM",
    "6:52:01 PM",
    "6:51:25 PM",
    "6:50:49 PM",
    "6:50:13 PM",
  ];

  return batchPartners.map((partner, i) => ({
    id: `SOA-${String(i + 1).padStart(4, "0")}`,
    batchDate: `${soaDefaults.fromDate} ${times[i % times.length]}`,
    description: `SOA (Main Agent) ${partner} from :${soaDefaults.fromDate} and to:${soaDefaults.fromDate} is completed`,
    runBy: "SANJAY",
  }));
}

export const soaBatchLog: SoaBatchLogEntry[] = buildBatchLog();
