import type { ComponentType } from "react";
import type { BreadcrumbItem } from "./staticData";
import CorrespondenceReportCard from "@/components/CorrespondenceReportCard";
import CorrespondenceReportResultsPanel from "@/components/CorrespondenceReportResultsPanel";
import LedgerListPanel from "@/components/LedgerListPanel";
import CreateLedgerForm from "@/components/CreateLedgerForm";
import DefineCreditLimitPanel from "@/components/DefineCreditLimitPanel";
import StatementOfAccountPanel from "@/components/StatementOfAccountPanel";
import VoucherEntryPanel from "@/components/VoucherEntryPanel";
import VoucherApprovalPanel from "@/components/VoucherApprovalPanel";
import PartnerInfoPanel from "@/components/PartnerInfoPanel";
import CreatePartnerForm from "@/components/CreatePartnerForm";
import PartnerBalanceCreditPanel from "@/components/PartnerBalanceCreditPanel";
import PayoutConfigurationPanel from "@/components/PayoutConfigurationPanel";
import PayoutBanksPanel from "@/components/PayoutBanksPanel";
import CorporateCustomerPanel from "@/components/CorporateCustomerPanel";
import CustomerDetailsPanel from "@/components/CustomerDetailsPanel";
import KycApprovalQueuePanel from "@/components/KycApprovalQueuePanel";
import ApprovedKycsPanel from "@/components/ApprovedKycsPanel";
import ExchangeRatesPanel from "@/components/ExchangeRatesPanel";
import CountryWiseExchangeRatePanel from "@/components/CountryWiseExchangeRatePanel";
import ServiceChargesPanel from "@/components/ServiceChargesPanel";
import MarginSetupPanel from "@/components/MarginSetupPanel";
import PartnerOfferRatePropose from "@/components/PartnerOfferRatePropose";
import PartnerOfferRateApprovals from "@/components/PartnerOfferRateApprovals";
import PartnerOfferRateCurrent from "@/components/PartnerOfferRateCurrent";
import PartnerOfferRateHistory from "@/components/PartnerOfferRateHistory";
import PartnerCommissionPanel from "@/components/PartnerCommissionPanel";
import TransactionQueryPanel from "@/components/TransactionQueryPanel";
import ComplianceTxnHoldsPanel from "@/components/ComplianceTxnHoldsPanel";
import BeneficiariesPanel from "@/components/BeneficiariesPanel";
import DailyReportPanel from "@/components/DailyReportPanel";
import SummaryReportPanel from "@/components/SummaryReportPanel";
import AuditTranLogPanel from "@/components/AuditTranLogPanel";
import DaysExceededTxnPanel from "@/components/DaysExceededTxnPanel";
import HighRiskCountriesPanel from "@/components/HighRiskCountriesPanel";
import HighRiskManagementPanel from "@/components/HighRiskManagementPanel";
import PaymentModeRiskPanel from "@/components/PaymentModeRiskPanel";
import SourceOfIncomeRiskPanel from "@/components/SourceOfIncomeRiskPanel";
import ReasonForRemittanceRiskPanel from "@/components/ReasonForRemittanceRiskPanel";
import SenderOccupationRiskPanel from "@/components/SenderOccupationRiskPanel";
import RelationRiskPanel from "@/components/RelationRiskPanel";
import CustomerVisaTypeRiskPanel from "@/components/CustomerVisaTypeRiskPanel";
import ComplianceRangeRiskPanel from "@/components/ComplianceRangeRiskPanel";
import AgeGroupRiskPanel from "@/components/AgeGroupRiskPanel";
import HighRiskBranchesPanel from "@/components/HighRiskBranchesPanel";
import ComplianceRulesSetupPanel from "@/components/ComplianceRulesSetupPanel";
import ComplianceRuleValuesPanel from "@/components/ComplianceRuleValuesPanel";
import AgentFileUploadPanel from "@/components/AgentFileUploadPanel";
import TransactionFrequencyPanel from "@/components/TransactionFrequencyPanel";
import TransactionSendPanel from "@/components/TransactionSendPanel";
import TransfersPanel from "@/components/TransfersPanel";
import TransactionRateReportPanel from "@/components/TransactionRateReportPanel";
import UnconfirmedListPanel from "@/components/UnconfirmedListPanel";
import UnconfirmedListPartnerApiPanel from "@/components/UnconfirmedListPartnerApiPanel";
import UnpaidTransactionsPanel from "@/components/UnpaidTransactionsPanel";
import PendingTransactionPanel from "@/components/PendingTransactionPanel";
import AuditUserRightsPartnerPanel from "@/components/AuditUserRightsPartnerPanel";
import CreateHeadOfficeUserPanel from "@/components/CreateHeadOfficeUserPanel";
import CreatePartnerUserPanel from "@/components/CreatePartnerUserPanel";
import HeadOfficeUserStatusPanel from "@/components/HeadOfficeUserStatusPanel";
import ManageRolesPanel from "@/components/ManageRolesPanel";
import ReportWriterPanel from "@/components/ReportWriterPanel";
import ReportListPanel from "@/components/ReportListPanel";

