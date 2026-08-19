export const kycStatusOptions = ["KYC Not Done", "KYC In Progress", "KYC Done"];

// "eKYC" is a placeholder for future self-registration from the mobile app
// (no agent physically involved) — selectable now, but there's no eKYC
// verification flow wired up yet behind it. kycMode is sent to the backend
// as a plain string (see KycInsertPayload in data/kycData.ts), so adding
// this option here is safe without any schema change.
export const kycModeOptions = ["Face to Face", "Non Face to Face", "eKYC"] as const;
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
