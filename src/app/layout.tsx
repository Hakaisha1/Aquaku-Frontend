import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { AppShell } from "@/components/layout/app-shell";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { SavedProductsProvider } from "@/components/marketplace/saved-products";
import { ForumProvider } from "@/components/forum/forum-provider";
import { AuthProvider } from "@/context/auth-context";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Aquaku — Belanja dekat, tumbuh bersama",
    template: "%s | Aquaku",
  },
  description:
    "Rumah komunitas dan marketplace aquascape Semarang. Temukan tanaman, ikan, udang, dan perlengkapan dari sesama hobiis.",
  icons: { icon: "/images/logo-mark.webp", apple: "/images/logo-mark.webp" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${manrope.variable} antialiased`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>
            <SavedProductsProvider>
              <ForumProvider>
                <AppShell>{children}</AppShell>
              </ForumProvider>
            </SavedProductsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
