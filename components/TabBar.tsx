"use client";

import { X } from "lucide-react";
import { useTabs } from "@/contexts/TabsContext";
import { tabRegistry } from "@/data/tabRegistry";

export default function TabBar() {
  const { openTabs, activeKey, setActiveKey, closeTab } = useTabs();

  return (
    <div className="flex items-end gap-1 overflow-x-auto border-b border-border bg-surface px-4 pt-2">
      {openTabs.map((tab) => {
        const isActive = tab.key === activeKey;
        const closable = tabRegistry[tab.key]?.closable !== false;

        return (
          <div
            key={tab.key}
            onClick={() => setActiveKey(tab.key)}
            role="tab"
            aria-selected={isActive}
            className={`group flex max-w-[220px] shrink-0 cursor-pointer items-center gap-2 rounded-t-lg border px-4 py-2 text-sm ${
              isActive
                ? "border-border border-b-panel bg-panel font-semibold text-heading"
                : "border-transparent text-muted hover:bg-panel/70 hover:text-heading"
            }`}
          >
            <span className="truncate">{tab.title}</span>
            {closable && (
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  closeTab(tab.key);
                }}
                aria-label={`Close ${tab.title}`}
                className="shrink-0 rounded-full p-0.5 text-muted hover:bg-border hover:text-heading"
              >
                <X size={12} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}