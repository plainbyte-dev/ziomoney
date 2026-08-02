import type { SoaBatchLogEntry } from "./statementOfAccountData";

export const forexCompanyHeader = {
  name: "ZIO MONEY CO. LTD",
  regNo: "Kanto Local Finance Bureau 00029",
  postalCode: "〒 144-0051",
  address: "Tokyo-To Ota-Ku Nishikamata 7-29-5 New Kamata Bldg 703",
  phone: "Tel:03-6868-0808",
};

export interface SoaTransaction {
  date: string;
  time: string;
  txnType: "Send" | "";
  description: string;
  dr: number;
  cr: number;
  comm: number;
  settleAmt: number;
  balance: number;
}

export interface SoaReportDetail {
  partner: string;
  currency: string;
  reportRangeLabel: string;
  openingBalanceDate: string;
  openingBalance: number;
  transactions: SoaTransaction[];
  totals: { dr: number; cr: number; comm: number; settleAmt: number };
  closingBalance: number;
  sendPrinciple: number;
  sendCommission: number;
  voucherNotApproved: number;
  totalUnapproveTrn: number;
  netPosition: string;
  netClosingNote: string;
}

const recipientNames = [
  "DILIP THING",
  "SHER BAHADUR GHARTI",
  "RAM KUMAR SHRESTHA",
  "ANITA GURUNG",
  "BIKASH THAPA",
  "SUNITA RAI",
  "KRISHNA BAHADUR",
  "MAYA TAMANG",
];

function toDisplayDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${day}-${months[Number(month) - 1]}-${year.slice(2)}`;
}

function previousDay(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function buildReportDetail(
  entry: SoaBatchLogEntry,
  index: number
): SoaReportDetail {
  const fromDate = entry.batchDate.slice(0, 10);
  const toDate = fromDate;
  const openingBalanceDate = previousDay(fromDate);
  const openingBalance = 400000 + index * 61230;

  const rate = 0.937;
  const amountA = 20000 + index * 3540;
  const amountB = 90000 + index * 4260;
  const nameA = recipientNames[(index * 2) % recipientNames.length];
  const nameB = recipientNames[(index * 2 + 1) % recipientNames.length];
  const ipayA = 221922525 + index * 731;
  const ipayB = 215136072 + index * 419;

  let running = openingBalance;
  const transactions: SoaTransaction[] = [
    {
      date: fromDate,
      time: "11:02:27 AM",
      txnType: "Send",
      description: `${nameA},IPAY${ipayA} @ ${rate}`,
      dr: amountA,
      cr: 0,
      comm: 0,
      settleAmt: amountA,
      balance: (running += amountA),
    },
    {
      date: fromDate,
      time: "2:02:33 PM",
      txnType: "Send",
      description: `${nameB},IPAY${ipayB} @ ${rate}`,
      dr: amountB,
      cr: 0,
      comm: 0,
      settleAmt: amountB,
      balance: (running += amountB),
    },
  ];

  const totals = transactions.reduce(
    (acc, txn) => ({
      dr: acc.dr + txn.dr,
      cr: acc.cr + txn.cr,
      comm: acc.comm + txn.comm,
      settleAmt: acc.settleAmt + txn.settleAmt,
    }),
    { dr: 0, cr: 0, comm: 0, settleAmt: 0 }
  );

  const closingBalance = running;

  return {
    partner: entry.description.replace(/^SOA \(Main Agent\) /, "").split(" from :")[0],
    currency: "JPY",
    reportRangeLabel: `${toDisplayDate(fromDate)} to ${toDisplayDate(toDate)}`,
    openingBalanceDate,
    openingBalance,
    transactions,
    totals,
    closingBalance,
    sendPrinciple: totals.dr,
    sendCommission: totals.comm,
    voucherNotApproved: 0,
    totalUnapproveTrn: 0,
    netPosition: "Receivable from the Agent",
    netClosingNote:
      "Note: Net Closing balance which include all the Hold,Sanction,Compliance txn and pending voucher is:",
  };
}
