"use client";

import { BellOff, Check } from "lucide-react";
import type { NotificationEntry } from "@/data/notificationsData";
import { formatRelativeTime } from "@/lib/time";

interface NotificationsPanelProps {
  notifications: NotificationEntry[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

export default function NotificationsPanel({
  notifications,
  onMarkRead,
  onMarkAllRead,
}: NotificationsPanelProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-white shadow-popover">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="text-sm font-semibold text-heading">Notifications</p>
        <button
          type="button"
          onClick={onMarkAllRead}
          disabled={unreadCount === 0}
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-blue hover:underline disabled:cursor-not-allowed disabled:text-muted disabled:no-underline"
        >
          <Check size={12} />
          Mark all read
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-4 py-10 text-center text-sm text-muted">
            <BellOff size={20} className="text-muted" />
            No notifications yet.
          </div>
        )}

        {notifications.map((notification) => (
          <button
            key={notification.id}
            type="button"
            onClick={() => onMarkRead(notification.id)}
            className={`flex w-full items-start gap-2.5 border-b border-border px-4 py-3 text-left last:border-b-0 hover:bg-surface ${
              notification.read ? "bg-white" : "bg-brand-green-light/40"
            }`}
          >
            <span
              className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                notification.read ? "bg-transparent" : "bg-brand-green"
              }`}
            />
            <div className="flex-1">
              <p className="text-sm font-semibold text-heading">{notification.title}</p>
              <p className="mt-0.5 text-xs text-heading/70">{notification.message}</p>
              <p className="mt-1 text-[11px] text-muted">{formatRelativeTime(notification.createdAt)}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
