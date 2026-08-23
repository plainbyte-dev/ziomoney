export type KycStatus = "NOT_VERIFIED" | "COMPLIANCE_HOLD" | "VERIFIED" | "REJECTED";

// Fields accepted by POST /updateCustomer
export interface CustomerRecord {
  userName: string;
  fullName: string;
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  dob: string;
  nationality: string;
  emailAddress: string;
  mobileNo: string;
  telephoneNo: string;
  sourceOfincome: string;
  occupation: string;
  zipCode: string;
  prefecture: string;
  city: string;
  town: string;
  streetAddress: string;
  primaryIdNo: string;
  primaryIdIssueDate: string;
  primaryIdExpiryDate: string;
  secondaryIdNo: string;
  remarks: string;
}

export function emptyCustomerRecord(): CustomerRecord {
  return {
  userName: "",
  fullName: "",
  firstName: "",
  middleName: "",
  lastName: "",
  gender: "",
  dob: "",
  nationality: "",
  emailAddress: "",
  mobileNo: "",
  telephoneNo: "",
  zipCode: "",
  prefecture: "",
  city: "",
  town: "",
  streetAddress: "",
  primaryIdNo: "",
  primaryIdIssueDate: "",
  primaryIdExpiryDate: "",
  secondaryIdNo: "",
  remarks: "",
  sourceOfincome: "",
  occupation: "",
 
};
}

// Fields additionally required by the approve endpoints.
export interface KycApprovalFields {
  registrantAgent: string;
  registrantBranch: string;
  remarks: string;
  kycMode: string;
}

// POST /InsertApprovedKYC and /InsertApprovedCompilenceKYC take the full
// customer record (minus its own `remarks`) plus the approval fields above,
// whose own `remarks` supersedes it.
export type ApproveKycPayload = Omit<CustomerRecord, "remarks"> & KycApprovalFields;

export interface KycRecord extends CustomerRecord {
  id: string;
  status: KycStatus;
  kycUniqueCode?: string;
  referCode?: string;
  registrantAgent?: string;
  registrantBranch?: string;
  kycMode?: string;
  submittedDate: string;
}

// Raw shape returned by POST /updateCustomer, /InsertApprovedKYC,
// /InsertApprovedCompilenceKYC and the three getAll*Kycs list endpoints.
// Notably different from CustomerRecord: `email` not `emailAddress`, no
// `primaryIdIssueDate`/`secondaryIdNo` (request-only fields), plus
// server-assigned id/status/audit fields.
export interface KycApiRecord {
  id: number;
  userName: string;
  kycStatus: KycStatus;
  kycMode: string;
  kycUniqueCode: string;
  referCode: string;
  fullName: string;
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  dob: string;
  nationality: string;
  email: string;
  mobileNo: string;
  telephoneNo: string;
  zipCode: string;
  prefecture: string;
  city: string;
  town: string;
  streetAddress: string;
  primaryIdNo: string;
  primaryIdExpiryDate: string;
  registrantAgent: string;
  registrantBranch: string;
  remarks: string;
  createdAt: string;
  updatedAt: string;
}

// Adapts the API's response shape onto the UI-facing KycRecord. The API
// never echoes back primaryIdIssueDate/secondaryIdNo, so those come back
// empty on records loaded from the live API (they're only ever populated on
// records authored locally in demo mode).
export function mapKycApiRecord(api: KycApiRecord): KycRecord {
  return {
  id: String(api.id),
  userName: api.userName,
  fullName: api.fullName,
  firstName: api.firstName,
  middleName: api.middleName,
  lastName: api.lastName,
  gender: api.gender,
  dob: api.dob,
  nationality: api.nationality,
  emailAddress: api.email,
  mobileNo: api.mobileNo,
  telephoneNo: api.telephoneNo,
  zipCode: api.zipCode,
  prefecture: api.prefecture,
  city: api.city,
  town: api.town,
  streetAddress: api.streetAddress,
  primaryIdNo: api.primaryIdNo,
  primaryIdIssueDate: "",
  primaryIdExpiryDate: api.primaryIdExpiryDate,
  secondaryIdNo: "",
  remarks: api.remarks,
  status: api.kycStatus,
  kycUniqueCode: api.kycUniqueCode,
  referCode: api.referCode,
  registrantAgent: api.registrantAgent,
  registrantBranch: api.registrantBranch,
  kycMode: api.kycMode,
  submittedDate: api.createdAt ? api.createdAt.slice(0, 10) : "",
  sourceOfincome: "",
  occupation: "",

};
}

