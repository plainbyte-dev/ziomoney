// Country risk scores, keyed by ISO 3166 country/territory name (alphabetical).
// Scoring reflects FATF's June 2026 lists: 5 = "Call for Action" blacklist,
// 4 = "Increased Monitoring" grey list, 3 = other sanctioned/high-risk jurisdictions,
// 0 = low-risk developed economies, 1 = baseline default for everyone else.
export const countryRiskScores: RiskScoreRow[] = [
  { label: "Afghanistan", score: 3 },
  { label: "Åland Islands", score: 1 },
  { label: "Albania", score: 1 },
  { label: "Algeria", score: 1 },
  { label: "American Samoa", score: 1 },
  { label: "Andorra", score: 0 },
  { label: "Angola", score: 4 },
  { label: "Anguilla", score: 1 },
  { label: "Antarctica", score: 1 },
  { label: "Antigua and Barbuda", score: 1 },
  { label: "Argentina", score: 1 },
  { label: "Armenia", score: 1 },
  { label: "Aruba", score: 1 },
  { label: "Australia", score: 0 },
  { label: "Austria", score: 0 },
  { label: "Azerbaijan", score: 1 },
  { label: "Bahamas", score: 1 },
  { label: "Bahrain", score: 1 },
  { label: "Bangladesh", score: 1 },
  { label: "Barbados", score: 1 },
  { label: "Belarus", score: 3 },
  { label: "Belgium", score: 0 },
  { label: "Belize", score: 1 },
  { label: "Benin", score: 1 },
  { label: "Bermuda", score: 1 },
  { label: "Bhutan", score: 1 },
  { label: "Bolivia", score: 4 },
  { label: "Bonaire, Sint Eustatius and Saba", score: 1 },
  { label: "Bosnia and Herzegovina", score: 4 },
  { label: "Botswana", score: 1 },
  { label: "Bouvet Island", score: 1 },
  { label: "Brazil", score: 1 },
  { label: "British Indian Ocean Territory", score: 1 },
  { label: "Brunei Darussalam", score: 1 },
  { label: "Bulgaria", score: 1 },
  { label: "Burkina Faso", score: 1 },
  { label: "Burundi", score: 1 },
  { label: "Cabo Verde", score: 1 },
  { label: "Cambodia", score: 1 },
  { label: "Cameroon", score: 1 },
  { label: "Canada", score: 0 },
  { label: "Cayman Islands", score: 1 },
  { label: "Central African Republic", score: 1 },
  { label: "Chad", score: 1 },
  { label: "Chile", score: 1 },
  { label: "China", score: 1 },
  { label: "Christmas Island", score: 1 },
  { label: "Cocos (Keeling) Islands", score: 1 },
  { label: "Colombia", score: 1 },
  { label: "Comoros", score: 1 },
  { label: "Congo", score: 1 },
  { label: "Congo (Democratic Republic of the)", score: 3 },
  { label: "Cook Islands", score: 1 },
  { label: "Costa Rica", score: 1 },
  { label: "Côte d'Ivoire", score: 4 },
  { label: "Croatia", score: 1 },
  { label: "Cuba", score: 3 },
  { label: "Curaçao", score: 1 },
  { label: "Cyprus", score: 1 },
  { label: "Czechia", score: 1 },
  { label: "Denmark", score: 0 },
  { label: "Djibouti", score: 1 },
  { label: "Dominica", score: 1 },
  { label: "Dominican Republic", score: 1 },
  { label: "Ecuador", score: 1 },
  { label: "Egypt", score: 1 },
  { label: "El Salvador", score: 1 },
  { label: "Equatorial Guinea", score: 1 },
  { label: "Eritrea", score: 1 },
  { label: "Estonia", score: 0 },
  { label: "Eswatini", score: 1 },
  { label: "Ethiopia", score: 1 },
  { label: "Falkland Islands", score: 1 },
  { label: "Faroe Islands", score: 1 },
  { label: "Fiji", score: 1 },
  { label: "Finland", score: 0 },
  { label: "France", score: 0 },
  { label: "French Guiana", score: 1 },
  { label: "French Polynesia", score: 1 },
  { label: "French Southern Territories", score: 1 },
  { label: "Gabon", score: 1 },
  { label: "Gambia", score: 1 },
  { label: "Georgia", score: 1 },
  { label: "Germany", score: 0 },
  { label: "Ghana", score: 1 },
  { label: "Gibraltar", score: 1 },
  { label: "Greece", score: 1 },
  { label: "Greenland", score: 1 },
  { label: "Grenada", score: 1 },
  { label: "Guadeloupe", score: 1 },
  { label: "Guam", score: 1 },
  { label: "Guatemala", score: 1 },
  { label: "Guernsey", score: 1 },
  { label: "Guinea", score: 1 },
  { label: "Guinea-Bissau", score: 1 },
  { label: "Guyana", score: 1 },
  { label: "Haiti", score: 3 },
  { label: "Heard Island and McDonald Islands", score: 1 },
  { label: "Holy See", score: 1 },
  { label: "Honduras", score: 1 },
  { label: "Hong Kong", score: 1 },
  { label: "Hungary", score: 1 },
  { label: "Iceland", score: 0 },
  { label: "India", score: 1 },
  { label: "Indonesia", score: 1 },
  { label: "Iran", score: 5 },
  { label: "Iraq", score: 4 },
  { label: "Ireland", score: 0 },
  { label: "Isle of Man", score: 1 },
  { label: "Israel", score: 1 },
  { label: "Italy", score: 1 },
  { label: "Jamaica", score: 1 },
  { label: "Japan", score: 0 },
  { label: "Jersey", score: 1 },
  { label: "Jordan", score: 1 },
  { label: "Kazakhstan", score: 1 },
  { label: "Kenya", score: 1 },
  { label: "Kiribati", score: 1 },
  { label: "Korea (Democratic People's Republic of)", score: 5 },
  { label: "Korea (Republic of)", score: 1 },
  { label: "Kuwait", score: 4 },
  { label: "Kyrgyzstan", score: 1 },
  { label: "Lao PDR", score: 1 },
  { label: "Latvia", score: 1 },
  { label: "Lebanon", score: 4 },
  { label: "Lesotho", score: 1 },
  { label: "Liberia", score: 1 },
  { label: "Libya", score: 3 },
  { label: "Liechtenstein", score: 0 },
  { label: "Lithuania", score: 1 },
  { label: "Luxembourg", score: 0 },
  { label: "Macao", score: 1 },
  { label: "Madagascar", score: 1 },
  { label: "Malawi", score: 1 },
  { label: "Malaysia", score: 1 },
  { label: "Maldives", score: 1 },
  { label: "Mali", score: 4 },
  { label: "Malta", score: 1 },
  { label: "Marshall Islands", score: 1 },
  { label: "Martinique", score: 1 },
  { label: "Mauritania", score: 1 },
  { label: "Mauritius", score: 1 },
  { label: "Mayotte", score: 1 },
  { label: "Mexico", score: 1 },
  { label: "Micronesia", score: 1 },
  { label: "Moldova", score: 1 },
  { label: "Monaco", score: 4 },
  { label: "Mongolia", score: 1 },
  { label: "Montenegro", score: 1 },
  { label: "Montserrat", score: 1 },
  { label: "Morocco", score: 1 },
  { label: "Mozambique", score: 1 },
  { label: "Myanmar", score: 5 },
  { label: "Namibia", score: 1 },
  { label: "Nauru", score: 1 },
  { label: "Nepal", score: 4 },
  { label: "Netherlands", score: 0 },
  { label: "New Caledonia", score: 1 },
  { label: "New Zealand", score: 0 },
  { label: "Nicaragua", score: 3 },
  { label: "Niger", score: 1 },
  { label: "Nigeria", score: 1 },
  { label: "Niue", score: 1 },
  { label: "Norfolk Island", score: 1 },
  { label: "North Macedonia", score: 1 },
  { label: "Northern Mariana Islands", score: 1 },
  { label: "Norway", score: 0 },
  { label: "Oman", score: 1 },
  { label: "Pakistan", score: 1 },
  { label: "Palau", score: 1 },
  { label: "Palestine", score: 1 },
  { label: "Panama", score: 1 },
  { label: "Papua New Guinea", score: 4 },
  { label: "Paraguay", score: 1 },
  { label: "Peru", score: 1 },
  { label: "Philippines", score: 4 },
  { label: "Pitcairn", score: 1 },
  { label: "Poland", score: 1 },
  { label: "Portugal", score: 0 },
  { label: "Puerto Rico", score: 1 },
  { label: "Qatar", score: 1 },
  { label: "Réunion", score: 1 },
  { label: "Romania", score: 1 },
  { label: "Russian Federation", score: 3 },
  { label: "Rwanda", score: 1 },
  { label: "Saint Barthélemy", score: 1 },
  { label: "Saint Helena", score: 1 },
  { label: "Saint Kitts and Nevis", score: 1 },
  { label: "Saint Lucia", score: 1 },
  { label: "Saint Martin", score: 1 },
  { label: "Saint Pierre and Miquelon", score: 1 },
  { label: "Saint Vincent and the Grenadines", score: 1 },
  { label: "Samoa", score: 1 },
  { label: "San Marino", score: 1 },
  { label: "Sao Tome and Principe", score: 1 },
  { label: "Saudi Arabia", score: 1 },
  { label: "Senegal", score: 4 },
  { label: "Serbia", score: 1 },
  { label: "Seychelles", score: 1 },
  { label: "Sierra Leone", score: 1 },
  { label: "Singapore", score: 0 },
  { label: "Sint Maarten", score: 1 },
  { label: "Slovakia", score: 1 },
  { label: "Slovenia", score: 1 },
  { label: "Solomon Islands", score: 1 },
  { label: "Somalia", score: 3 },
  { label: "South Africa", score: 1 },
  { label: "South Georgia and the South Sandwich Islands", score: 1 },
  { label: "South Sudan", score: 4 },
  { label: "Spain", score: 0 },
  { label: "Sri Lanka", score: 1 },
  { label: "Sudan", score: 3 },
  { label: "Suriname", score: 1 },
  { label: "Svalbard and Jan Mayen", score: 1 },
  { label: "Sweden", score: 0 },
  { label: "Switzerland", score: 0 },
  { label: "Syrian Arab Republic", score: 3 },
  { label: "Taiwan", score: 1 },
  { label: "Tajikistan", score: 1 },
  { label: "Tanzania", score: 4 },
  { label: "Thailand", score: 1 },
  { label: "Timor-Leste", score: 1 },
  { label: "Togo", score: 1 },
  { label: "Tokelau", score: 1 },
  { label: "Tonga", score: 1 },
  { label: "Trinidad and Tobago", score: 1 },
  { label: "Tunisia", score: 1 },
  { label: "Turkey", score: 4 },
  { label: "Turkmenistan", score: 1 },
  { label: "Turks and Caicos Islands", score: 1 },
  { label: "Tuvalu", score: 1 },
  { label: "Uganda", score: 1 },
  { label: "Ukraine", score: 4 },
  { label: "United Arab Emirates", score: 4 },
  { label: "United Kingdom", score: 0 },
  { label: "United States", score: 0 },
  { label: "United States Minor Outlying Islands", score: 1 },
  { label: "Uruguay", score: 1 },
  { label: "Uzbekistan", score: 1 },
  { label: "Vanuatu", score: 1 },
  { label: "Venezuela", score: 4 },
  { label: "Vietnam", score: 1 },
  { label: "Virgin Islands (British)", score: 4 },
  { label: "Virgin Islands (U.S.)", score: 1 },
  { label: "Wallis and Futuna", score: 1 },
  { label: "Western Sahara", score: 1 },
  { label: "Yemen", score: 4 },
  { label: "Zambia", score: 1 },
  { label: "Zimbabwe", score: 3 },
];

