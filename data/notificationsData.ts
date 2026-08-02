export type NotificationEntry = {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
};

export const initialNotifications: NotificationEntry[] = [
  {
    id: "N-0001",
    title: "Voucher awaiting approval",
    message: "Voucher V-00004 is not approved yet.",
    time: "5 min ago",
    read: false,
  },
  {
    id: "N-0002",
    title: "Partner blocked",
    message: "AJIMA CO. LTD was flagged and blocked.",
    time: "1 hour ago",
    read: false,
  },
  {
    id: "N-0003",
    title: "KYC pending",
    message: "Corporate customer KYC status is still Not Done.",
    time: "3 hours ago",
    read: false,
  },
  {
    id: "N-0004",
    title: "Credit limit updated",
    message: "Top-up limit for AJITA CO. LTD OKINAWA was increased.",
    time: "Yesterday",
    read: true,
  },
];
