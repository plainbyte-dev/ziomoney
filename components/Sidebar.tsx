"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronRight, LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Logo from "./Logo";
import LogoutConfirmModal from "./LogoutConfirmModal";
import { useTabs } from "@/contexts/TabsContext";
import { useAuth } from "@/contexts/AuthContext";
import { tabRegistry } from "@/data/tabRegistry";
import {
  mainNavItems,
  secondaryNavItems,
  tertiaryNavItems,
  footerUser,
  type NavItem,
  type NavSubItem,
} from "@/data/staticData";

const CLOSE_DELAY_MS = 150;
const FLYOUT_WIDTH = 256; // px, matches w-64

type FlyoutPosition = { top: number; left: number };

function NavRow({
  item,
  isOpen,
  onOpen,
  onScheduleClose,
  onCancelClose,
}: {
  item: NavItem;
  isOpen: boolean;
  onOpen: (label: string, position: FlyoutPosition) => void;
  onScheduleClose: () => void;
  onCancelClose: () => void;
}) {
  const { activeKey, openTab } = useTabs();
  const Icon = item.icon;
  const hasSubmenu = Boolean(item.submenu?.length);
  const enabled = Boolean(item.tabKey) || hasSubmenu;
  const active = (enabled && item.tabKey === activeKey) || isOpen;
  const rowRef = useRef<HTMLDivElement | null>(null);

  function handleNavigate(tabKey: string, label: string) {
    const entry = tabRegistry[tabKey];
    openTab({
      key: tabKey,
      title: entry?.title ?? label,
      closable: entry?.closable,
    });
  }

  function openWithPosition() {
    const rect = rowRef.current?.getBoundingClientRect();
    if (!rect) return;
    onOpen(item.label, { top: rect.top, left: rect.right + 8 });
  }

  function handleClick() {
    if (hasSubmenu) {
      // Click toggles the flyout open (useful for touch/keyboard, and as a
      // "pin" so it doesn't require hovering).
      isOpen ? onScheduleClose() : openWithPosition();
      return;
    }
    if (!item.tabKey) return;
    handleNavigate(item.tabKey, item.label);
  }

  return (
    <div
      ref={rowRef}
      className="relative"
      onMouseEnter={() => hasSubmenu && openWithPosition()}
      onMouseLeave={() => hasSubmenu && onScheduleClose()}
    >
      <button
        onClick={handleClick}
        disabled={!enabled}
        className={
          active
            ? "flex w-full items-center justify-between rounded-xl bg-brand-green px-4 py-2.5 text-left text-sm font-semibold text-white shadow-card transition-all"
            : "flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-left text-sm text-heading/80 transition-colors hover:bg-surface disabled:cursor-default disabled:text-muted/60 disabled:hover:bg-transparent"
        }
      >
        <span className="flex items-center gap-3">
          <Icon
            size={18}
            strokeWidth={2}
            className={active ? undefined : enabled ? "text-muted" : "text-muted/50"}
          />
          {item.label}
        </span>
        {(item.hasSubmenu || hasSubmenu) && (
          <ChevronRight
            size={16}
            className={active ? "text-white" : "text-muted"}
          />
        )}
        {active && !hasSubmenu && (
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
        )}
      </button>
    </div>
  );
}

