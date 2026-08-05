"use client";

import { useTabs } from "@/contexts/TabsContext";
import { tabRegistry } from "@/data/tabRegistry";
import TabBar from "./TabBar";
import Breadcrumbs from "./Breadcrumbs";

export default function TabbedWorkspace() {
  const { activeKey } = useTabs();
  const entry = tabRegistry[activeKey];

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <TabBar />
      <main className="flex-1 overflow-y-auto px-6 py-6 sm:px-10">
        {entry ? (
          <>
            <div className="mb-4">
              <Breadcrumbs items={entry.breadcrumb} />
            </div>
            <entry.component />
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center text-muted">
            <p className="text-sm">Select an item from the sidebar to get started.</p>
          </div>
        )}
      </main>
    </div>
  );
}