// "update" -> a plain "Update" button that edits the weight.
// "country-risk" / "branch-risk" -> the same weight edit, but the button
// links out to a per-country / per-branch risk table (label only for now).
// "update-link" -> same edit action, styled as a text link instead of a button.
// "check" -> a boolean flag toggled by clicking the status indicator, no weight edit.
// "drill-in" -> the button opens a dedicated tab (see `tabKey`) instead of editing inline.
export type HighRiskManagementActionType =
  | "update"
  | "country-risk"
  | "branch-risk"
  | "update-link"
  | "check"
  | "drill-in";

export interface HighRiskManagementRow {
  typeName: string;
  weight: number;
  action: HighRiskManagementActionType;
  enabled?: boolean;
  tabKey?: string;
}

export const highRiskManagementRows: HighRiskManagementRow[] = [
  { typeName: "Payment Mode", weight: 5, action: "drill-in", tabKey: "payment-mode-risk" },
  { typeName: "Source Of Income", weight: 5, action: "drill-in", tabKey: "source-of-income-risk" },
  { typeName: "Reason for Remittance", weight: 5, action: "drill-in", tabKey: "reason-for-remittance-risk" },
  { typeName: "Sender Occupation", weight: 5, action: "drill-in", tabKey: "sender-occupation-risk" },
  { typeName: "Relation", weight: 5, action: "drill-in", tabKey: "relation-risk" },
  { typeName: "Compliance Range", weight: 5, action: "drill-in", tabKey: "compliance-range-risk" },
  { typeName: "Customer Visa Type", weight: 5, action: "drill-in", tabKey: "customer-visa-type-risk" },
  { typeName: "Risk Category - Receiver Nos", weight: 5, action: "update" },
  { typeName: "Risk Category - Age Group", weight: 5, action: "drill-in", tabKey: "age-group-risk" },
  { typeName: "Update Risk For Countries (Remitter Nationality / Payout Country)", weight: 5, action: "drill-in", tabKey: "high-risk-countries" },
  { typeName: "Update Risk For Branches", weight: 5, action: "drill-in", tabKey: "high-risk-branches" },
  { typeName: "Transaction Frequency", weight: 5, action: "drill-in", tabKey: "transaction-frequency" },
  { typeName: "If Customer Name suspected to Sanction/PEP", weight: 5, action: "check", enabled: true },
  { typeName: "Sender's Native country and Payout Country is not same.", weight: 5, action: "check", enabled: true },
  { typeName: "Remit Amount is more than Salary based on defined in Occupation", weight: 5, action: "check", enabled: true },
  { typeName: "KYC Mode", weight: 5, action: "check", enabled: true },
];

