"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  Clock3,
  Loader2,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sprout,
  Truck,
} from "lucide-react";
import { Breadcrumbs } from "@/components/layout/app-shell";
import { ProductGallery } from "@/components/marketplace/product-gallery";
import { ShareProduct } from "@/components/marketplace/product-actions";
import { SaveProductButton } from "@/components/marketplace/saved-products";
import { ProductCard } from "@/components/marketplace/product-card";
import { ListingActions } from "@/components/marketplace/listing-actions";
import { formatRupiah, products } from "@/lib/marketplace-data";
import { api, ApiError } from "@/lib/api";
import type { Listing, ListingSeller } from "@/types/api";

function buildSellerWhatsAppUrl(
  seller?: ListingSeller | null,
  productTitle: string = "produk",
  sellerName: string = "penjual",
): string {
  const message = `Halo ${sellerName}, saya tertarik dengan listing "${productTitle}" di Aquaku. Apakah masih tersedia? Boleh info kondisi dan lokasi COD di Semarang?`;
  const encodedText = encodeURIComponent(message);

  const raw =
    seller?.whatsapp_url ||
    seller?.whatsapp_number ||
    seller?.phone_number ||
    "";

  if (raw && raw.trim()) {
    const trimmed = raw.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      try {
        const url = new URL(trimmed);
        url.searchParams.set("text", message);
        return url.toString();
      } catch {
        // Fallback
      }
    }
    if (trimmed.startsWith("wa.me/")) {
      const base = trimmed.split("?")[0];
      return `https://${base}?text=${encodedText}`;
    }
    const cleanNumber = trimmed.replace(/[^0-9]/g, "").replace(/^0/, "62");
    if (cleanNumber.length >= 8) {
      return `https://wa.me/${cleanNumber}?text=${encodedText}`;
    }
  }

  return `https://wa.me/?text=${encodedText}`;
}

