export const agentFilterOptions = ["ALL", "SRILANKA - TRANSCASH", "PHILIPPINE - TRNSCASH", "NEPAL- TRANSCASH", "C AND B"];

export interface UnconfirmedListRow {
  sno: number;
  payoutCountry: string;
  sendingAgent: string;
  noOfTxn: number;
  collectedAmt: number;
}

// Empty by default to match the "No Un-Confirmed Transaction Pending" state
// shown until real unconfirmed transactions come in.
export const unconfirmedListRows: UnconfirmedListRow[] = [];

export interface UnpaidTransactionRow {
  sno: number;
  pinno: string;
  destCountry: string;
  receiver: string;
  date: string;
  payoutPartner: string;
  bankName: string;
  branchName: string;
  accountNo: string;
  collectAmount: string;
  payoutAmount: string;
  generatedBy: string;
}

export const unpaidTransactionRows: UnpaidTransactionRow[] = [
  { sno: 1, pinno: "IPAY212613978", destCountry: "SRI LANKA", receiver: "P A D SANDARUWAN", date: "2026-08-04 5:59:36 PM", payoutPartner: "SRILANKA - TRANSCASH", bankName: "Commercial Bank PLC", branchName: "AMPARA", accountNo: "8019469354", collectAmount: "111,000.00 JPY", payoutAmount: "233,200.00 LKR", generatedBy: "HO:ENIKA DS CO LTD" },
  { sno: 2, pinno: "IPAY211322014", destCountry: "PHILIPPINES", receiver: "CHELSEA MALEY PAREDES YABES", date: "2026-08-04 10:43:35 AM", payoutPartner: "PHILIPPINE - TRNSCASH", bankName: "BPI-BANK OF THE PHILIPPINE ISLANDS", branchName: "BPI", accountNo: "0949229785", collectAmount: "172,900.00 JPY", payoutAmount: "66,807.00 PHP", generatedBy: "HO:PARAOAN FOREX JAPAN CO. LTD. -BANK" },
  { sno: 3, pinno: "IPAY212829009", destCountry: "PHILIPPINES", receiver: "WRENZY L CHUA", date: "2026-08-03 6:57:23 PM", payoutPartner: "PHILIPPINE - TRNSCASH", bankName: "BDO -BANCO DE ORO", branchName: "BDO", accountNo: "005820298293", collectAmount: "232,600.00 JPY", payoutAmount: "90,090.00 PHP", generatedBy: "HO:PARAOAN Head Office" },
  { sno: 4, pinno: "IPAY222350673", destCountry: "NEPAL", receiver: "DHAN KUMARI PANJIYAR", date: "2026-08-03 5:17:17 PM", payoutPartner: "NEPAL- TRANSCASH", bankName: "Kumari Bank Limited", branchName: "KATHMANDU", accountNo: "0091410081450000001", collectAmount: "84,001.00 JPY", payoutAmount: "79,930.00 NPR", generatedBy: "HO:MANISHA AJITA CO LTD - HO" },
  { sno: 5, pinno: "IPAY212973626", destCountry: "PHILIPPINES", receiver: "ROWENA DELA CRUZ ACUIN", date: "2026-08-03 4:08:39 PM", payoutPartner: "PHILIPPINE - TRNSCASH", bankName: "UNION BANK OF THE PHILIPPINES", branchName: "MONTALBAN RIZAL", accountNo: "109421589786", collectAmount: "151,600.00 JPY", payoutAmount: "58,500.00 PHP", generatedBy: "HO:MANISHA PHILIPPINE STORE-AIKA" },
  { sno: 6, pinno: "IPAY212067737", destCountry: "PHILIPPINES", receiver: "ANDREA D. JEONG", date: "2026-08-03 1:22:20 PM", payoutPartner: "PHILIPPINE - TRNSCASH", bankName: "LAND BANK OF THE PHILIPPINES", branchName: "LANDBANK", accountNo: "1706165858", collectAmount: "300,000.00 JPY", payoutAmount: "116,376.00 PHP", generatedBy: "HO:PARAOAN Head Office" },
  { sno: 7, pinno: "JP2218163469678", destCountry: "REPUBLIC OF KOREA", receiver: "SHILA MAHJU", date: "2026-07-21 12:49:11 PM", payoutPartner: "C AND B", bankName: "Hana Bank", branchName: "DOBONGO", accountNo: "21191088620407", collectAmount: "200,000.00 JPY", payoutAmount: "1,784,673.00 KRW", generatedBy: "HO:pathak" },
];

export const pendingDateFilterOptions = ["By Pending Date", "By Created Date"];

export interface PendingTransactionRow {
  sno: number;
  pinno: string;
  destCountry: string;
  receiver: string;
  sendingAgent: string;
  amount: string;
  status: string;
}

// Empty by default to match the "No pending transactions found" state.
export const pendingTransactionRows: PendingTransactionRow[] = [];
