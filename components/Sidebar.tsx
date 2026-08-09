"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronRight, LogOut, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Logo from "./Logo";
import LogoutConfirmModal from "./LogoutConfirmModal";
import { useTabs } from "@/contexts/TabsContext";
import { useAuth } from "@/contexts/AuthContext";
import { tabRegistry } from "@/data/tabRegistry";
import { loadState, saveState } from "@/lib/persist";
import {
  navGroups,
  footerUser,
  type NavItem,
  type NavSubItem,
} from "@/data/staticData";

const CLOSE_DELAY_MS = 150;
const FLYOUT_WIDTH = 256; // px, matches w-64
const COLLAPSED_STORAGE_KEY = "zio-sidebar-collapsed";

type FlyoutPosition = { top: number; left: number };

function NavRow({
  item,
  isOpen,
  collapsed,
  onOpen,
  onScheduleClose,
  onCancelClose,
}: {
  item: NavItem;
  isOpen: boolean;
  collapsed: boolean;
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
    // Collapsed rows are narrower — anchor flush to the icon rail's edge
    // instead of the (unused) label's would-be right edge.
    onOpen(item.label, { top: rect.top, left: rect.right + (collapsed ? 4 : 8) });
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

  if (collapsed) {
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
          title={item.label}
          aria-label={item.label}
          className={
            active
              ? "flex w-full items-center justify-center rounded-xl bg-brand-green py-2.5 text-white shadow-card transition-all"
              : "flex w-full items-center justify-center rounded-xl py-2.5 text-heading/80 transition-colors hover:bg-surface disabled:cursor-default disabled:text-muted/60 disabled:hover:bg-transparent"
          }
        >
          <Icon
            size={18}
            strokeWidth={2}
            className={active ? undefined : enabled ? "text-muted" : "text-muted/50"}
          />
        </button>
      </div>
    );
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
            ? "flex w-full items-center justify-between rounded-xl bg-brand-green px-4 py-2 text-left text-sm font-semibold text-white shadow-card transition-all"
            : "flex w-full items-center justify-between rounded-xl px-4 py-2 text-left text-sm text-heading/80 transition-colors hover:bg-surface disabled:cursor-default disabled:text-muted/60 disabled:hover:bg-transparent"
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
          <span className="h-1.5 w-1.5 rounded-full bg-panel" />
        )}
      </button>
    </div>
  );
}

// Clamp a flyout's top position so it stays on-screen when the anchoring row
// is near the bottom of the viewport.
function clampTop(top: number) {
  return typeof window !== "undefined" ? Math.min(top, window.innerHeight - 24) : top;
}

