import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import TabbedWorkspace from "./TabbedWorkspace";
import { TabsProvider } from "@/contexts/TabsContext";
import { VouchersProvider } from "@/contexts/VouchersContext";
import { PartnersProvider } from "@/contexts/PartnersContext";

export default function AppShell() {
  return (
    <TabsProvider>
      <VouchersProvider>
        <PartnersProvider>
          <div className="flex h-screen bg-surface">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
              <Topbar />
              <TabbedWorkspace />
            </div>
          </div>
        </PartnersProvider>
      </VouchersProvider>
    </TabsProvider>
  );
}