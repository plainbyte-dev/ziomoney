export interface PartnerSummaryRow {
  generate: string;
  partnerName: string;
  nos: number;
  currency: string;
  collected: string;
  charge: string;
  partnerComm: string;
  agentExGain: string;
  settlementAmt: string;
  hoComm: string;
  payPartnerComm: string;
  avgRate: string;
}

export const partnerSummaryRows: PartnerSummaryRow[] = [
  { generate: "JAPAN", partnerName: "A B CORPORATION PVT LTD", nos: 2, currency: "JPY", collected: "552,200.00", charge: "2200", partnerComm: "950.00", agentExGain: "0.00", settlementAmt: "549,050.00", hoComm: "1,250.00", payPartnerComm: "0.00", avgRate: "157.7000" },
  { generate: "JAPAN", partnerName: "AJITA CO. LTD OKINAWA", nos: 32, currency: "JPY", collected: "7,929,441.00", charge: "23000", partnerComm: "15,700.00", agentExGain: "0.00", settlementAmt: "7,906,441.00", hoComm: "7,300.00", payPartnerComm: "0.00", avgRate: "157.5875" },
  { generate: "JAPAN", partnerName: "ASHA24 CO LTD", nos: 1, currency: "JPY", collected: "135,938.00", charge: "1500", partnerComm: "1,000.00", agentExGain: "0.00", settlementAmt: "134,938.00", hoComm: "500.00", payPartnerComm: "0.00", avgRate: "157.7000" },
  { generate: "JAPAN", partnerName: "ASIAN FOOD MART CO LTD", nos: 1, currency: "JPY", collected: "210,268.00", charge: "1500", partnerComm: "750.00", agentExGain: "0.00", settlementAmt: "209,518.00", hoComm: "750.00", payPartnerComm: "0.00", avgRate: "157.7000" },
  { generate: "JAPAN", partnerName: "B AND B INTERNATIONAL", nos: 1, currency: "JPY", collected: "732,188.00", charge: "1500", partnerComm: "750.00", agentExGain: "0.00", settlementAmt: "731,438.00", hoComm: "750.00", payPartnerComm: "0.00", avgRate: "157.7000" },
  { generate: "JAPAN", partnerName: "B.D.S CO. LTD.", nos: 1, currency: "JPY", collected: "105,384.00", charge: "1000", partnerComm: "500.00", agentExGain: "0.00", settlementAmt: "104,884.00", hoComm: "500.00", payPartnerComm: "0.00", avgRate: "157.7000" },
  { generate: "JAPAN", partnerName: "BEST ONE PVT LTD", nos: 1, currency: "JPY", collected: "523,420.00", charge: "1500", partnerComm: "750.00", agentExGain: "0.00", settlementAmt: "522,670.00", hoComm: "750.00", payPartnerComm: "0.00", avgRate: "157.7000" },
  { generate: "JAPAN", partnerName: "BHAWANA CO.LTD", nos: 1, currency: "JPY", collected: "61,000.00", charge: "1000", partnerComm: "500.00", agentExGain: "0.00", settlementAmt: "60,500.00", hoComm: "500.00", payPartnerComm: "0.00", avgRate: "157.7000" },
  { generate: "JAPAN", partnerName: "BIG MART OSAKA", nos: 1, currency: "JPY", collected: "135,700.00", charge: "0", partnerComm: "(500.00)", agentExGain: "0.00", settlementAmt: "136,200.00", hoComm: "500.00", payPartnerComm: "0.00", avgRate: "157.7000" },
  { generate: "JAPAN", partnerName: "DREAM PVT LTD", nos: 7, currency: "JPY", collected: "901,926.00", charge: "8000", partnerComm: "4,000.00", agentExGain: "0.00", settlementAmt: "897,926.00", hoComm: "4,000.00", payPartnerComm: "0.00", avgRate: "157.5286" },
  { generate: "JAPAN", partnerName: "DS CO LTD", nos: 4, currency: "JPY", collected: "426,113.00", charge: "3500", partnerComm: "1,950.00", agentExGain: "0.00", settlementAmt: "424,163.00", hoComm: "1,550.00", payPartnerComm: "0.00", avgRate: "157.4000" },
  { generate: "JAPAN", partnerName: "FOREX JAPAN CO. LTD.", nos: 11, currency: "JPY", collected: "1,423,115.00", charge: "11900", partnerComm: "0.00", agentExGain: "0.00", settlementAmt: "1,423,115.00", hoComm: "11,900.00", payPartnerComm: "0.00", avgRate: "157.4818" },
  { generate: "JAPAN", partnerName: "FOREX JAPAN CO. LTD.-BANK", nos: 16, currency: "JPY", collected: "2,790,414.00", charge: "17300", partnerComm: "0.00", agentExGain: "0.00", settlementAmt: "2,790,414.00", hoComm: "17,300.00", payPartnerComm: "0.00", avgRate: "157.6250" },
  { generate: "JAPAN", partnerName: "FOREX JAPAN CO. LTD.-BANK AGENT", nos: 10, currency: "JPY", collected: "2,494,021.00", charge: "11500", partnerComm: "4,200.00", agentExGain: "0.00", settlementAmt: "2,489,821.00", hoComm: "7,300.00", payPartnerComm: "0.00", avgRate: "157.7000" },
  { generate: "JAPAN", partnerName: "FOREX JAPAN CO. LTD.-JP CARD", nos: 6, currency: "JPY", collected: "444,530.00", charge: "5900", partnerComm: "200.00", agentExGain: "0.00", settlementAmt: "444,330.00", hoComm: "5,700.00", payPartnerComm: "0.00", avgRate: "157.3000" },
  { generate: "JAPAN", partnerName: "FOREX JAPAN CO. LTD.-LAWSON CARD", nos: 27, currency: "JPY", collected: "4,932,000.00", charge: "26600", partnerComm: "0.00", agentExGain: "0.00", settlementAmt: "4,932,000.00", hoComm: "26,600.00", payPartnerComm: "0.00", avgRate: "157.5667" },
  { generate: "JAPAN", partnerName: "FOREX JAPAN CO. LTD.-ONLINE", nos: 35, currency: "JPY", collected: "9,560,716.00", charge: "37200", partnerComm: "0.00", agentExGain: "0.00", settlementAmt: "9,560,716.00", hoComm: "37,000.00", payPartnerComm: "200.00", avgRate: "157.3229" },
  { generate: "JAPAN", partnerName: "H AND S-ITSUTSUBASHI", nos: 3, currency: "JPY", collected: "190,979.00", charge: "1000", partnerComm: "1,500.00", agentExGain: "0.00", settlementAmt: "189,479.00", hoComm: "(500.00)", payPartnerComm: "0.00", avgRate: "157.7000" },
  { generate: "JAPAN", partnerName: "KANAZAWA HALAL SHOP", nos: 1, currency: "JPY", collected: "99,000.00", charge: "700", partnerComm: "300.00", agentExGain: "0.00", settlementAmt: "98,700.00", hoComm: "400.00", payPartnerComm: "0.00", avgRate: "157.7000" },
  { generate: "JAPAN", partnerName: "LAXMI PVT LTD", nos: 1, currency: "JPY", collected: "10,938.00", charge: "500", partnerComm: "250.00", agentExGain: "0.00", settlementAmt: "10,688.00", hoComm: "250.00", payPartnerComm: "0.00", avgRate: "157.7000" },
  { generate: "JAPAN", partnerName: "TRANS CASH INTERNATIONAL", nos: 11, currency: "JPY", collected: "1,873,857.00", charge: "8500", partnerComm: "4,250.00", agentExGain: "0.00", settlementAmt: "1,869,607.00", hoComm: "4,250.00", payPartnerComm: "0.00", avgRate: "157.6818" },
];

