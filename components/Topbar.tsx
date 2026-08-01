"use client";

import Image from "next/image";
import { Search, Bell, ChevronDown } from "lucide-react";
import { loggedInUser } from "@/data/staticData";

export default function Topbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-panel px-6">
      <div className="flex w-full max-w-sm items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
        <Search size={16} className="text-muted" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full bg-transparent text-sm text-heading placeholder:text-muted focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-5">
        <button className="flex items-center gap-1.5 text-sm text-heading/80">
          <span className="text-lg leading-none">🇺🇸</span>
          English
          <ChevronDown size={14} className="text-muted" />
        </button>

        <button className="relative rounded-full border border-border p-2">
          <Bell size={16} className="text-heading/70" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
            {loggedInUser.notificationCount}
          </span>
        </button>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-sm font-semibold text-heading">{loggedInUser.name}</p>
            <p className="text-xs text-muted">{loggedInUser.role}</p>
          </div>
          <div className="relative">
            <Image
              src={loggedInUser.avatarUrl}
              alt={loggedInUser.name}
              width={38}
              height={38}
              className="rounded-full object-cover"
            />
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-panel bg-brand-green" />
          </div>
        </div>
      </div>
    </header>
  );
}