export const pendingKycRecords: KycRecord[] = [
  {
    id: "KYC-1001",
    userName: "aisa.co",
    fullName: "Aisa Tanaka",
    firstName: "Aisa",
    middleName: "",
    lastName: "Tanaka",
    gender: "Female",
    dob: "1990-04-12",
    nationality: "Japanese",
    emailAddress: "aisa.tanaka@example.com",
    mobileNo: "090-1234-5678",
    telephoneNo: "03-1234-5678",
    zipCode: "144-0051",
    prefecture: "Tokyo",
    city: "Ota-Ku",
    town: "Nishikamata",
    streetAddress: "7-29-5",
    primaryIdNo: "MP1234567",
    primaryIdIssueDate: "2022-01-10",
    primaryIdExpiryDate: "2032-01-10",
    secondaryIdNo: "",
    remarks: "New customer, walk-in registration.",
    status: "NOT_VERIFIED",
    submittedDate: "2026-07-30",
    sourceOfincome: "",
    occupation: ""
  },
  {
    id: "KYC-1002",
    userName: "rgurung",
    fullName: "R. Gurung",
    firstName: "R.",
    middleName: "",
    lastName: "Gurung",
    gender: "Male",
    dob: "1988-11-02",
    nationality: "Nepalese",
    emailAddress: "r.gurung@example.com",
    mobileNo: "080-2233-4455",
    telephoneNo: "",
    zipCode: "144-0052",
    prefecture: "Tokyo",
    city: "Ota-Ku",
    town: "Kamata",
    streetAddress: "3-1-1",
    primaryIdNo: "RC9988776",
    primaryIdIssueDate: "2021-06-01",
    primaryIdExpiryDate: "2031-06-01",
    secondaryIdNo: "MN0012233",
    remarks: "",
    status: "NOT_VERIFIED",
    submittedDate: "2026-08-01",
    sourceOfincome: "",
    occupation: ""
  },
  {
    id: "KYC-1004",
    userName: "j.miller",
    fullName: "J. Miller",
    firstName: "J.",
    middleName: "",
    lastName: "Miller",
    gender: "Male",
    dob: "1985-03-22",
    nationality: "Australian",
    emailAddress: "j.miller.new@example.com",
    mobileNo: "0412-555-778",
    telephoneNo: "",
    zipCode: "150-0002",
    prefecture: "Tokyo",
    city: "Shibuya-Ku",
    town: "Ebisu",
    streetAddress: "5-2-1",
    primaryIdNo: "JM7788990",
    primaryIdIssueDate: "2023-02-10",
    primaryIdExpiryDate: "2033-02-10",
    secondaryIdNo: "",
    remarks: "Renewal registration, pending document check.",
    status: "NOT_VERIFIED",
    submittedDate: "2026-08-06",
    sourceOfincome: "",
    occupation: ""
  },
  {
    id: "KYC-1005",
    userName: "a.khan",
    fullName: "S. Al Mazrouei",
    firstName: "S.",
    middleName: "",
    lastName: "Al Mazrouei",
    gender: "Male",
    dob: "1991-12-03",
    nationality: "Emirati",
    emailAddress: "s.almazrouei@example.com",
    mobileNo: "050-123-4567",
    telephoneNo: "",
    zipCode: "141-0021",
    prefecture: "Tokyo",
    city: "Shinagawa-Ku",
    town: "Kamiosaki",
    streetAddress: "2-9-3",
    primaryIdNo: "SA3344556",
    primaryIdIssueDate: "2022-08-01",
    primaryIdExpiryDate: "2032-08-01",
    secondaryIdNo: "",
    remarks: "",
    status: "NOT_VERIFIED",
    submittedDate: "2026-08-08",
    sourceOfincome: "",
    occupation: ""
  },
  {
    id: "KYC-1006",
    userName: "l.brown",
    fullName: "K. Thompson",
    firstName: "K.",
    middleName: "",
    lastName: "Thompson",
    gender: "Female",
    dob: "1994-05-17",
    nationality: "Canadian",
    emailAddress: "k.thompson@example.com",
    mobileNo: "416-555-0192",
    telephoneNo: "",
    zipCode: "160-0023",
    prefecture: "Tokyo",
    city: "Shinjuku-Ku",
    town: "Nishishinjuku",
    streetAddress: "1-4-2",
    primaryIdNo: "KT5566778",
    primaryIdIssueDate: "2021-10-12",
    primaryIdExpiryDate: "2031-10-12",
    secondaryIdNo: "",
    remarks: "First-time registration.",
    status: "NOT_VERIFIED",
    submittedDate: "2026-08-10",
    sourceOfincome: "",
    occupation: ""
  },
];