export interface DailyTransactionRow {
  no: number;
  customerId: string;
  tranId: string;
  pinno: string;
  depositType: string;
  senderDetails: string;
  dot: string;
  paidDate: string;
  receiverName: string;
  country: string;
  status: string;
  statusTag: string;
  paymentType: string;
  paymentRef: string;
  collectedAmount: string;
  transferAmount: string;
  serviceCharge: string;
}

export interface DailyTransactionGroup {
  partnerName: string;
  rows: DailyTransactionRow[];
}

export const dailyTransactionGroups: DailyTransactionGroup[] = [
  {
    partnerName: "TRANS CASH INTERNATIONAL",
    rows: [
      { no: 1, customerId: "67894", tranId: "680838", pinno: "IPAY217810379", depositType: "CASH", senderDetails: "RUPESH PUN MAGAR", dot: "2026-08-04 8:34:36 PM", paidDate: "2026-08-04 8:42:00 PM", receiverName: "RUPINA PUN MAGAR", country: "NEPAL", status: "Paid", statusTag: "Payment", paymentType: "Bank Transfer", paymentRef: "A/C No:09101108098400000001", collectedAmount: "68,849.00 JPY", transferAmount: "67,849.00 JPY", serviceCharge: "1,000.00 JPY" },
      { no: 2, customerId: "67068", tranId: "680837", pinno: "IPAY211839857", depositType: "Wallet", senderDetails: "SUBEDI EK NARAYAN", dot: "2026-08-04 8:15:54 PM", paidDate: "2026-08-04 8:23:00 PM", receiverName: "EK NARAYAN SUBEDI", country: "NEPAL", status: "Paid", statusTag: "Payment", paymentType: "Bank Transfer", paymentRef: "A/C No:55509018098", collectedAmount: "220,000.00 JPY", transferAmount: "218,500.00 JPY", serviceCharge: "1,500.00 JPY" },
      { no: 3, customerId: "70293", tranId: "680836", pinno: "IPAY211904826", depositType: "CASH", senderDetails: "RUPESH KHULAL", dot: "2026-08-04 8:07:23 PM", paidDate: "2026-08-04 8:11:00 PM", receiverName: "SOPHIYA KHATRI", country: "NEPAL", status: "Paid", statusTag: "Payment", paymentType: "Bank Transfer", paymentRef: "A/C No:0180100000210041", collectedAmount: "135,700.00 JPY", transferAmount: "135,700.00 JPY", serviceCharge: "0.00 JPY" },
      { no: 4, customerId: "63543", tranId: "680835", pinno: "IPAY215846913", depositType: "CASH", senderDetails: "NABINA THAPA", dot: "2026-08-04 8:00:38 PM", paidDate: "2026-08-04 8:05:00 PM", receiverName: "TARA BAHADUR THAPA MAGAR", country: "NEPAL", status: "Paid", statusTag: "Payment", paymentType: "Bank Transfer", paymentRef: "A/C No:3277075172500018", collectedAmount: "500,000.00 JPY", transferAmount: "498,500.00 JPY", serviceCharge: "1,500.00 JPY" },
      { no: 5, customerId: "70199", tranId: "680834", pinno: "IPAY218376471", depositType: "CASH", senderDetails: "SANGITA MAGAR", dot: "2026-08-04 7:27:31 PM", paidDate: "", receiverName: "JAGADISH KARKI", country: "Nepal", status: "Post", statusTag: "Cash Pay", paymentType: "Cash Pay", paymentRef: "", collectedAmount: "22,000.00 JPY", transferAmount: "21,500.00 JPY", serviceCharge: "500.00 JPY" },
      { no: 6, customerId: "70290", tranId: "680833", pinno: "IPAY215683287", depositType: "CASH", senderDetails: "PRABINA KUMARI BLON", dot: "2026-08-04 7:25:11 PM", paidDate: "2026-08-04 8:01:00 PM", receiverName: "SUDIR LAMA", country: "NEPAL", status: "Paid", statusTag: "Payment", paymentType: "Bank Transfer", paymentRef: "A/C No:55511200966", collectedAmount: "73,069.00 JPY", transferAmount: "73,069.00 JPY", serviceCharge: "0.00 JPY" },
      { no: 7, customerId: "70297", tranId: "680832", pinno: "IPAY220118735", depositType: "CASH", senderDetails: "DIL KUMARI LAWATI", dot: "2026-08-04 7:22:22 PM", paidDate: "2026-08-04 7:54:00 PM", receiverName: "AMRIT LAWATI", country: "NEPAL", status: "Paid", statusTag: "Payment", paymentType: "Bank Transfer", paymentRef: "A/C No:P587951831152401", collectedAmount: "54,000.00 JPY", transferAmount: "54,000.00 JPY", serviceCharge: "0.00 JPY" },
      { no: 8, customerId: "54271", tranId: "680831", pinno: "IPAY214960509", depositType: "CASH", senderDetails: "MANITA PAUDEL", dot: "2026-08-04 7:19:05 PM", paidDate: "2026-08-04 7:56:00 PM", receiverName: "MANISH PAUDEL", country: "NEPAL", status: "Paid", statusTag: "Payment", paymentType: "Bank Transfer", paymentRef: "A/C No:2450263159500013", collectedAmount: "61,000.00 JPY", transferAmount: "61,000.00 JPY", serviceCharge: "0.00 JPY" },
      { no: 9, customerId: "70296", tranId: "680830", pinno: "IPAY212572112", depositType: "CASH", senderDetails: "AJAY MAHARJAN", dot: "2026-08-04 7:18:52 PM", paidDate: "2026-08-04 7:30:00 PM", receiverName: "YAL BAHADUR MAHARJAN", country: "Nepal", status: "Paid", statusTag: "Payment", paymentType: "Bank Transfer", paymentRef: "A/C No:0227301644514011", collectedAmount: "450,000.00 JPY", transferAmount: "448,500.00 JPY", serviceCharge: "1,500.00 JPY" },
      { no: 10, customerId: "68506", tranId: "680829", pinno: "IPAY211345095", depositType: "Wallet", senderDetails: "KARKI RAJ", dot: "2026-08-04 7:18:27 PM", paidDate: "2026-08-04 7:25:00 PM", receiverName: "SAMA MAYA TAMANG", country: "NEPAL", status: "Paid", statusTag: "Payment", paymentType: "Bank Transfer", paymentRef: "A/C No:20705390252874", collectedAmount: "258,000.00 JPY", transferAmount: "256,500.00 JPY", serviceCharge: "1,500.00 JPY" },
      { no: 11, customerId: "70271", tranId: "680828", pinno: "IPAY214728937", depositType: "CASH", senderDetails: "DHIRENDRA BOHARA", dot: "2026-08-04 7:16:10 PM", paidDate: "2026-08-04 8:01:00 PM", receiverName: "DHIRK BOHARA", country: "NEPAL", status: "Paid", statusTag: "Payment", paymentType: "Bank Transfer", paymentRef: "A/C No:0780501202477", collectedAmount: "5,219.00 JPY", transferAmount: "5,219.00 JPY", serviceCharge: "0.00 JPY" },
    ],
  },
];

export const dailyReportFilters = [
  { label: "SENDERCOUNTRY", value: "ALL" },
  { label: "SEARCH BY", value: "By Sender Last Name" },
  { label: "SEND PARTNER", value: "ALL" },
  { label: "SEARCH BY", value: "By Customer ID" },
  { label: "PAYOUT COUNTRY", value: "All Country" },
  { label: "REASON FOR REMITTANCE", value: "ALL" },
  { label: "PAYOUT PARTNER", value: "ALL" },
  { label: "SENDER OCCUPATION", value: "ALL" },
  { label: "STATUS", value: "ALL" },
  { label: "PAYMENT MODE", value: "ALL" },
  { label: "DATE TYPE", value: "By TXN Date" },
];
