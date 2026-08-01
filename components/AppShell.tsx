import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Breadcrumbs from "./Breadcrumbs";
import type { BreadcrumbItem } from "@/data/staticData";

export default function AppShell({
  breadcrumbItems,
  children,
}: {
  breadcrumbItems: BreadcrumbItem[];
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-surface">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-y-auto px-6 py-6 sm:px-10">
          <div className="mb-4">
            <Breadcrumbs items={breadcrumbItems} />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
