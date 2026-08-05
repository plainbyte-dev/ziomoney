"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { loadState, saveState } from "@/lib/persist";
import { initialNotifications, type NotificationEntry } from "@/data/notificationsData";

interface NotificationsContextValue {
  notifications: NotificationEntry[];
  unreadCount: number;
  notify: (entry: { title: string; message: string }) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

const STORAGE_KEY = "zio-notifications-state";
const MAX_NOTIFICATIONS = 50;

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

let localIdCounter = 0;

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationEntry[]>(initialNotifications);

  useEffect(() => {
    const saved = loadState<NotificationEntry[]>(STORAGE_KEY);
    if (saved) setNotifications(saved);
  }, []);

  // Skip the very first save (still holds the pre-restore default state) so it
  // can't race the restore effect above and clobber what's in localStorage.
  const skipNextSave = useRef(true);
  useEffect(() => {
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    saveState(STORAGE_KEY, notifications);
  }, [notifications]);

  const notify = useCallback((entry: { title: string; message: string }) => {
    setNotifications((prev) => [
      {
        id: `N-LIVE-${Date.now()}-${++localIdCounter}`,
        title: entry.title,
        message: entry.message,
        createdAt: new Date().toISOString(),
        read: false,
      },
      ...prev,
    ].slice(0, MAX_NOTIFICATIONS));
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const value = useMemo(
    () => ({ notifications, unreadCount, notify, markRead, markAllRead }),
    [notifications, unreadCount, notify, markRead, markAllRead]
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within a NotificationsProvider");
  }
  return ctx;
}
