import type { Metadata } from "next";
import { Suspense } from "react";
import { MarketplaceBrowser } from "@/components/marketplace/marketplace-browser";

export const metadata: Metadata = {
  title: "Marketplace aquascape Semarang",
  description:
    "Jelajahi listing contoh tanaman air, ikan, udang, hardscape, dan perlengkapan aquascape lokal Semarang.",
};

export default function MarketplacePage() {
  return (
    <Suspense
      fallback={
        <div className="empty-state" role="status">
          Menyiapkan temuan untuk tank kamu…
        </div>
      }
    >
      <MarketplaceBrowser />
    </Suspense>
  );
}
