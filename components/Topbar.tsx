"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Search, Bell, ChevronDown } from "lucide-react";
import NotificationsPanel from "./NotificationsPanel";
import DataModeToggle from "./DataModeToggle";
import { loggedInUser } from "@/data/staticData";
import { initialNotifications, type NotificationEntry } from "@/data/notificationsData";
import { useAuth } from "@/contexts/AuthContext";

export default function Topbar() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationEntry[]>(initialNotifications);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function markRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-panel px-6 shadow-[0_1px_0_rgba(16,24,40,0.02)]">
      <div className="flex w-full max-w-sm items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 transition-colors focus-within:border-brand-green">
        <Search size={16} className="text-muted" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full bg-transparent text-sm text-heading placeholder:text-muted focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-5">
        <DataModeToggle />

        <button className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-heading/80 hover:bg-surface">
          <span className="text-lg leading-none">🇺🇸</span>
          English
          <ChevronDown size={14} className="text-muted" />
        </button>

        <div ref={notificationsRef} className="relative">
          <button
            onClick={() => setNotificationsOpen((v) => !v)}
            aria-label="Notifications"
            className="relative rounded-full border border-border p-2 hover:bg-surface"
          >
            <Bell size={16} className="text-heading/70" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white ring-2 ring-panel">
                {unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <NotificationsPanel
              notifications={notifications}
              onMarkRead={markRead}
              onMarkAllRead={markAllRead}
            />
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-sm font-semibold text-heading">{user?.name ?? loggedInUser.name}</p>
            <p className="text-xs text-muted">{user?.role ?? loggedInUser.role}</p>
          </div>
          <div className="relative">
            <Image
              src={user?.avatarUrl ?? loggedInUser.avatarUrl}
              alt={user?.name ?? loggedInUser.name}
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
