export const contactCountryOptions = ["JAPAN", "INDIA", "NEPAL", "INDONESIA", "AUSTRALIA"];

export const genderOptions = ["Male", "Female"] as const;
export type Gender = (typeof genderOptions)[number];

export const nationalityOptions = [
  "Japanese",
  "Indian",
  "Nepalese",
  "Indonesian",
  "Filipino",
  "Vietnamese",
  "American",
  "Other",
];

export const addressEntryMethodOptions = [
  "If you know your zip code, enter from zip code.",
  "If you don't know your zip code, enter your address in full beginning with your prefecture.",
] as const;
export type AddressEntryMethod = (typeof addressEntryMethodOptions)[number];

export const customerVisaTypeOptions = [
  "Permanent Resident",
  "Student",
  "Work Visa",
  "Spouse Visa",
  "Other",
];

export const occupationOptions = [
  "Company Employee",
  "Self Employed",
  "Student",
  "Homemaker",
  "Unemployed",
  "Other",
];

export const customerIdTypeOptions = [
  "Passport",
  "Residence Card",
  "Driving License",
  "My Number Card",
];

export const idIssueCountryOptions = ["Japan", "India", "Nepal", "Indonesia", "Other"];

export const idIssuingJurisdictionOptions = [
  "Immigration Services Agency",
  "Prefectural Public Safety Commission",
  "Local Municipal Office",
  "Other",
];

export const sourceOfFundsOptions = ["Salary", "Business Income", "Savings", "Other"];