export function BackendMarketplaceListing({
  listingId,
}: {
  listingId: string;
}) {
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchListing() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getListing(listingId);
        if (mounted) {
          setListing(data);
        }
      } catch (err: unknown) {
        if (mounted) {
          if (err instanceof ApiError && err.status === 404) {
            setError("Listing tidak ditemukan atau sudah dihapus oleh penjual.");
          } else {
            setError("Gagal memuat detail listing dari server. Silakan coba lagi.");
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchListing();
    return () => {
      mounted = false;
    };
  }, [listingId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-[1200px] animate-pulse">
        <div className="mb-6 h-6 w-48 rounded bg-surface" />
        <div className="grid items-start gap-6 sm:grid-cols-2 lg:gap-8 xl:grid-cols-[1fr_1.05fr]">
          <div className="aspect-square rounded-2xl bg-surface" />
          <div className="space-y-4">
            <div className="h-6 w-24 rounded bg-surface" />
            <div className="h-10 w-3/4 rounded bg-surface" />
            <div className="h-12 w-1/2 rounded bg-surface" />
            <div className="h-28 rounded-2xl bg-surface" />
            <div className="h-12 rounded-xl bg-surface" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="mx-auto max-w-[1200px] py-12 text-center">
        <div className="empty-state my-6">
          <Sprout
            size={48}
            className="mx-auto mb-4 text-brand"
            aria-hidden="true"
          />
          <p className="mb-2 text-xs font-bold text-muted">Halaman tidak ditemukan</p>
          <h1 className="page-title text-2xl font-extrabold sm:text-3xl">
            {error || "Listing tidak tersedia"}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-muted">
            Barang yang kamu cari mungkin sudah terjual, kedaluwarsa, atau tautan salah.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/marketplace" className="button-primary">
              <ArrowLeft size={16} /> Ke Marketplace
            </Link>
            <Link href="/" className="button-secondary">
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const district =
    listing.location?.district || listing.region?.district || "Semarang";
  const kelurahan =
    listing.location?.kelurahan || listing.region?.kelurahan || "";
  const locationText = kelurahan
    ? `${kelurahan}, ${district}, Semarang`
    : `${district}, Semarang`;

  const sellerName = listing.seller?.display_name || "Penjual Aquaku";
  const sellerInitials = sellerName.slice(0, 2).toUpperCase();
  const isVerified = Boolean(listing.seller?.verified_store);
  const sellerTier =
    listing.seller?.tier === "toko" || listing.seller?.tier === "juragan"
      ? "Toko"
      : "Personal";

  const condLower = (listing.condition || "").toLowerCase();
  const conditionText =
    condLower === "new" || condLower === "bnib"
      ? "Baru"
      : condLower === "second"
      ? "Bekas / Second"
      : condLower === "like_new"
      ? "Seperti Baru"
      : listing.condition;

  const photoUrls =
    listing.photos && listing.photos.length > 0
      ? listing.photos.map((p) => p.url).filter(Boolean)
      : ["/images/plant-anubias.svg"];
  const safePhotos =
    photoUrls.length > 0 ? photoUrls : ["/images/plant-anubias.svg"];

  const postedDate = new Date(listing.created_at).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const categoryName = listing.category?.name || "Marketplace";
  const categorySlug = listing.category?.slug || "";

  const related = products.slice(0, 4);

  return (
    <div className="mx-auto max-w-[1200px]">
      <Breadcrumbs
        items={[
          { label: "Beranda", href: "/" },
          { label: "Marketplace", href: "/marketplace" },
          {
            label: categoryName,
            href: categorySlug
              ? `/marketplace?category=${categorySlug}`
              : "/marketplace",
          },
          { label: listing.title },
        ]}
      />

      <div className="grid items-start gap-6 sm:grid-cols-2 lg:gap-8 xl:grid-cols-[1fr_1.05fr]">
        <ProductGallery images={safePhotos} name={listing.title} />

        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="tag">{conditionText}</span>
            {listing.status === "sold" && (
              <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                Terjual
              </span>
            )}
            {listing.status === "expired" && (
              <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-[11px] font-bold text-red-600 dark:text-red-400">
                Kedaluwarsa
              </span>
            )}
            <span className="flex items-center gap-1 text-[10px] text-muted">
              <Clock3 size={12} aria-hidden="true" />
              {postedDate}
            </span>
          </div>

          <h1 className="text-2xl font-extrabold leading-tight tracking-[-0.04em] xl:text-[30px]">
            {listing.title}
          </h1>

          <p className="mt-5 text-[32px] font-extrabold tracking-[-0.04em] text-brand">
            {formatRupiah(listing.price)}
          </p>
          <p className="mt-1 text-xs text-muted">
            per unit · Titik temu disepakati dengan penjual
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full border border-border bg-surface px-3 py-1.5 text-[10px] font-medium text-muted">
              {conditionText}
            </span>
            <span className="rounded-full border border-border bg-surface px-3 py-1.5 text-[10px] font-medium text-muted">
              COD {district}
            </span>
            {categoryName && (
              <span className="rounded-full border border-border bg-surface px-3 py-1.5 text-[10px] font-medium text-muted">
                {categoryName}
              </span>
            )}
          </div>

          <div className="my-6 border-t border-border" />

          {/* Seller Profile Card */}
          <section aria-label="Penjual" className="panel p-4">
            <div className="flex items-center gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-soft text-sm font-extrabold text-brand">
                {sellerInitials}
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="flex items-center gap-1.5 text-sm font-bold">
                  {sellerName}
                  {isVerified && (
                    <BadgeCheck
                      size={16}
                      className="text-brand"
                      aria-label="Toko terverifikasi"
                    />
                  )}
                </h2>
                <p className="mt-1 text-[11px] text-muted">
                  {sellerTier === "Toko"
                    ? "Toko terverifikasi"
                    : "Hobiis Personal"}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
              <p className="flex items-center gap-1 text-[11px] text-muted">
                <MapPin size={13} aria-hidden="true" />
                {locationText}
              </p>
              <Link
                href={`/marketplace?q=${encodeURIComponent(sellerName)}`}
                className="flex min-h-9 items-center gap-1 rounded text-[11px] font-bold text-brand"
              >
                Lihat barang
                <ArrowUpRight size={13} aria-hidden="true" />
              </Link>
            </div>
          </section>

          {/* Delivery Section */}
          <section aria-label="Pengiriman" className="my-5 flex gap-3 text-xs">
            <Truck size={19} className="mt-0.5 text-brand" aria-hidden="true" />
            <div>
              <h2 className="font-bold">COD / Meetup Semarang</h2>
              <p className="mt-1 leading-6 text-muted">
                Titik temu dan kesepakatan transaksi dibicarakan langsung dengan penjual.
                Utamakan pertemuan langsung dan cek kondisi barang sebelum membayar.
              </p>
            </div>
          </section>

          {/* Direct WhatsApp Contact Button */}
          {(() => {
            const waUrl = buildSellerWhatsAppUrl(
              listing.seller,
              listing.title,
              sellerName,
            );
            return (
              <div>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button-primary w-full inline-flex items-center justify-center gap-2 py-3 text-sm font-bold shadow-sm"
                >
                  <MessageCircle size={18} aria-hidden="true" />
                  Chat Penjual di WhatsApp
                </a>
                <p className="mt-1.5 text-center text-[10px] text-muted">
                  Akan membuka obrolan WhatsApp ke {sellerName} dengan pesan pertanyaan terformat
                </p>
              </div>
            );
          })()}

          <div className="mt-3 flex flex-wrap gap-2">
            <SaveProductButton
              slug={listing.id}
              name={listing.title}
              detailed
            />
            <ShareProduct name={listing.title} />
          </div>

          {/* Owner & Buyer Action Controls */}
          <ListingActions
            listingId={listing.id}
            title={listing.title}
            sellerId={listing.seller?.id}
            status={listing.status}
          />
        </div>
      </div>

      {/* Description & Specs */}
      <div className="mt-8 grid items-start gap-6 xl:grid-cols-[1fr_300px]">
        <div className="panel p-5 sm:p-6">
          <h2 className="text-lg font-extrabold tracking-tight">
            Tentang barang ini
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-7 text-muted whitespace-pre-wrap">
            {listing.description ? (
              listing.description.split("\n\n").map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))
            ) : (
              <p>Tidak ada deskripsi rinci dari penjual.</p>
            )}
          </div>

          <h3 className="mb-3 mt-7 text-sm font-bold">Detail singkat</h3>
          <dl className="grid grid-cols-1 gap-0 rounded-xl bg-canvas p-4 sm:grid-cols-2 sm:gap-x-6">
            <div className="border-b border-border py-3">
              <dt className="text-[11px] text-muted">Kondisi</dt>
              <dd className="mt-1 text-xs font-semibold">{conditionText}</dd>
            </div>
            <div className="border-b border-border py-3">
              <dt className="text-[11px] text-muted">Lokasi</dt>
              <dd className="mt-1 text-xs font-semibold">{locationText}</dd>
            </div>
            <div className="border-b border-border py-3">
              <dt className="text-[11px] text-muted">Status</dt>
              <dd className="mt-1 text-xs font-semibold capitalize">
                {listing.status === "active" ? "Aktif" : listing.status}
              </dd>
            </div>
            <div className="border-b border-border py-3">
              <dt className="text-[11px] text-muted">Kategori</dt>
              <dd className="mt-1 text-xs font-semibold">{categoryName}</dd>
            </div>
            <div className="border-b border-border py-3 last:border-0 sm:border-0">
              <dt className="text-[11px] text-muted">Dipasang pada</dt>
              <dd className="mt-1 text-xs font-semibold">{postedDate}</dd>
            </div>
          </dl>
        </div>

        <aside className="rounded-2xl bg-soft p-5">
          <ShieldCheck
            size={24}
            className="mb-4 text-brand"
            aria-hidden="true"
          />
          <h2 className="text-base font-bold">
            Nyaman hobinya, aman transaksinya.
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-4 text-xs leading-6 text-muted">
            <li>Minta foto atau video kondisi terbaru sebelum bertransaksi.</li>
            <li>Jangan transfer sebelum yakin dengan reputasi penjual.</li>
            <li>Pilih lokasi COD yang ramai dan aman di Semarang.</li>
            <li>Laporkan listing bila mencurigakan atau melanggar ketentuan.</li>
          </ul>
          <Link href="/forum" className="section-link mt-4 inline-flex items-center gap-1.5">
            <MessageCircle size={14} aria-hidden="true" />
            Tanya komunitas
          </Link>
        </aside>
      </div>

      {/* Related Products */}
      <section className="mt-9">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="section-heading">Mungkin cocok juga</h2>
          <Link href="/marketplace" className="section-link">
            Lihat semua
            <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </div>
        <div className="product-grid">
          {related.map((item) => (
            <ProductCard key={item.slug} product={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