export interface RiskBand {
  label: string;
  range: string;
}

export const riskBands: RiskBand[] = [
  { label: "Low", range: "0% - 30%" },
  { label: "Medium", range: "30% - 80%" },
  { label: "High", range: "80% - 100%" },
];

export interface RiskScoreRow {
  label: string;
  score: number;
}

export const paymentModeRiskScores: RiskScoreRow[] = [
  { label: "Account Deposit", score: 0 },
  { label: "ACCOUNT DEPOSIT TO OTHER BANK", score: 0 },
  { label: "Bank Transfer", score: 0 },
  { label: "Cash Pay", score: 5 },
  { label: "DOOR TO DOOR", score: 1 },
  { label: "Real Time", score: 0 },
  { label: "Wallet", score: 1 },
];

export const sourceOfIncomeRiskScores: RiskScoreRow[] = [
  { label: "Business Profit", score: 3 },
  { label: "Compensation Payment", score: 2 },
  { label: "Donation", score: 2 },
  { label: "Insurance Payment", score: 1 },
  { label: "Investment", score: 5 },
  { label: "Online Business", score: 3 },
  { label: "Part Time Job", score: 2 },
  { label: "Pension", score: 0 },
  { label: "Salary", score: 1 },
  { label: "Saving", score: 3 },
];

