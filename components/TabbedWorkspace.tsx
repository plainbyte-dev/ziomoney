"use client";

import { useTabs } from "@/contexts/TabsContext";
import { tabRegistry } from "@/data/tabRegistry";
import TabBar from "./TabBar";
import Breadcrumbs from "./Breadcrumbs";

export default function TabbedWorkspace() {
  const { activeKey } = useTabs();
  const entry = tabRegistry[activeKey];

  if (!entry) return null;

  const ActivePanel = entry.component;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <TabBar />
      <main className="flex-1 overflow-y-auto px-6 py-6 sm:px-10">
        <div className="mb-4">
          <Breadcrumbs items={entry.breadcrumb} />
        </div>
        <ActivePanel />
      </main>
    </div>
  );
}