export interface TabRegistryEntry {
  title: string;
  breadcrumb: BreadcrumbItem[];
  component: ComponentType;
  closable?: boolean;
}

export const tabRegistry: Record<string, TabRegistryEntry> = {
  "correspondence-report": {
    title: "Correspondence Report",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Account Detail", href: "#" },
      { label: "Correspondence Report", href: "#", active: true },
    ],
    component: CorrespondenceReportCard,
    closable: false,
  },
  "correspondence-report-results": {
    title: "Report Results",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Correspondence Report", href: "#" },
      { label: "Report Results", href: "#", active: true },
    ],
    component: CorrespondenceReportResultsPanel,
  },
  "ledger-list": {
    title: "Ledger List",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Accounts Detail", href: "#" },
      { label: "Ledger List", href: "#", active: true },
    ],
    component: LedgerListPanel,
  },
  "ledger-create": {
    title: "Create New Ledger",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Ledger", href: "#" },
      { label: "Create", href: "#", active: true },
    ],
    component: CreateLedgerForm,
  },
  "voucher-entry": {
    title: "Voucher Entry",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Accounts Detail", href: "#" },
      { label: "Voucher Entry", href: "#", active: true },
    ],
    component: VoucherEntryPanel,
  },
  "voucher-approval": {
    title: "Voucher Approval",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Accounts Detail", href: "#" },
      { label: "Voucher Approval", href: "#", active: true },
    ],
    component: VoucherApprovalPanel,
  },
  "statement-of-account": {
    title: "Statement of Account",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Accounts Detail", href: "#" },
      { label: "Statement of Account", href: "#", active: true },
    ],
    component: StatementOfAccountPanel,
  },
  "partner-info": {
    title: "Partner Info",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Partners", href: "#" },
      { label: "Partner Info", href: "#", active: true },
    ],
    component: PartnerInfoPanel,
  },
  "partner-create": {
    title: "New Partner",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Partners", href: "#" },
      { label: "New Partner", href: "#", active: true },
    ],
    component: CreatePartnerForm,
  },
  "partner-balance-credit": {
    title: "Balance & Credit Adjustments",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Partners", href: "#" },
      { label: "Balance & Credit Adjustments", href: "#", active: true },
    ],
    component: PartnerBalanceCreditPanel,
  },
  "payout-configuration": {
    title: "Payout Configuration",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Partners", href: "#" },
      { label: "Payout Configuration", href: "#", active: true },
    ],
    component: PayoutConfigurationPanel,
  },
  "payout-banks": {
    title: "Payout Banks",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Partners", href: "#" },
      { label: "Payout Banks", href: "#", active: true },
    ],
    component: PayoutBanksPanel,
  },
  "corporate-customer": {
    title: "Corporate Customer",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Customer Detail", href: "#" },
      { label: "Corporate Customer", href: "#", active: true },
    ],
    component: CorporateCustomerPanel,
  },
  "customer-details": {
    title: "Customer Details",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Customer Detail", href: "#" },
      { label: "Customer Details", href: "#", active: true },
    ],
    component: CustomerDetailsPanel,
  },
  "kyc-approval-queue": {
    title: "KYC Approval Queue",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Customer Detail", href: "#" },
      { label: "KYC Approval Queue", href: "#", active: true },
    ],
    component: KycApprovalQueuePanel,
  },
  "kyc-approved-list": {
    title: "Approved KYCs",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Customer Detail", href: "#" },
      { label: "Approved KYCs", href: "#", active: true },
    ],
    component: ApprovedKycsPanel,
  },
  "credit-limit": {
    title: "Define Credit Limit",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Reports", href: "#" },
      { label: "Define Credit Limit", href: "#", active: true },
    ],
    component: DefineCreditLimitPanel,
  },
  "exchange-rates": {
    title: "Exchange Rates",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Exchange Rate & Commission", href: "#" },
      { label: "Exchange Rates", href: "#", active: true },
    ],
    component: ExchangeRatesPanel,
  },
  "exchange-rate-country-wise": {
    title: "Country Wise Exchange Rates",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Exchange Rate & Commission", href: "#" },
      { label: "Exchange Rates", href: "#" },
      { label: "Country Wise", href: "#", active: true },
    ],
    closable: true,
    component: CountryWiseExchangeRatePanel,
  },
  "service-charges": {
    title: "Service Charges",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Exchange Rate & Commission", href: "#" },
      { label: "Service Charges", href: "#", active: true },
    ],
    component: ServiceChargesPanel,
  },
  "margin-setup": {
    title: "Margin Setup",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Exchange Rate & Commission", href: "#" },
      { label: "Margin Setup", href: "#", active: true },
    ],
    component: MarginSetupPanel,
  },
  "partner-offer-rates-propose": {
    title: "Propose Offer Rate",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Exchange Rate & Commission", href: "#" },
      { label: "Partner Offer Rates", href: "#" },
      { label: "Propose", href: "#", active: true },
    ],
    component: PartnerOfferRatePropose,
  },
  "partner-offer-rates-approvals": {
    title: "Offer Rate Approvals",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Exchange Rate & Commission", href: "#" },
      { label: "Partner Offer Rates", href: "#" },
      { label: "Approvals", href: "#", active: true },
    ],
    component: PartnerOfferRateApprovals,
  },
  "partner-offer-rates-current": {
    title: "Current Offer Rate",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Exchange Rate & Commission", href: "#" },
      { label: "Partner Offer Rates", href: "#" },
      { label: "Current", href: "#", active: true },
    ],
    component: PartnerOfferRateCurrent,
  },
  "partner-offer-rates-history": {
    title: "Offer Rate History",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Exchange Rate & Commission", href: "#" },
      { label: "Partner Offer Rates", href: "#" },
      { label: "History", href: "#", active: true },
    ],
    component: PartnerOfferRateHistory,
  },
  "partner-commission": {
    title: "Partner Commission",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Exchange Rate & Commission", href: "#" },
      { label: "Partner Commission", href: "#", active: true },
    ],
    component: PartnerCommissionPanel,
  },
  beneficiaries: {
    title: "Beneficiaries",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Customer Detail", href: "#" },
      { label: "Beneficiaries", href: "#", active: true },
    ],
    component: BeneficiariesPanel,
  },
  "transaction-query": {
    title: "Transaction Query",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Utility", href: "#" },
      { label: "Transaction Query", href: "#", active: true },
    ],
    component: TransactionQueryPanel,
  },
  "agent-file-upload": {
    title: "Upload Files",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Agent", href: "#" },
      { label: "Upload Files", href: "#", active: true },
    ],
    closable: true,
    component: AgentFileUploadPanel,
  },
  "daily-report": {
    title: "Daily Report",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Accounts Detail", href: "#" },
      { label: "Daily Report", href: "#", active: true },
    ],
    component: DailyReportPanel,
  },
  "summary-report": {
    title: "Summary Report",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Accounts Detail", href: "#" },
      { label: "Summary Report", href: "#", active: true },
    ],
    component: SummaryReportPanel,
  },
  "audit-tran-log": {
    title: "Audit Tran Log",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Security", href: "#" },
      { label: "Audit Tran Log", href: "#", active: true },
    ],
    component: AuditTranLogPanel,
  },
  "days-exceeded-txn-requests": {
    title: "Days Exceeded TXN Requests",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Security", href: "#" },
      { label: "Days Exceeded TXN Requests", href: "#", active: true },
    ],
    component: DaysExceededTxnPanel,
  },
  "high-risk-countries": {
    title: "High Risk Countries",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Compliance", href: "#" },
      { label: "Risk Profiling", href: "#" },
      { label: "High Risk Countries", href: "#", active: true },
    ],
    component: HighRiskCountriesPanel,
  },
  "high-risk-management": {
    title: "High Risk Management",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Compliance", href: "#" },
      { label: "Risk Profiling", href: "#" },
      { label: "High Risk Management", href: "#", active: true },
    ],
    component: HighRiskManagementPanel,
  },
  "payment-mode-risk": {
    title: "Payment Mode",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Compliance", href: "#" },
      { label: "Risk Profiling", href: "#" },
      { label: "High Risk Management", href: "#" },
      { label: "Payment Mode", href: "#", active: true },
    ],
    closable: true,
    component: PaymentModeRiskPanel,
  },
  "source-of-income-risk": {
    title: "Source Of Income",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Compliance", href: "#" },
      { label: "Risk Profiling", href: "#" },
      { label: "High Risk Management", href: "#" },
      { label: "Source Of Income", href: "#", active: true },
    ],
    closable: true,
    component: SourceOfIncomeRiskPanel,
  },
  "reason-for-remittance-risk": {
    title: "Reason for Remittance",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Compliance", href: "#" },
      { label: "Risk Profiling", href: "#" },
      { label: "High Risk Management", href: "#" },
      { label: "Reason for Remittance", href: "#", active: true },
    ],
    closable: true,
    component: ReasonForRemittanceRiskPanel,
  },
  "sender-occupation-risk": {
    title: "Sender Occupation",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Compliance", href: "#" },
      { label: "Risk Profiling", href: "#" },
      { label: "High Risk Management", href: "#" },
      { label: "Sender Occupation", href: "#", active: true },
    ],
    closable: true,
    component: SenderOccupationRiskPanel,
  },
  "relation-risk": {
    title: "Relation",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Compliance", href: "#" },
      { label: "Risk Profiling", href: "#" },
      { label: "High Risk Management", href: "#" },
      { label: "Relation", href: "#", active: true },
    ],
    closable: true,
    component: RelationRiskPanel,
  },
  "customer-visa-type-risk": {
    title: "Customer Visa Type",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Compliance", href: "#" },
      { label: "Risk Profiling", href: "#" },
      { label: "High Risk Management", href: "#" },
      { label: "Customer Visa Type", href: "#", active: true },
    ],
    closable: true,
    component: CustomerVisaTypeRiskPanel,
  },
  "compliance-range-risk": {
    title: "Compliance Range",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Compliance", href: "#" },
      { label: "Risk Profiling", href: "#" },
      { label: "High Risk Management", href: "#" },
      { label: "Compliance Range", href: "#", active: true },
    ],
    closable: true,
    component: ComplianceRangeRiskPanel,
  },
  "age-group-risk": {
    title: "Risk Category - Age Group",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Compliance", href: "#" },
      { label: "Risk Profiling", href: "#" },
      { label: "High Risk Management", href: "#" },
      { label: "Risk Category - Age Group", href: "#", active: true },
    ],
    closable: true,
    component: AgeGroupRiskPanel,
  },
  "compliance-rules-setup": {
    title: "Compliance Rules Setup",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Compliance", href: "#" },
      { label: "Compliance Rules Setup", href: "#", active: true },
    ],
    closable: true,
    component: ComplianceRulesSetupPanel,
  },
  "compliance-rule-values": {
    title: "Compliance Rule Values",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Compliance", href: "#" },
      { label: "Compliance Rule Values", href: "#", active: true },
    ],
    closable: true,
    component: ComplianceRuleValuesPanel,
  },
  "compliance-txn-holds": {
    title: "Transaction Compliance Holds",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Compliance", href: "#" },
      { label: "Transaction Compliance Holds", href: "#", active: true },
    ],
    closable: true,
    component: ComplianceTxnHoldsPanel,
  },
  "high-risk-branches": {
    title: "High Risk Branches",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Compliance", href: "#" },
      { label: "Risk Profiling", href: "#" },
      { label: "High Risk Management", href: "#" },
      { label: "High Risk Branches", href: "#", active: true },
    ],
    closable: true,
    component: HighRiskBranchesPanel,
  },
  "transaction-frequency": {
    title: "Transaction Frequency",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Compliance", href: "#" },
      { label: "Risk Profiling", href: "#" },
      { label: "High Risk Management", href: "#" },
      { label: "Transaction Frequency", href: "#", active: true },
    ],
    closable: true,
    component: TransactionFrequencyPanel,
  },
  "transaction-send": {
    title: "Transaction Send",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Remittances", href: "#" },
      { label: "Send Transaction", href: "#", active: true },
    ],
    closable: true,
    component: TransactionSendPanel,
  },
  transfers: {
    title: "Transfers",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Remittances", href: "#" },
      { label: "Transfers", href: "#", active: true },
    ],
    closable: true,
    component: TransfersPanel,
  },
  "transaction-rate-report": {
    title: "Transaction Rate Report",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Remittances", href: "#" },
      { label: "Transaction Rate Report", href: "#", active: true },
    ],
    closable: true,
    component: TransactionRateReportPanel,
  },
  "unconfirmed-list": {
    title: "Un-Confirmed List",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Remittances", href: "#" },
      { label: "Un-Confirmed List", href: "#", active: true },
    ],
    closable: true,
    component: UnconfirmedListPanel,
  },
  "unconfirmed-list-partner-api": {
    title: "Un-Confirmed List (Partner API)",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Remittances", href: "#" },
      { label: "Un-Confirmed List (Partner API)", href: "#", active: true },
    ],
    closable: true,
    component: UnconfirmedListPartnerApiPanel,
  },
  "unpaid-transactions": {
    title: "Unpaid Transactions",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Remittances", href: "#" },
      { label: "Unpaid Transactions", href: "#", active: true },
    ],
    closable: true,
    component: UnpaidTransactionsPanel,
  },
  "pending-transaction": {
    title: "Pending Transaction",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Remittances", href: "#" },
      { label: "Pending Transaction", href: "#", active: true },
    ],
    closable: true,
    component: PendingTransactionPanel,
  },
  "audit-user-rights-partner": {
    title: "Audit User Rights - Partner",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "User Management and Security", href: "#" },
      { label: "Audit User Rights - Partner", href: "#", active: true },
    ],
    closable: true,
    component: AuditUserRightsPartnerPanel,
  },
  "create-head-office-user": {
    title: "Create Head Office User",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "User Management and Security", href: "#" },
      { label: "Create Head Office User", href: "#", active: true },
    ],
    closable: true,
    component: CreateHeadOfficeUserPanel,
  },
  "create-partner-user": {
    title: "Create Partner User",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "User Management and Security", href: "#" },
      { label: "Create Partner User", href: "#", active: true },
    ],
    closable: true,
    component: CreatePartnerUserPanel,
  },
  "head-office-user-status": {
    title: "Head Office User Status",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "User Management and Security", href: "#" },
      { label: "Head Office User Status", href: "#", active: true },
    ],
    closable: true,
    component: HeadOfficeUserStatusPanel,
  },
  "manage-roles": {
    title: "Manage Roles",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "User Management and Security", href: "#" },
      { label: "Manage Roles", href: "#", active: true },
    ],
    closable: true,
    component: ManageRolesPanel,
  },
  "report-writer": {
    title: "Report Writer",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Operations & Admin", href: "#" },
      { label: "Reports", href: "#" },
      { label: "Report Writer", href: "#", active: true },
    ],
    closable: true,
    component: ReportWriterPanel,
  },
  "report-list": {
    title: "Report List",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Operations & Admin", href: "#" },
      { label: "Reports", href: "#" },
      { label: "Report List", href: "#", active: true },
    ],
    closable: true,
    component: ReportListPanel,
  },
};