export const reasonForRemittanceRiskScores: RiskScoreRow[] = [
  { label: "Business Capital", score: 3 },
  { label: "Family Support", score: 1 },
  { label: "Investment, Loan, Return Borrowed Money", score: 3 },
  { label: "Others", score: 4 },
  { label: "Payment for Goods or Services", score: 2 },
  { label: "Purchase of Property", score: 4 },
  { label: "Salary or Pension", score: 3 },
  { label: "Saving", score: 3 },
];

export const senderOccupationRiskScores: RiskScoreRow[] = [
  { label: "Employee (Staff Member of Association)", score: 1 },
  { label: "Executive of Association", score: 1 },
  { label: "Government Employee", score: 1 },
  { label: "House Wife", score: 2 },
  { label: "Others", score: 5 },
  { label: "Part-time worker", score: 2 },
  { label: "Retired, Unemplyoed", score: 2 },
  { label: "Self Employed", score: 4 },
  { label: "Student", score: 2 },
];

export const relationRiskScores: RiskScoreRow[] = [
  { label: "Brother/Sister", score: 1 },
  { label: "Business Partner", score: 3 },
  { label: "Cousin", score: 1 },
  { label: "Friends", score: 4 },
  { label: "Government Body", score: 0 },
  { label: "Grandparents", score: 1 },
  { label: "Nephew/Niece", score: 2 },
  { label: "Other", score: 5 },
  { label: "Parent", score: 1 },
  { label: "Parents-in-Law", score: 1 },
  { label: "Self", score: 1 },
  { label: "Son/Daughter", score: 1 },
  { label: "Spouse", score: 1 },
  { label: "Uncle/Aunt", score: 2 },
];

