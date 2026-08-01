"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, LogOut } from "lucide-react";
import {
  mainNavItems,
  secondaryNavItems,
  tertiaryNavItems,
  footerUser,
  type NavItem,
} from "@/data/staticData";

function isItemActive(pathname: string, href: string) {
  if (href === "#") return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavRow({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;

  if (active) {
    return (
      <Link
        href={item.href}
        className="flex items-center justify-between rounded-xl bg-brand-green px-4 py-2.5 text-sm font-semibold text-white shadow-card"
      >
        <span className="flex items-center gap-3">
          <Icon size={18} strokeWidth={2} />
          {item.label}
        </span>
        <span className="h-1.5 w-1.5 rounded-full bg-white" />
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      className="flex items-center justify-between rounded-xl px-4 py-2.5 text-sm text-heading/80 transition-colors hover:bg-surface"
    >
      <span className="flex items-center gap-3">
        <Icon size={18} strokeWidth={2} className="text-muted" />
        {item.label}
      </span>
      {item.hasSubmenu && <ChevronRight size={16} className="text-muted" />}
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-panel">
      <div className="flex items-center gap-2 px-6 py-6">
        <span className="text-2xl font-extrabold tracking-tight text-brand-blue">
          Zio
        </span>
        <span className="text-2xl font-extrabold tracking-tight text-brand-green">
          Money
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 pb-4">
        <p className="px-2 pb-2 text-[11px] font-semibold tracking-wider text-muted">
          MAIN NAVIGATION
        </p>
        <div className="flex flex-col gap-1">
          {mainNavItems.map((item) => (
            <NavRow
              key={item.label}
              item={item}
              active={isItemActive(pathname, item.href)}
            />
          ))}
        </div>

        <div className="my-4 flex flex-col gap-1">
          {secondaryNavItems.map((item) => (
            <NavRow
              key={item.label}
              item={item}
              active={isItemActive(pathname, item.href)}
            />
          ))}
        </div>

        <div className="flex flex-col gap-1 border-t border-border pt-4">
          {tertiaryNavItems.map((item) => (
            <NavRow
              key={item.label}
              item={item}
              active={isItemActive(pathname, item.href)}
            />
          ))}
        </div>
      </nav>

      <div className="m-4 flex items-center gap-3 rounded-xl bg-brand-green-light px-3 py-3">
        <Image
          src={footerUser.avatarUrl}
          alt={footerUser.name}
          width={36}
          height={36}
          className="rounded-full object-cover"
        />
        <div className="flex-1">
          <p className="text-sm font-semibold text-heading">{footerUser.name}</p>
          <p className="text-xs text-brand-green-dark">{footerUser.role}</p>
        </div>
        <Link href="/login" aria-label="Log out" className="text-brand-green-dark">
          <LogOut size={16} />
        </Link>
      </div>
    </aside>
  );
}
