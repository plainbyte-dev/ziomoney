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
import CorporateCustomerPanel from "@/components/CorporateCustomerPanel";
import CustomerDetailsPanel from "@/components/CustomerDetailsPanel";
import KycApprovalQueuePanel from "@/components/KycApprovalQueuePanel";
import ApprovedKycsPanel from "@/components/ApprovedKycsPanel";
import ExchangeRatesPanel from "@/components/ExchangeRatesPanel";
import ServiceChargesPanel from "@/components/ServiceChargesPanel";
import MarginSetupPanel from "@/components/MarginSetupPanel";
import CountryCurrencyPanel from "@/components/CountryCurrencyPanel";
import PartnerOfferRatesPanel from "@/components/PartnerOfferRatesPanel";
import PartnerCommissionPanel from "@/components/PartnerCommissionPanel";
import TransactionQueryPanel from "@/components/TransactionQueryPanel";
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
import TransactionFrequencyPanel from "@/components/TransactionFrequencyPanel";
import TransactionSendPanel from "@/components/TransactionSendPanel";
import UnconfirmedListPanel from "@/components/UnconfirmedListPanel";
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
  "country-currency": {
    title: "Country / Currency",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Exchange Rate & Commission", href: "#" },
      { label: "Country / Currency", href: "#", active: true },
    ],
    component: CountryCurrencyPanel,
  },
  "partner-offer-rates": {
    title: "Partner Offer Rates",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Exchange Rate & Commission", href: "#" },
      { label: "Partner Offer Rates", href: "#", active: true },
    ],
    component: PartnerOfferRatesPanel,
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