export const complianceHoldKycRecords: KycRecord[] = [
  {
    id: "KYC-1003",
    userName: "s.patel",
    fullName: "S. Patel",
    firstName: "S.",
    middleName: "",
    lastName: "Patel",
    gender: "Male",
    dob: "1979-02-20",
    nationality: "Indian",
    emailAddress: "s.patel@example.com",
    mobileNo: "070-9988-1122",
    telephoneNo: "",
    zipCode: "150-0001",
    prefecture: "Tokyo",
    city: "Shibuya-Ku",
    town: "Jinnan",
    streetAddress: "1-2-3",
    primaryIdNo: "PA2233445",
    primaryIdIssueDate: "2020-03-15",
    primaryIdExpiryDate: "2030-03-15",
    secondaryIdNo: "",
    remarks: "Name partially matched a watchlist entry — flagged for manual review.",
    status: "COMPLIANCE_HOLD",
    submittedDate: "2026-07-28",
    sourceOfincome: "",
    occupation: ""
  },
  {
    id: "KYC-1007",
    userName: "rgurung",
    fullName: "M. Sharma",
    firstName: "M.",
    middleName: "",
    lastName: "Sharma",
    gender: "Male",
    dob: "1983-06-11",
    nationality: "Indian",
    emailAddress: "m.sharma@example.com",
    mobileNo: "98123-45678",
    telephoneNo: "",
    zipCode: "108-0073",
    prefecture: "Tokyo",
    city: "Minato-Ku",
    town: "Mita",
    streetAddress: "3-6-1",
    primaryIdNo: "MS6677889",
    primaryIdIssueDate: "2020-09-05",
    primaryIdExpiryDate: "2030-09-05",
    secondaryIdNo: "",
    remarks: "Name closely matches a PEP watchlist entry — flagged for manual review.",
    status: "COMPLIANCE_HOLD",
    submittedDate: "2026-08-02",
    sourceOfincome: "",
    occupation: ""
  },
  {
    id: "KYC-1008",
    userName: "j.miller",
    fullName: "T. Nguyen",
    firstName: "T.",
    middleName: "",
    lastName: "Nguyen",
    gender: "Male",
    dob: "1987-01-29",
    nationality: "Vietnamese",
    emailAddress: "t.nguyen@example.com",
    mobileNo: "0412-555-778",
    telephoneNo: "",
    zipCode: "170-0013",
    prefecture: "Tokyo",
    city: "Toshima-Ku",
    town: "Higashiikebukuro",
    streetAddress: "4-1-8",
    primaryIdNo: "TN8899001",
    primaryIdIssueDate: "2019-12-20",
    primaryIdExpiryDate: "2029-12-20",
    secondaryIdNo: "",
    remarks: "Source of income documentation incomplete.",
    status: "COMPLIANCE_HOLD",
    submittedDate: "2026-08-04",
    sourceOfincome: "",
    occupation: ""
  },
  {
    id: "KYC-1009",
    userName: "a.khan",
    fullName: "A. Khan",
    firstName: "A.",
    middleName: "",
    lastName: "Khan",
    gender: "Male",
    dob: "1988-04-08",
    nationality: "Emirati",
    emailAddress: "a.khan.hold@example.com",
    mobileNo: "090-7788-9900",
    telephoneNo: "",
    zipCode: "106-0032",
    prefecture: "Tokyo",
    city: "Minato-Ku",
    town: "Roppongi",
    streetAddress: "6-3-9",
    primaryIdNo: "AK9900112",
    primaryIdIssueDate: "2021-07-19",
    primaryIdExpiryDate: "2031-07-19",
    secondaryIdNo: "",
    remarks: "Duplicate submission under review.",
    status: "COMPLIANCE_HOLD",
    submittedDate: "2026-08-09",
    sourceOfincome: "",
    occupation: ""
  },
  {
    id: "KYC-1010",
    userName: "l.brown",
    fullName: "L. Brown",
    firstName: "L.",
    middleName: "",
    lastName: "Brown",
    gender: "Female",
    dob: "1990-10-30",
    nationality: "Canadian",
    emailAddress: "l.brown.hold@example.com",
    mobileNo: "416-555-0192",
    telephoneNo: "",
    zipCode: "160-0022",
    prefecture: "Tokyo",
    city: "Shinjuku-Ku",
    town: "Shinjuku",
    streetAddress: "4-5-6",
    primaryIdNo: "LB2233445",
    primaryIdIssueDate: "2022-03-03",
    primaryIdExpiryDate: "2032-03-03",
    secondaryIdNo: "",
    remarks: "Amount exceeds sender's declared occupation threshold.",
    status: "COMPLIANCE_HOLD",
    submittedDate: "2026-08-11",
    sourceOfincome: "",
    occupation: ""
  },
];