// "Payout Partner Wise" is scoped to one partner at a time, so it can't be a
// single static entry in the registry above the way every other tab is —
// this key format lets one tab exist per partner+kind (opening a second
// partner's tab doesn't clobber the first one still open). It also encodes
// which button opened it — ExchangeRatesPanel's "Payout Partner Wise"
// (kind "rate": approved offer rates + propose) vs. ServiceChargesPanel's
// (kind "service-charge": the Commission-backed Service Charge Setup form
// only) — so the two intents render as two separate tabs instead of one
// page mashing both sections together regardless of which button was
// clicked. TabbedWorkspace special-cases this prefix instead of looking it
// up in tabRegistry directly.
export type PayoutPartnerWiseKind = "rate" | "service-charge";
const PAYOUT_PARTNER_WISE_PREFIX = "payout-partner-wise:";

export function payoutPartnerWiseTabKey(partnerName: string, kind: PayoutPartnerWiseKind): string {
  return `${PAYOUT_PARTNER_WISE_PREFIX}${kind}:${partnerName}`;
}

export function parsePayoutPartnerWiseTabKey(
  key: string
): { kind: PayoutPartnerWiseKind; partnerName: string } | null {
  if (!key.startsWith(PAYOUT_PARTNER_WISE_PREFIX)) return null;
  const rest = key.slice(PAYOUT_PARTNER_WISE_PREFIX.length);
  const separatorIndex = rest.indexOf(":");
  if (separatorIndex === -1) return null;
  const kind = rest.slice(0, separatorIndex);
  const partnerName = rest.slice(separatorIndex + 1);
  if (kind !== "rate" && kind !== "service-charge") return null;
  return { kind, partnerName };
}