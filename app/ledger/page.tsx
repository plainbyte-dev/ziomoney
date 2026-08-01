import AppShell from "@/components/AppShell";
import LedgerListPanel from "@/components/LedgerListPanel";
import { ledgerListBreadcrumbs } from "@/data/ledgerData";

export default function LedgerListPage() {
  return (
    <AppShell breadcrumbItems={ledgerListBreadcrumbs}>
      <LedgerListPanel />
    </AppShell>
  );
}