export const approvedKycRecords: KycRecord[] = [
  {
    id: "KYC-0998",
    userName: "l.brown",
    fullName: "L. Brown",
    firstName: "L.",
    middleName: "",
    lastName: "Brown",
    gender: "Female",
    dob: "1992-09-09",
    nationality: "Japanese",
    emailAddress: "l.brown@example.com",
    mobileNo: "090-5566-7788",
    telephoneNo: "",
    zipCode: "160-0022",
    prefecture: "Tokyo",
    city: "Shinjuku-Ku",
    town: "Shinjuku",
    streetAddress: "4-5-6",
    primaryIdNo: "LB1122334",
    primaryIdIssueDate: "2019-05-20",
    primaryIdExpiryDate: "2029-05-20",
    secondaryIdNo: "",
    remarks: "",
    status: "VERIFIED",
    registrantAgent: "M. Tanaka",
    registrantBranch: "Tokyo Branch",
    kycMode: "Face to Face",
    submittedDate: "2026-07-15",
    sourceOfincome: "",
    occupation: ""
  },
  {
    id: "KYC-0999",
    userName: "j.miller",
    fullName: "J. Miller",
    firstName: "J.",
    middleName: "",
    lastName: "Miller",
    gender: "Male",
    dob: "1985-03-22",
    nationality: "Australian",
    emailAddress: "j.miller@example.com",
    mobileNo: "090-3344-5566",
    telephoneNo: "",
    zipCode: "150-0002",
    prefecture: "Tokyo",
    city: "Shibuya-Ku",
    town: "Shibuya",
    streetAddress: "2-8-4",
    primaryIdNo: "JM4455667",
    primaryIdIssueDate: "2020-11-05",
    primaryIdExpiryDate: "2030-11-05",
    secondaryIdNo: "",
    remarks: "",
    status: "VERIFIED",
    registrantAgent: "M. Tanaka",
    registrantBranch: "Tokyo Branch",
    kycMode: "Face to Face",
    submittedDate: "2026-07-22",
    sourceOfincome: "",
    occupation: ""
  },
  {
    id: "KYC-1000",
    userName: "a.khan",
    fullName: "A. Khan",
    firstName: "A.",
    middleName: "",
    lastName: "Khan",
    gender: "Male",
    dob: "1990-07-14",
    nationality: "Emirati",
    emailAddress: "a.khan@example.com",
    mobileNo: "090-7788-9900",
    telephoneNo: "",
    zipCode: "106-0032",
    prefecture: "Tokyo",
    city: "Minato-Ku",
    town: "Roppongi",
    streetAddress: "6-1-2",
    primaryIdNo: "AK5566778",
    primaryIdIssueDate: "2021-02-18",
    primaryIdExpiryDate: "2031-02-18",
    secondaryIdNo: "",
    remarks: "",
    status: "VERIFIED",
    registrantAgent: "M. Tanaka",
    registrantBranch: "Tokyo Branch",
    kycMode: "Face to Face",
    submittedDate: "2026-08-05",
    sourceOfincome: "",
    occupation: ""
  },
  {
    id: "KYC-1011",
    userName: "s.patel",
    fullName: "D. Wijaya",
    firstName: "D.",
    middleName: "",
    lastName: "Wijaya",
    gender: "Male",
    dob: "1986-06-25",
    nationality: "Indonesian",
    emailAddress: "d.wijaya@example.com",
    mobileNo: "0812-3344-5566",
    telephoneNo: "",
    zipCode: "153-0042",
    prefecture: "Tokyo",
    city: "Meguro-Ku",
    town: "Aobadai",
    streetAddress: "1-7-4",
    primaryIdNo: "DW6677889",
    primaryIdIssueDate: "2020-04-14",
    primaryIdExpiryDate: "2030-04-14",
    secondaryIdNo: "",
    remarks: "",
    status: "VERIFIED",
    registrantAgent: "M. Tanaka",
    registrantBranch: "Tokyo Branch",
    kycMode: "Face to Face",
    submittedDate: "2026-08-07",
    sourceOfincome: "",
    occupation: ""
  },
  {
    id: "KYC-1012",
    userName: "rgurung",
    fullName: "R. Gurung",
    firstName: "R.",
    middleName: "",
    lastName: "Gurung",
    gender: "Male",
    dob: "1988-11-02",
    nationality: "Nepalese",
    emailAddress: "r.gurung.verified@example.com",
    mobileNo: "980-1122334",
    telephoneNo: "",
    zipCode: "144-0052",
    prefecture: "Tokyo",
    city: "Ota-Ku",
    town: "Kamata",
    streetAddress: "3-1-1",
    primaryIdNo: "RC1122334",
    primaryIdIssueDate: "2021-01-15",
    primaryIdExpiryDate: "2031-01-15",
    secondaryIdNo: "",
    remarks: "",
    status: "VERIFIED",
    registrantAgent: "S. Hoshino",
    registrantBranch: "Osaka Branch",
    kycMode: "Video KYC",
    submittedDate: "2026-08-09",
    sourceOfincome: "",
    occupation: ""
  },
];
