export const sendPartnerOptions = [
  "FOREX JAPAN CO. LTD.",
  "TRANS CASH INTERNATIONAL",
  "KOPERASI SINEMI BERDIKARI UTAMA",
  "AISA CO. LTD",
];

export const sendBranchOptions = [
  "Head Office",
  "JAPAN OFFICE",
  "KAMATA SATELLITE STORE",
  "Evergreen Shine",
];

export const sendCountryOptions = ["Nepal", "India", "Indonesia", "Japan", "Australia"];

export const sendMethodOptions = sendPartnerOptions;

export interface TradeRestrictionItem {
  label: string;
}

export const tradeRestrictionItems: TradeRestrictionItem[] = [
  { label: "Non-Relevant to North Korea and Iran Restrictions:" },
  { label: "Government Permit Approval is not required for this transaction:" },
  { label: "Not a Name-lending transaction :" },
  { label: "Importing goods or merchandising trade transaction :" },
];

export const genderOptions = ["Male", "Female", "Other"];

export const idTypeOptions = ["Passport", "Driving License", "Residence Card", "My Number Card", "National ID Card"];

export const photoIdTypeOptions = ["ANY PHOTO ID", "Passport", "Driving License", "Residence Card", "My Number Card"];

export const japanPrefectureOptions = [
  "Tokyo",
  "Osaka",
  "Kanagawa",
  "Aichi",
  "Fukuoka",
  "Hokkaido",
  "Saitama",
  "Chiba",
];

export const discountOptions = ["--SELECT DISCOUNT--", "Loyalty 5%", "Promo Code", "Staff Discount"];

export const payoutPartnerBankOptions = [
  "NEPAL- TRANSCASH",
  "INDIA - TCI BANK",
  "INDONESIA - KOPERASI BANK",
];

export const collectMethodOptions = [
  "By Cash",
  "Bank/Ebanking Slip Entry",
  "Pending Transaction",
  "Wallet",
] as const;

export type CollectMethod = (typeof collectMethodOptions)[number];
