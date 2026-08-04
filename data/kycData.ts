export type KycStatus = "NOT_VERIFIED" | "COMPLIANCE_HOLD" | "VERIFIED";

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
  registrantAgent?: string;
  registrantBranch?: string;
  kycMode?: string;
  submittedDate: string;
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
    nationality: "Other",
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
  },
];
