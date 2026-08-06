export const reportGroupOptions = ["--Select--", "Admin", "Partner", "Compliance", "Accounts", "Customer"];

export const columnDataTypeOptions = ["--Select--", "Text", "Number", "Date", "DateTime", "Boolean", "Currency"];

export interface ReportColumn {
  clmNameId: string;
  clmLabel: string;
  dataType: string;
  clmSource: string;
  clmSequence: number;
  allowNull: boolean;
}

export interface ReportParam {
  label: string;
  required?: boolean;
}

export interface SavedReport {
  id: number;
  name: string;
  group: string;
  tsql: string;
  enablePaging: boolean;
  columns: ReportColumn[];
  params: ReportParam[];
}

export const savedReports: SavedReport[] = [
  { id: 466, name: "Admin -0deposit type", group: "Admin", tsql: "SELECT * FROM deposit_type", enablePaging: true, columns: [], params: [{ label: "Deposit Type", required: true }] },
  { id: 465, name: "Admin -0SenderDetailsMigrate", group: "Admin", tsql: "SELECT * FROM sender_details WHERE ref_no = @RefNo AND customer_id = @NewCustomerId", enablePaging: false, columns: [], params: [{ label: "Ref No:", required: true }, { label: "New Customer ID:", required: true }] },
  { id: 459, name: "Admin -1c", group: "Admin", tsql: "SELECT * FROM report_1c", enablePaging: true, columns: [], params: [] },
  { id: 442, name: "Admin -agent", group: "Admin", tsql: "SELECT * FROM agent", enablePaging: true, columns: [], params: [{ label: "Agent Code", required: true }] },
  { id: 422, name: "Admin -Aging Report", group: "Admin", tsql: "SELECT * FROM aging_report", enablePaging: true, columns: [], params: [{ label: "From Date", required: true }, { label: "To Date", required: true }] },
  { id: 450, name: "Admin -Aging Report - Copy", group: "Admin", tsql: "SELECT * FROM aging_report", enablePaging: true, columns: [], params: [{ label: "From Date", required: true }, { label: "To Date", required: true }] },
  { id: 448, name: "Admin -balance", group: "Admin", tsql: "SELECT * FROM balance", enablePaging: true, columns: [], params: [{ label: "Branch", required: false }] },
  { id: 439, name: "Admin -Bluepan Transaction", group: "Admin", tsql: "SELECT * FROM bluepan_transaction", enablePaging: true, columns: [], params: [{ label: "Transaction No", required: true }] },
  { id: 449, name: "Admin -branch", group: "Admin", tsql: "SELECT * FROM branch", enablePaging: true, columns: [], params: [] },
  { id: 456, name: "Admin -c", group: "Admin", tsql: "SELECT * FROM report_c", enablePaging: true, columns: [], params: [] },
  { id: 447, name: "Admin -change", group: "Admin", tsql: "SELECT * FROM change_log", enablePaging: true, columns: [], params: [{ label: "From Date", required: true }, { label: "To Date", required: true }] },
  { id: 441, name: "Admin -comm bank", group: "Admin", tsql: "SELECT * FROM comm_bank", enablePaging: true, columns: [], params: [] },
  { id: 455, name: "Admin -cust", group: "Admin", tsql: "SELECT * FROM customer", enablePaging: true, columns: [], params: [{ label: "Customer ID", required: true }] },
  { id: 444, name: "Admin -cust detail", group: "Admin", tsql: "SELECT * FROM customer_detail", enablePaging: true, columns: [], params: [{ label: "Customer ID", required: true }] },
  { id: 473, name: "Admin -Customer detail list", group: "Admin", tsql: "SELECT * FROM customer_detail_list", enablePaging: true, columns: [], params: [] },
  { id: 434, name: "Admin -customer details", group: "Admin", tsql: "SELECT * FROM customer_details", enablePaging: true, columns: [], params: [{ label: "Customer ID", required: true }] },
  { id: 443, name: "Admin -customer txn", group: "Admin", tsql: "SELECT * FROM customer_txn", enablePaging: true, columns: [], params: [{ label: "Customer ID", required: true }, { label: "From Date", required: false }] },
  { id: 417, name: "Admin -Daily Paid Report", group: "Admin", tsql: "SELECT * FROM daily_paid_report", enablePaging: true, columns: [], params: [{ label: "Report Date", required: true }] },
  { id: 418, name: "Admin -Daily Sender Report", group: "Admin", tsql: "SELECT * FROM daily_sender_report", enablePaging: true, columns: [], params: [{ label: "Report Date", required: true }] },
  { id: 490, name: "Admin -Duplicate Customer", group: "Admin", tsql: "SELECT * FROM duplicate_customer", enablePaging: true, columns: [], params: [] },
];