function Flyout({
  item,
  position,
  onNavigate,
  onCancelClose,
  onScheduleClose,
}: {
  item: NavItem;
  position: FlyoutPosition;
  onNavigate: (tabKey: string, label: string) => void;
  onCancelClose: () => void;
  onScheduleClose: () => void;
}) {
  // Keep the flyout on-screen if the row is near the bottom of the viewport.
  const maxTop =
    typeof window !== "undefined"
      ? Math.min(position.top, window.innerHeight - 24)
      : position.top;

  return (
    <div
      onMouseEnter={onCancelClose}
      onMouseLeave={onScheduleClose}
      style={{ top: maxTop, left: position.left, width: FLYOUT_WIDTH }}
      className="fixed z-50 rounded-xl border border-border bg-white p-2 shadow-popover"
    >
      <p className="px-3 pb-2 pt-1 text-[11px] font-semibold tracking-wider text-muted">
        {(item.submenuTitle ?? item.label).toUpperCase()}
      </p>
      <div className="flex flex-col gap-0.5">
        {item.submenu!.map((subItem: NavSubItem) => (
          <button
            key={subItem.label}
            onClick={() => {
              if (subItem.tabKey) onNavigate(subItem.tabKey, subItem.label);
              onScheduleClose();
            }}
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-heading/80 transition-colors hover:bg-surface"
          >
            {subItem.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Sidebar() {
  const { openTab } = useTabs();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [openLabel, setOpenLabel] = useState<string | null>(null);
  const [position, setPosition] = useState<FlyoutPosition | null>(null);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function cancelClose() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function scheduleClose() {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpenLabel(null), CLOSE_DELAY_MS);
  }

  function open(label: string, pos: FlyoutPosition) {
    cancelClose();
    setOpenLabel(label);
    setPosition(pos);
  }

  function handleFlyoutNavigate(tabKey: string, label: string) {
    const entry = tabRegistry[tabKey];
    openTab({
      key: tabKey,
      title: entry?.title ?? label,
      closable: entry?.closable,
    });
  }

  function confirmLogout() {
    setLogoutConfirmOpen(false);
    logout();
    router.push("/login");
  }

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  const allItems = [...mainNavItems, ...secondaryNavItems, ...tertiaryNavItems];
  const openItem = allItems.find((item) => item.label === openLabel);

  function renderItems(items: NavItem[]) {
    return items.map((item) => (
      <NavRow
        key={item.label}
        item={item}
        isOpen={openLabel === item.label}
        onOpen={open}
        onScheduleClose={scheduleClose}
        onCancelClose={cancelClose}
      />
    ));
  }

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-panel">
      <div className="flex items-center gap-2 border-b border-border px-6 py-6">
        <Logo size="md" />
      </div>

      <nav className="flex-1 overflow-y-auto px-4 pb-4 pt-4">
        <p className="px-2 pb-2 text-[11px] font-semibold tracking-wider text-muted">
          MAIN NAVIGATION
        </p>
        <div className="flex flex-col gap-1">{renderItems(mainNavItems)}</div>

        <div className="my-4 flex flex-col gap-1">{renderItems(secondaryNavItems)}</div>

        <div className="flex flex-col gap-1 border-t border-border pt-4">
          {renderItems(tertiaryNavItems)}
        </div>
      </nav>

      {openItem && position && (
        <Flyout
          item={openItem}
          position={position}
          onNavigate={handleFlyoutNavigate}
          onCancelClose={cancelClose}
          onScheduleClose={scheduleClose}
        />
      )}

      <div className="m-4 flex items-center gap-3 rounded-xl bg-brand-green-light px-3 py-3">
        <Image
          src={user?.avatarUrl ?? footerUser.avatarUrl}
          alt={user?.name ?? footerUser.name}
          width={36}
          height={36}
          className="rounded-full object-cover ring-2 ring-white"
        />
        <div className="flex-1">
          <p className="text-sm font-semibold text-heading">{user?.name ?? footerUser.name}</p>
          <p className="text-xs text-brand-green-dark">{user?.role ?? footerUser.role}</p>
        </div>
        <button
          type="button"
          onClick={() => setLogoutConfirmOpen(true)}
          aria-label="Log out"
          className="rounded-lg p-1.5 text-brand-green-dark hover:bg-white/70"
        >
          <LogOut size={16} />
        </button>
      </div>

      <LogoutConfirmModal
        open={logoutConfirmOpen}
        onCancel={() => setLogoutConfirmOpen(false)}
        onConfirm={confirmLogout}
      />
    </aside>
  );
}