export const customerVisaTypeRiskScores: RiskScoreRow[] = [
  { label: "Artist", score: 2 },
  { label: "Business Manager", score: 3 },
  { label: "Cultural Activities", score: 2 },
  { label: "Dependent", score: 4 },
  { label: "Designated Activities", score: 3 },
  { label: "Diplomat/Official", score: 3 },
  { label: "Engineer/Specialist in Humanities/ International Services", score: 1 },
  { label: "Entertainer", score: 2 },
  { label: "Highly Skilled Profefssional", score: 1 },
  { label: "Instructor", score: 2 },
  { label: "Intra Company Transferee", score: 1 },
  { label: "Journalist", score: 3 },
  { label: "Legal/Accounting Services", score: 3 },
  { label: "Long Term Residents", score: 1 },
  { label: "Medical Services", score: 1 },
  { label: "NURSING CARE", score: 1 },
  { label: "Permanent Residents", score: 1 },
  { label: "Professor", score: 1 },
  { label: "Religious Activities", score: 3 },
  { label: "Researcher", score: 1 },
  { label: "Skilled Labor", score: 3 },
  { label: "SPECIFIED SKILLED WORKER", score: 3 },
  { label: "Spouse or Child of Japanese Nationals", score: 3 },
  { label: "Spouse or Child of Permanent Residents", score: 3 },
  { label: "Students", score: 2 },
  { label: "Technical Internship", score: 1 },
  { label: "Temporary Visitor", score: 5 },
  { label: "Trainee", score: 1 },
];

export const complianceRangeRiskScores: RiskScoreRow[] = [
  { label: "1 - 2,999", score: 1 },
  { label: "10,000 - 50,000", score: 3 },
  { label: "3,000 - 9,999", score: 2 },
];

export const ageGroupRiskScores: RiskScoreRow[] = [
  { label: "Below 25 Yrs", score: 1 },
  { label: "Below 45 Yrs", score: 1 },
  { label: "More than 45 Yrs", score: 1 },
];

export const riskScoreOptions = [0, 1, 2, 3, 4, 5];

export interface TransactionFrequencyRule {
  sno: number;
  flagged?: boolean;
  sendCountry: string;
  ruleName: string;
  payoutPartner: string;
  paymentType: string;
  applyIfAmtMore: string;
  requiredField1?: string;
  requiredField2?: string;
  requiredField3?: string;
  validationMsg: string;
}

export const transactionFrequencyRules: TransactionFrequencyRule[] = [
  {
    sno: 24,
    sendCountry: "All",
    ruleName: "Branch Name Mandatory",
    payoutPartner: "All Payout Agent",
    paymentType: "Bank Transfer",
    applyIfAmtMore: "ALL Amount",
    requiredField1: "Payout Branch Name - Manual Type",
    validationMsg: "PAY OUT BRANCH NAME IS MANDATORY",
  },
  {
    sno: 25,
    flagged: true,
    sendCountry: "Japan",
    ruleName: "LIMIT PER TRANSACTION",
    payoutPartner: "All Payout Agent",
    paymentType: "All Type",
    applyIfAmtMore: "1003001 in 0 days",
    validationMsg: "You are not allowed to send transaction beyond limit per transaction.",
  },
  {
    sno: 27,
    flagged: true,
    sendCountry: "Japan",
    ruleName: "LIMIT PER MONTH PER CUSTOMER",
    payoutPartner: "All Payout Agent",
    paymentType: "All Type",
    applyIfAmtMore: "1003001 in days",
    validationMsg: "Limit per transaction per customer exceeded",
  },
  {
    sno: 28,
    flagged: true,
    sendCountry: "All",
    ruleName: "NO OF TRANSACTION PER MONTH",
    payoutPartner: "All Payout Agent",
    paymentType: "All Type",
    applyIfAmtMore: "1003001 in days",
    validationMsg: "YOU ARE NOT ALLOW TO PROCEED MORE THAN 15 TRNASCTION IN A MONTH",
  },
  {
    sno: 29,
    flagged: true,
    sendCountry: "All",
    ruleName: "7 DAY SAME SENDER AND SAME RECEIVER",
    payoutPartner: "All Payout Agent",
    paymentType: "All Type",
    applyIfAmtMore: "ALL Amount",
    validationMsg: "YOU ARE NOT ALLOW TO SEND TO THE SAME RECEIVER WITHIN A WEEK",
  },
];

export interface BranchRiskRow {
  agentCode: string;
  country: string;
  branchName: string;
  riskScore: number | null;
}

export const highRiskBranches: BranchRiskRow[] = [
  { agentCode: "10000001", country: "JAPAN", branchName: "Head Office", riskScore: null },
  { agentCode: "10000004", country: "JAPAN", branchName: "JAPAN OFFICE", riskScore: null },
  { agentCode: "10000008", country: "JAPAN", branchName: "KAMATA SATELLITE STORE", riskScore: null },
  { agentCode: "10000009", country: "JAPAN", branchName: "Evergreen Shine", riskScore: null },
  { agentCode: "10006221", country: "JAPAN", branchName: "test", riskScore: null },
];
