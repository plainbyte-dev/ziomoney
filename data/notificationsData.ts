export type NotificationEntry = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
};

const now = Date.now();
const minutesAgo = (n: number) => new Date(now - n * 60 * 1000).toISOString();

export const initialNotifications: NotificationEntry[] = [
  {
    id: "N-0001",
    title: "Voucher awaiting approval",
    message: "Voucher V-00004 is not approved yet.",
    createdAt: minutesAgo(5),
    read: false,
  },
  {
    id: "N-0002",
    title: "Partner blocked",
    message: "AJIMA CO. LTD was flagged and blocked.",
    createdAt: minutesAgo(60),
    read: false,
  },
  {
    id: "N-0003",
    title: "KYC pending",
    message: "Corporate customer KYC status is still Not Done.",
    createdAt: minutesAgo(180),
    read: false,
  },
  {
    id: "N-0004",
    title: "Credit limit updated",
    message: "Top-up limit for AJITA CO. LTD OKINAWA was increased.",
    createdAt: minutesAgo(60 * 26),
    read: true,
  },
];
