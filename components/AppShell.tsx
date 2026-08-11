"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import TabbedWorkspace from "./TabbedWorkspace";
import ToastHost from "./ToastHost";
import { TabsProvider } from "@/contexts/TabsContext";
import { VouchersProvider } from "@/contexts/VouchersContext";
import { PartnersProvider } from "@/contexts/PartnersContext";
import { KycProvider } from "@/contexts/KycContext";
import { RatesProvider } from "@/contexts/RatesContext";
import { ComplianceRuleProvider } from "@/contexts/ComplianceRuleContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { useAuth } from "@/contexts/AuthContext";
import Spinner from "./Spinner";

export default function AppShell() {
  const router = useRouter();
  const { user, hydrated } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const openMobileSidebar = useCallback(() => setMobileSidebarOpen(true), []);
  const closeMobileSidebar = useCallback(() => setMobileSidebarOpen(false), []);

  useEffect(() => {
    if (hydrated && !user) {
      router.replace("/login");
    }
  }, [hydrated, user, router]);

  if (!hydrated || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface">
        <Spinner className="h-8 w-8 text-brand-green" />
      </div>
    );
  }

  return (
    <TabsProvider>
      <ToastProvider>
        <NotificationsProvider>
          <VouchersProvider>
            <PartnersProvider>
              <KycProvider>
                <RatesProvider>
                  <ComplianceRuleProvider>
                    <div className="flex h-screen bg-surface">
                      <Sidebar mobileOpen={mobileSidebarOpen} onCloseMobile={closeMobileSidebar} />
                      <div className="flex flex-1 flex-col overflow-hidden">
                        <Topbar onOpenMobileMenu={openMobileSidebar} />
                        <TabbedWorkspace />
                      </div>
                    </div>
                    <ToastHost />
                  </ComplianceRuleProvider>
                </RatesProvider>
              </KycProvider>
            </PartnersProvider>
          </VouchersProvider>
        </NotificationsProvider>
      </ToastProvider>
    </TabsProvider>
  );
}
