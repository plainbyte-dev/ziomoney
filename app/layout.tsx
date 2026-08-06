import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataModeProvider } from "@/contexts/DataModeContext";
import "./global.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Zio Money ",
  description: "Admin panel for tracking money-transfer correspondence.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F5F7FA",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="h-full overflow-hidden bg-surface font-sans text-heading antialiased">
        <DataModeProvider>
          <AuthProvider>{children}</AuthProvider>
        </DataModeProvider>
      </body>
    </html>
  );
}
