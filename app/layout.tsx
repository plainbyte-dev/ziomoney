import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataModeProvider } from "@/contexts/DataModeContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import "./global.css";

// Applies the saved/system theme to <html> before first paint so there's no
// light->dark flash on load. Kept in sync with contexts/ThemeContext.tsx.
const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("zio-theme");var d=t?JSON.parse(t)==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;

const plusJakartaSans = Plus_Jakarta_Sans({
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F1F3F0" },
    { media: "(prefers-color-scheme: dark)", color: "#141612" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} h-full`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="h-full overflow-hidden bg-surface font-sans text-heading antialiased">
        <ThemeProvider>
          <DataModeProvider>
            <AuthProvider>{children}</AuthProvider>
          </DataModeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
