import AppShell from "@/components/AppShell";
import CorrespondenceReportCard from "@/components/CorrespondenceReportCard";
import { correspondenceReportBreadcrumbs } from "@/data/staticData";

export default function Home() {
  return (
    <AppShell breadcrumbItems={correspondenceReportBreadcrumbs}>
      <CorrespondenceReportCard />
    </AppShell>
  );
}
