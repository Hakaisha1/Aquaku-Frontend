import Link from "next/link";
import { Sprout } from "lucide-react";

export default function NotFound() {
  return (
    <div className="empty-state my-10">
      <Sprout size={36} className="mb-4 text-brand" aria-hidden="true" />
      <p className="mb-2 text-xs font-bold text-muted">
        Halaman tidak ditemukan
      </p>
      <h1 className="page-title">Sepertinya salah belok.</h1>
      <p className="mt-3 max-w-sm text-sm leading-7 text-muted">
        Barang atau diskusi yang kamu cari belum tersedia di Aquaku. Masih banyak
        yang bisa dijelajahi.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link className="button-primary" href="/marketplace">
          Ke marketplace
        </Link>
        <Link className="button-secondary" href="/">
          Kembali ke beranda
        </Link>
      </div>
    </div>
  );
}
