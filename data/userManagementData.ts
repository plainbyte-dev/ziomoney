export const auditRoleFilterOptions = ["--Select--", "Compliance-Staff", "Teller-Staff", "Operation In Charge Staff", "OPERATOR", "ADMIN FOR STAFF", "AGENT", "PART TIME STAFF"];

export const functionNameOptions = [
  "--Select--",
  "REPORT_WRITER/REPORT_DETAIL",
  "REPORT_WRITER/RPTVIEW",
  "SEND_TRANS/REPRINT_VOUCHER",
  "SEND_TRANSNEW/SENDMONEY",
  "SEND_TRANSNEW/CHECKROUTEPATH",
  "SEND_TRANSNEW/SELECTROUTE",
];

export const searchAreaOptions = ["User Detail by Roles", "User Detail by Function", "Role Detail"];

export const userTypeOptions = ["User", "Admin"];

export const privilegeOptions = ["User", "Admin"];

export const userRoleOptions = [
  "Compliance-Staff",
  "Teller-Staff",
  "Operation In Charge Staff",
  "OPERATOR",
  "ADMIN FOR STAFF",
  "AGENT",
  "PART TIME STAFF",
];

export interface HeadOfficeUserRow {
  no: number;
  name: string;
  userId: string;
  lastLogin: string;
  lockStatus: "Locked" | "Unlocked";
  status: "Online" | "Offline";
  createdBy: string;
  createdDate: string;
  modifiedBy: string;
  modifiedDate: string;
}

