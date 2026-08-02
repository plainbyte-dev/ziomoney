"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import TabbedWorkspace from "./TabbedWorkspace";
import { TabsProvider } from "@/contexts/TabsContext";
import { VouchersProvider } from "@/contexts/VouchersContext";
import { PartnersProvider } from "@/contexts/PartnersContext";
import { useAuth } from "@/contexts/AuthContext";

export default function AppShell() {
  const router = useRouter();
  const { user, hydrated } = useAuth();

  useEffect(() => {
    if (hydrated && !user) {
      router.replace("/login");
    }
  }, [hydrated, user, router]);

  if (!hydrated || !user) {
    return <div className="h-screen bg-surface" />;
  }

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
