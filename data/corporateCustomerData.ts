export const kycStatusOptions = ["KYC Not Done", "KYC In Progress", "KYC Done"];

export const kycModeOptions = ["Face to Face", "Non Face to Face"] as const;
export type KycMode = (typeof kycModeOptions)[number];

export const agentOptions = ["Agent A", "Agent B", "Agent C"];

export const branchOptions = ["Tokyo Branch", "Osaka Branch", "Fukuoka Branch"];

export const prefectureOptions = [
  "Tokyo",
  "Osaka",
  "Kanagawa",
  "Aichi",
  "Fukuoka",
  "Hokkaido",
];

export const businessLineOptions = [
  "Money Transfer",
  "Import/Export",
  "Retail",
  "IT Services",
  "Restaurant",
  "Other",
];

export const corporateTypeOptions = [
  "Kabushiki Kaisha (KK)",
  "Godo Kaisha (GK)",
  "Sole Proprietorship",
  "Foreign Corporation",
];

export const companyIdOptions = ["Corporate Number", "Business License", "Registration Certificate"];

export const idPlaceOfIssueOptions = ["Japan", "India", "Nepal", "Indonesia", "Other"];

export const idIssuingAuthorityOptions = [
  "National Tax Agency",
  "Ministry of Justice",
  "Local Legal Affairs Bureau",
  "Other",
];