function SubMenuRow({
  subItem,
  isOpen,
  onOpenNested,
  onScheduleClose,
  onNavigate,
}: {
  subItem: NavSubItem;
  isOpen: boolean;
  onOpenNested: (label: string, position: FlyoutPosition) => void;
  onScheduleClose: () => void;
  onNavigate: (tabKey: string, label: string) => void;
}) {
  const hasNested = Boolean(subItem.submenu?.length);
  const rowRef = useRef<HTMLDivElement | null>(null);

  function openWithPosition() {
    const rect = rowRef.current?.getBoundingClientRect();
    if (!rect) return;
    onOpenNested(subItem.label, { top: rect.top, left: rect.right + 8 });
  }

  function handleClick() {
    if (hasNested) {
      isOpen ? onScheduleClose() : openWithPosition();
      return;
    }
    if (subItem.tabKey) onNavigate(subItem.tabKey, subItem.label);
  }

  return (
    <div
      ref={rowRef}
      onMouseEnter={() => hasNested && openWithPosition()}
      onMouseLeave={() => hasNested && onScheduleClose()}
    >
      <button
        onClick={handleClick}
        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-surface ${
          isOpen ? "bg-surface text-heading" : "text-heading/80"
        }`}
      >
        {subItem.label}
        {hasNested && <ChevronRight size={14} className="text-muted" />}
      </button>
    </div>
  );
}

function NestedFlyout({
  item,
  position,
  onNavigate,
  onCancelClose,
  onScheduleClose,
  onCloseAll,
}: {
  item: NavSubItem;
  position: FlyoutPosition;
  onNavigate: (tabKey: string, label: string) => void;
  onCancelClose: () => void;
  onScheduleClose: () => void;
  onCloseAll: () => void;
}) {
  return (
    <div
      onMouseEnter={onCancelClose}
      onMouseLeave={onScheduleClose}
      style={{ top: clampTop(position.top), left: position.left, width: FLYOUT_WIDTH }}
      className="fixed z-50 rounded-xl border border-border bg-panel p-2 shadow-popover"
    >
      <p className="px-3 pb-2 pt-1 text-[11px] font-semibold tracking-wider text-muted">
        {(item.submenuTitle ?? item.label).toUpperCase()}
      </p>
      <div className="flex flex-col gap-0.5">
        {item.submenu!.map((sub) => (
          <button
            key={sub.label}
            onClick={() => {
              if (sub.tabKey) onNavigate(sub.tabKey, sub.label);
              onCloseAll();
            }}
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-heading/80 transition-colors hover:bg-surface"
          >
            {sub.label}
          </button>
        ))}
      </div>
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
  const [openSubLabel, setOpenSubLabel] = useState<string | null>(null);
  const [subPosition, setSubPosition] = useState<FlyoutPosition | null>(null);
  const subCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function cancelSubClose() {
    if (subCloseTimer.current) {
      clearTimeout(subCloseTimer.current);
      subCloseTimer.current = null;
    }
  }

  function scheduleSubClose() {
    cancelSubClose();
    subCloseTimer.current = setTimeout(() => setOpenSubLabel(null), CLOSE_DELAY_MS);
  }

  function openSub(label: string, pos: FlyoutPosition) {
    // Hovering into a nested row means the pointer is still "inside" this
    // flyout's interaction area, even once it crosses the gap to the nested
    // panel — cancel this flyout's own close timer too, or it'll vanish out
    // from under the nested panel.
    onCancelClose();
    cancelSubClose();
    setOpenSubLabel(label);
    setSubPosition(pos);
  }

  function closeAll() {
    setOpenSubLabel(null);
    onScheduleClose();
  }

  useEffect(() => {
    return () => {
      if (subCloseTimer.current) clearTimeout(subCloseTimer.current);
    };
  }, []);

  const openSubItem = item.submenu?.find((sub) => sub.label === openSubLabel);

  return (
    <div
      onMouseEnter={onCancelClose}
      onMouseLeave={onScheduleClose}
      style={{ top: clampTop(position.top), left: position.left, width: FLYOUT_WIDTH }}
      className="fixed z-50 rounded-xl border border-border bg-panel p-2 shadow-popover"
    >
      <p className="px-3 pb-2 pt-1 text-[11px] font-semibold tracking-wider text-muted">
        {(item.submenuTitle ?? item.label).toUpperCase()}
      </p>
      <div
        className={`flex flex-col gap-0.5 ${
          item.submenu!.length > 6 ? "max-h-56 overflow-y-auto pr-1" : ""
        }`}
      >
        {item.submenu!.map((subItem: NavSubItem) => (
          <SubMenuRow
            key={subItem.label}
            subItem={subItem}
            isOpen={openSubLabel === subItem.label}
            onOpenNested={openSub}
            onScheduleClose={scheduleSubClose}
            onNavigate={(tabKey, label) => {
              onNavigate(tabKey, label);
              closeAll();
            }}
          />
        ))}
      </div>

      {openSubItem && subPosition && (
        <NestedFlyout
          item={openSubItem}
          position={subPosition}
          onNavigate={onNavigate}
          onCancelClose={() => {
            onCancelClose();
            cancelSubClose();
          }}
          onScheduleClose={() => {
            onScheduleClose();
            scheduleSubClose();
          }}
          onCloseAll={closeAll}
        />
      )}
    </div>
  );
}

// Mobile drawer is too narrow to anchor a side flyout off of, so submenus
// expand inline as an accordion instead — no hover, no fixed positioning.
function MobileNavRow({
  item,
  onNavigate,
}: {
  item: NavItem;
  onNavigate: (tabKey: string, label: string) => void;
}) {
  const { activeKey } = useTabs();
  const Icon = item.icon;
  const hasSubmenu = Boolean(item.submenu?.length);
  const enabled = Boolean(item.tabKey) || hasSubmenu;
  const active = enabled && item.tabKey === activeKey;
  const [expanded, setExpanded] = useState(false);

  function handleClick() {
    if (hasSubmenu) {
      setExpanded((v) => !v);
      return;
    }
    if (!item.tabKey) return;
    onNavigate(item.tabKey, item.label);
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={!enabled}
        className={
          active
            ? "flex w-full items-center justify-between rounded-xl bg-brand-green px-4 py-2 text-left text-sm font-semibold text-white shadow-card transition-all"
            : "flex w-full items-center justify-between rounded-xl px-4 py-2 text-left text-sm text-heading/80 transition-colors hover:bg-surface disabled:cursor-default disabled:text-muted/60 disabled:hover:bg-transparent"
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
        {hasSubmenu && (
          <ChevronRight
            size={16}
            className={`transition-transform ${expanded ? "rotate-90" : ""} ${active ? "text-white" : "text-muted"}`}
          />
        )}
        {active && !hasSubmenu && <span className="h-1.5 w-1.5 rounded-full bg-panel" />}
      </button>

      {hasSubmenu && expanded && (
        <div className="ml-4 mt-0.5 flex flex-col gap-0.5 border-l border-border pl-3">
          {item.submenu!.map((subItem) => (
            <MobileSubMenuRow key={subItem.label} subItem={subItem} onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </div>
  );
}

function MobileSubMenuRow({
  subItem,
  onNavigate,
}: {
  subItem: NavSubItem;
  onNavigate: (tabKey: string, label: string) => void;
}) {
  const hasNested = Boolean(subItem.submenu?.length);
  const [expanded, setExpanded] = useState(false);

  function handleClick() {
    if (hasNested) {
      setExpanded((v) => !v);
      return;
    }
    if (subItem.tabKey) onNavigate(subItem.tabKey, subItem.label);
  }

  return (
    <div>
      <button
        onClick={handleClick}
        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-heading/80 transition-colors hover:bg-surface"
      >
        {subItem.label}
        {hasNested && (
          <ChevronRight size={14} className={`text-muted transition-transform ${expanded ? "rotate-90" : ""}`} />
        )}
      </button>

      {hasNested && expanded && (
        <div className="ml-3 flex flex-col gap-0.5 border-l border-border pl-3">
          {subItem.submenu!.map((nested) => (
            <button
              key={nested.label}
              onClick={() => nested.tabKey && onNavigate(nested.tabKey, nested.label)}
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-heading/80 transition-colors hover:bg-surface"
            >
              {nested.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({
  mobileOpen,
  onCloseMobile,
}: {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const { activeKey, openTab } = useTabs();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [openLabel, setOpenLabel] = useState<string | null>(null);
  const [position, setPosition] = useState<FlyoutPosition | null>(null);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restore the user's last collapse choice; skip the very first save so it
  // can't race this restore and clobber what's in localStorage.
  const skipNextCollapsedSave = useRef(true);
  useEffect(() => {
    const saved = loadState<boolean>(COLLAPSED_STORAGE_KEY);
    if (saved !== null) setCollapsed(saved);
  }, []);
  useEffect(() => {
    if (skipNextCollapsedSave.current) {
      skipNextCollapsedSave.current = false;
      return;
    }
    saveState<boolean>(COLLAPSED_STORAGE_KEY, collapsed);
  }, [collapsed]);

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

  // Auto-dismiss the mobile drawer whenever navigation lands on a new tab —
  // covers both a direct NavRow click and picking an item from a flyout,
  // without threading a close callback through every nav sub-component.
  const skipFirstAutoClose = useRef(true);
  useEffect(() => {
    if (skipFirstAutoClose.current) {
      skipFirstAutoClose.current = false;
      return;
    }
    onCloseMobile();
  }, [activeKey, onCloseMobile]);

  const allItems = navGroups.flatMap((group) => group.items);
  const openItem = allItems.find((item) => item.label === openLabel);

  function renderItems(items: NavItem[]) {
    return items.map((item) => (
      <NavRow
        key={item.label}
        item={item}
        isOpen={openLabel === item.label}
        collapsed={collapsed}
        onOpen={open}
        onScheduleClose={scheduleClose}
        onCancelClose={cancelClose}
      />
    ));
  }

  function renderNav(collapsedFlag: boolean) {
    return (
      <nav className={`flex-1 pb-3 pt-3 ${collapsedFlag ? "px-2.5" : "px-4"}`}>
        {navGroups.map((group, index) => (
          <div key={group.heading} className={index === 0 ? "" : "mt-2 border-t border-border pt-2"}>
            {!collapsedFlag && (
              <p className="px-2 pb-1 text-[11px] font-semibold tracking-wider text-muted">
                {group.heading.toUpperCase()}
              </p>
            )}
            <div className="flex flex-col gap-0.5">{renderItems(group.items)}</div>
          </div>
        ))}
      </nav>
    );
  }

  function renderMobileNav() {
    return (
      <nav className="flex-1 overflow-y-auto px-4 pb-3 pt-3">
        {navGroups.map((group, index) => (
          <div key={group.heading} className={index === 0 ? "" : "mt-2 border-t border-border pt-2"}>
            <p className="px-2 pb-1 text-[11px] font-semibold tracking-wider text-muted">
              {group.heading.toUpperCase()}
            </p>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => (
                <MobileNavRow key={item.label} item={item} onNavigate={handleFlyoutNavigate} />
              ))}
            </div>
          </div>
        ))}
      </nav>
    );
  }

  function renderFooter(collapsedFlag: boolean) {
    return (
      <div
        className={`m-3 flex items-center rounded-xl bg-brand-green-light py-2.5 ${
          collapsedFlag ? "flex-col gap-2 px-2" : "gap-3 px-3"
        }`}
      >
        <Image
          src={user?.avatarUrl ?? footerUser.avatarUrl}
          alt={user?.name ?? footerUser.name}
          width={36}
          height={36}
          className="rounded-full object-cover ring-2 ring-white"
          title={collapsedFlag ? (user?.name ?? footerUser.name) : undefined}
        />
        {!collapsedFlag && (
          <div className="flex-1">
            <p className="text-sm font-semibold text-brand-green-dark">{user?.name ?? footerUser.name}</p>
            <p className="text-xs text-brand-green-dark">{user?.role ?? footerUser.role}</p>
          </div>
        )}
        <button
          type="button"
          onClick={() => setLogoutConfirmOpen(true)}
          aria-label="Log out"
          className="rounded-lg p-1.5 text-brand-green-dark hover:bg-white/70"
        >
          <LogOut size={16} />
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Desktop rail — permanent, collapsible via the pin toggle. */}
      <aside
        className={`relative hidden h-full shrink-0 flex-col border-r border-border bg-panel transition-[width] duration-150 lg:flex ${
          collapsed ? "w-[68px]" : "w-64"
        }`}
      >
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute -right-3 top-6 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-panel text-muted shadow-card hover:text-heading"
        >
          {collapsed ? <PanelLeftOpen size={13} /> : <PanelLeftClose size={13} />}
        </button>

        <div className={`flex items-center border-b border-border py-4 ${collapsed ? "justify-center px-2" : "gap-2 px-6"}`}>
          {collapsed ? (
            <span className="text-xl font-extrabold italic tracking-tight bg-gradient-to-r from-[#1E5AA8] to-[#8CC63F] bg-clip-text text-transparent">
              Z
            </span>
          ) : (
            <Logo size="md" />
          )}
        </div>

        {renderNav(collapsed)}

        {openItem && position && (
          <Flyout
            item={openItem}
            position={position}
            onNavigate={handleFlyoutNavigate}
            onCancelClose={cancelClose}
            onScheduleClose={scheduleClose}
          />
        )}

        {renderFooter(collapsed)}
      </aside>

      {/* Mobile drawer — slides in over the content, always fully expanded. */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-heading/40 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-72 max-w-[85vw] flex-col border-r border-border bg-panel shadow-popover transition-transform duration-200 lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <Logo size="md" />
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close menu"
            className="rounded-lg p-1.5 text-muted hover:bg-surface hover:text-heading"
          >
            <X size={18} />
          </button>
        </div>

        {renderMobileNav()}

        {renderFooter(false)}
      </aside>

      <LogoutConfirmModal
        open={logoutConfirmOpen}
        onCancel={() => setLogoutConfirmOpen(false)}
        onConfirm={confirmLogout}
      />
    </>
  );
}