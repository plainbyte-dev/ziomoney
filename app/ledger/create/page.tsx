import AppShell from "@/components/AppShell";
import CreateLedgerForm from "@/components/CreateLedgerForm";
import { createLedgerBreadcrumbs } from "@/data/ledgerData";

export default function CreateLedgerPage() {
  return (
    <AppShell breadcrumbItems={createLedgerBreadcrumbs}>
      <CreateLedgerForm />
    </AppShell>
  );
}