export const headOfficeUserRows: HeadOfficeUserRow[] = [
  { no: 1, name: "INDRA PRASAD SHARMA", userId: "indra", lastLogin: "8/4/2026 11:53:42 PM", lockStatus: "Unlocked", status: "Online", createdBy: "pathak", createdDate: "5/29/2018 1:59:44 PM", modifiedBy: "SHUSMA", modifiedDate: "7/26/2024 12:51:33 PM" },
  { no: 2, name: "INFICARE", userId: "inficare", lastLogin: "8/4/2026 5:14:54 PM", lockStatus: "Unlocked", status: "Offline", createdBy: "admin", createdDate: "7/26/2016 3:29:44 PM", modifiedBy: "SHUSMA", modifiedDate: "12/2/2025 6:35:19 PM" },
  { no: 3, name: "PRATIK SANJEL", userId: "inficare_pratik", lastLogin: "6/5/2023 3:30:27 PM", lockStatus: "Unlocked", status: "Offline", createdBy: "inficare", createdDate: "2/4/2022 6:52:54 PM", modifiedBy: "SHUSMA", modifiedDate: "7/26/2024 11:56:03 AM" },
  { no: 4, name: "SUBISTA SHAKYA", userId: "inficare_subista", lastLogin: "", lockStatus: "Locked", status: "Offline", createdBy: "inficare", createdDate: "2/4/2022 6:56:11 PM", modifiedBy: "SHUSMA", modifiedDate: "7/26/2024 11:56:08 AM" },
  { no: 5, name: "JAMIR SHRESTHA", userId: "JAMIR", lastLogin: "", lockStatus: "Locked", status: "Offline", createdBy: "SHUSMA", createdDate: "9/24/2020 12:17:54 PM", modifiedBy: "SHUSMA", modifiedDate: "1/13/2022 9:35:58 AM" },
  { no: 6, name: "", userId: "januka", lastLogin: "", lockStatus: "Locked", status: "Offline", createdBy: "admin", createdDate: "1/16/2018 7:01:24 PM", modifiedBy: "PANCHA", modifiedDate: "3/31/2026 2:04:22 PM" },
  { no: 7, name: "SUSMA LAMA", userId: "LAMA", lastLogin: "8/4/2026 2:58:45 PM", lockStatus: "Unlocked", status: "Offline", createdBy: "SHUSMA", createdDate: "3/6/2023 11:40:49 AM", modifiedBy: "SANJAY", modifiedDate: "5/10/2026 11:24:14 AM" },
  { no: 8, name: "LAMA LAXMI", userId: "LAXMI", lastLogin: "8/4/2026 2:58:45 PM", lockStatus: "Unlocked", status: "Offline", createdBy: "pathak", createdDate: "10/15/2024 9:37:50 AM", modifiedBy: "SHUSMA", modifiedDate: "5/10/2026 12:26:12 PM" },
  { no: 9, name: "LE THAN THUY LINH", userId: "LE", lastLogin: "", lockStatus: "Locked", status: "Offline", createdBy: "pathak", createdDate: "5/30/2018 9:43:12 AM", modifiedBy: "PANCHA", modifiedDate: "2/24/2020 12:23:16 PM" },
  { no: 10, name: "MADHU REGMI", userId: "MADHU", lastLogin: "", lockStatus: "Locked", status: "Offline", createdBy: "SHUSMA", createdDate: "4/5/2021 9:04:15 AM", modifiedBy: "SHUSMA", modifiedDate: "11/24/2021 10:01:01 AM" },
  { no: 11, name: "MANISHA BHATTA", userId: "MANISHA", lastLogin: "8/4/2026 6:48:47 PM", lockStatus: "Unlocked", status: "Offline", createdBy: "pathak", createdDate: "9/4/2024 1:04:24 PM", modifiedBy: "pathak", modifiedDate: "10/6/2025 1:04:45 PM" },
  { no: 12, name: "NIGORIKAWA MAYU", userId: "MAYU", lastLogin: "8/1/2026 12:36:31 PM", lockStatus: "Unlocked", status: "Offline", createdBy: "pathak", createdDate: "12/21/2018 2:27:29 PM", modifiedBy: "SANJAY", modifiedDate: "4/15/2025 1:23:31 AM" },
  { no: 13, name: "MENUKA LAMA", userId: "MENUKA", lastLogin: "", lockStatus: "Locked", status: "Offline", createdBy: "SHUSMA", createdDate: "3/24/2021 3:38:26 AM", modifiedBy: "SHUSMA", modifiedDate: "11/9/2021 3:20:14 PM" },
  { no: 14, name: "MONDAL MAHAMMAD", userId: "MONDAL", lastLogin: "8/4/2026 1:42:34 PM", lockStatus: "Unlocked", status: "Offline", createdBy: "SHUSMA", createdDate: "4/22/2024 9:19:15 AM", modifiedBy: "BABURAM", modifiedDate: "10/24/2025 12:06:53 PM" },
  { no: 15, name: "NISHIJIMA TSUYOSI", userId: "NISHIJIMA", lastLogin: "8/3/2026 8:42:29 AM", lockStatus: "Unlocked", status: "Offline", createdBy: "PANCHA", createdDate: "9/24/2021 11:57:19 AM", modifiedBy: "BABURAM", modifiedDate: "8/3/2026 4:24:40 PM" },
  { no: 16, name: "PANCHA CHAUDHARY", userId: "PANCHA", lastLogin: "", lockStatus: "Locked", status: "Offline", createdBy: "admin", createdDate: "3/2/2018 11:24:19 AM", modifiedBy: "BABURAM", modifiedDate: "10/15/2024 9:47:13 AM" },
  { no: 17, name: "PARAOAN COMPATERLYA", userId: "PARAOAN", lastLogin: "8/4/2026 4:48:47 PM", lockStatus: "Unlocked", status: "Offline", createdBy: "SHUSMA", createdDate: "7/22/2020 11:34:43 AM", modifiedBy: "pathak", modifiedDate: "1/5/2026 9:07:43 AM" },
  { no: 18, name: "PASHUPATI BHANDARI", userId: "PASHUPATI", lastLogin: "8/4/2026 4:23:22 PM", lockStatus: "Unlocked", status: "Offline", createdBy: "pathak", createdDate: "7/1/2025 2:21:30 PM", modifiedBy: "BABURAM", modifiedDate: "7/11/2025 1:18:34 PM" },
  { no: 19, name: "RAMESHWAR PATHAK", userId: "pathak", lastLogin: "8/4/2026 8:08:06 PM", lockStatus: "Unlocked", status: "Offline", createdBy: "admin", createdDate: "5/28/2018 11:21:55 AM", modifiedBy: "SANJAY", modifiedDate: "6/16/2023 12:01:47 PM" },
  { no: 20, name: "VU NGUYEN PHUONG", userId: "phuong", lastLogin: "", lockStatus: "Locked", status: "Offline", createdBy: "pathak", createdDate: "7/16/2019 10:38:32 AM", modifiedBy: "PANCHA", modifiedDate: "9/18/2020 12:42:09 PM" },
  { no: 21, name: "PRATIGYA BHATTA", userId: "PRATIGYA", lastLogin: "", lockStatus: "Locked", status: "Offline", createdBy: "pathak", createdDate: "8/30/2018 8:06:47 AM", modifiedBy: "SHUSMA", modifiedDate: "3/16/2021 11:53:39 AM" },
  { no: 22, name: "RAGHU KARKI", userId: "raghu", lastLogin: "", lockStatus: "Locked", status: "Offline", createdBy: "pathak", createdDate: "5/28/2018 7:08:36 PM", modifiedBy: "PANCHA", modifiedDate: "10/9/2018 9:41:48 AM" },
  { no: 23, name: "RATAN KARKI", userId: "RATAN", lastLogin: "8/4/2026 8:56:39 AM", lockStatus: "Unlocked", status: "Offline", createdBy: "BABURAM", createdDate: "4/1/2026 9:28:17 AM", modifiedBy: "SANJAY", modifiedDate: "6/30/2026 12:49:11 PM" },
  { no: 24, name: "SARKAR RIYAD", userId: "RIYAD", lastLogin: "8/4/2026 7:20:15 PM", lockStatus: "Unlocked", status: "Offline", createdBy: "pathak", createdDate: "4/21/2025 1:36:40 PM", modifiedBy: "SANJAY", modifiedDate: "5/3/2025 11:13:34 AM" },
  { no: 25, name: "RUPESH POUDEL", userId: "RUPESH", lastLogin: "", lockStatus: "Locked", status: "Offline", createdBy: "SANJAY", createdDate: "12/8/2024 2:28:28 PM", modifiedBy: "SANJAY", modifiedDate: "6/5/2025 12:34:43 PM" },
  { no: 26, name: "SAMIR NEPAL", userId: "SAMIR", lastLogin: "", lockStatus: "Locked", status: "Offline", createdBy: "SHUSMA", createdDate: "1/4/2021 12:20:58 PM", modifiedBy: "SHUSMA", modifiedDate: "8/18/2021 4:08:06 PM" },
];

export interface RoleRecord {
  roleName: string;
  roleType: string;
}

export const roleRecords: RoleRecord[] = [
  { roleName: "Compliance-Staff", roleType: "Admin" },
  { roleName: "Teller-Staff", roleType: "Admin" },
  { roleName: "Operation In Charge Staff", roleType: "Admin" },
  { roleName: "OPERATOR", roleType: "Admin" },
  { roleName: "ADMIN FOR STAFF", roleType: "Admin" },
  { roleName: "AGENT", roleType: "Admin" },
  { roleName: "PART TIME STAFF", roleType: "Admin" },
  { roleName: "test", roleType: "Send International Agent" },
];
