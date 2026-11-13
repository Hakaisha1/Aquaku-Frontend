import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthPageContent } from "./auth-page-content";

export const metadata: Metadata = {
  title: "Masuk atau Daftar Akun — Aquaku",
  description:
    "Masuk ke akun Aquaku untuk mengelola listing, memantau transaksi COD, dan berinteraksi dengan komunitas hobiis di Semarang.",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-canvas">
          <div className="text-xs text-muted">Menyiapkan halaman masuk…</div>
        </div>
      }
    >
      <AuthPageContent />
    </Suspense>
  );
}
