import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowUpRight,
  BadgeCheck,
  Clock3,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { Breadcrumbs } from "@/components/layout/app-shell";
import { ProductGallery } from "@/components/marketplace/product-gallery";
import {
  ContactSeller,
  ShareProduct,
} from "@/components/marketplace/product-actions";
import { SaveProductButton } from "@/components/marketplace/saved-products";
import { ProductCard } from "@/components/marketplace/product-card";
import { ListingActions } from "@/components/marketplace/listing-actions";
import { categories, formatRupiah, products, type Product } from "@/lib/marketplace-data";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = products.find((item) => item.slug === slug);
  return {
    title: product?.name ?? "Listing tidak ditemukan",
    description: product
      ? `${product.name} dari ${product.seller}, ${product.district}, Semarang. Listing contoh Aquaku.`
      : "Listing tidak ditemukan di Aquaku.",
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let product: Product | undefined = products.find((item) => item.slug === slug);

  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      slug,
    );

  if (!product && isUuid) {
    try {
      const res = await fetch(
        `https://aquaku-backend-staging.up.railway.app/api/v1/marketplace/listings/${slug}`,
      );
      if (res.ok) {
        const json = await res.json();
        const l = json.data;
        if (l) {
          const photoUrls =
            l.photos?.length > 0
              ? l.photos.map((p: { url: string }) => p.url)
              : ["/images/plant-anubias.svg"];
          product = {
            slug: l.id,
            name: l.title,
            category: "tanaman",
            price: l.price,
            unit: "unit",
            image: photoUrls[0],
            gallery: photoUrls,
            condition: l.condition,
            seller: l.seller?.display_name || "Hobiis Semarang",
            sellerInitials: (l.seller?.display_name || "H")
              .slice(0, 2)
              .toUpperCase(),
            sellerTier: l.seller?.tier === "personal" ? "Personal" : "Toko",
            verified: !!l.seller?.verified_store,
            district: l.region?.district || "Semarang",
            delivery: "COD / meetup",
            description: l.description,
            specs: [
              { label: "Kondisi", value: l.condition },
              {
                label: "Lokasi",
                value: l.region
                  ? `${l.region.kelurahan}, ${l.region.district}`
                  : "Semarang",
              },
              { label: "Status", value: l.status },
            ],
            tags: [l.condition, "COD Semarang"],
            posted: new Date(l.created_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
            }),
          };
        }
      }
    } catch {
      // fallback
    }
  }

  if (!product) notFound();
  const category = categories.find((item) => item.slug === product.category);
  const related = products
    .filter((item) => item.slug !== product.slug)
    .sort(
      (a, b) =>
        Number(b.category === product.category) -
        Number(a.category === product.category),
    )
    .slice(0, 4);
  return (
    <div className="mx-auto max-w-[1200px]">
      <Breadcrumbs
        items={[
          { label: "Beranda", href: "/" },
          { label: "Marketplace", href: "/marketplace" },
          {
            label: category?.name ?? "Barang",
            href: `/marketplace?category=${product.category}`,
          },
          { label: product.name },
        ]}
      />
      <div className="grid items-start gap-6 sm:grid-cols-2 lg:gap-8 xl:grid-cols-[1fr_1.05fr]">
        <ProductGallery images={product.gallery} name={product.name} />
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="tag">{product.condition}</span>
            <span className="flex items-center gap-1 text-[10px] text-muted">
              <Clock3 size={12} aria-hidden="true" />
              {product.posted} · Contoh
            </span>
          </div>
          <h1 className="text-2xl font-extrabold leading-tight tracking-[-0.04em] xl:text-[30px]">
            {product.name}
          </h1>
          <p className="mt-5 text-[32px] font-extrabold tracking-[-0.04em] text-brand">
            {formatRupiah(product.price)}
          </p>
          <p className="mt-1 text-xs text-muted">
            per {product.unit} · Belum termasuk ongkir
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border bg-surface px-3 py-1.5 text-[10px] font-medium text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="my-6 border-t border-border" />
          <section aria-label="Penjual" className="panel p-4">
            <div className="flex items-center gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-soft text-sm font-extrabold text-brand">
                {product.sellerInitials}
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="flex items-center gap-1.5 text-sm font-bold">
                  {product.seller}
                  {product.verified ? (
                    <BadgeCheck
                      size={16}
                      className="text-brand"
                      aria-label="Badge verifikasi pada profil contoh"
                    />
                  ) : null}
                </h2>
                <p className="mt-1 text-[11px] text-muted">
                  {product.sellerTier === "Toko"
                    ? "Toko terverifikasi · Data contoh"
                    : "Hobiis Personal · Data contoh"}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
              <p className="flex items-center gap-1 text-[11px] text-muted">
                <MapPin size={13} aria-hidden="true" />
                {product.district}, Semarang
              </p>
              <Link
                href={`/marketplace?q=${encodeURIComponent(product.seller)}`}
                className="flex min-h-9 items-center gap-1 rounded text-[11px] font-bold text-brand"
              >
                Lihat barang
                <ArrowUpRight size={13} aria-hidden="true" />
              </Link>
            </div>
          </section>
          <section aria-label="Pengiriman" className="my-5 flex gap-3 text-xs">
            <Truck size={19} className="mt-0.5 text-brand" aria-hidden="true" />
            <div>
              <h2 className="font-bold">{product.delivery}</h2>
              <p className="mt-1 leading-6 text-muted">
                Titik temu dan biaya kurir disepakati dengan penjual. Utamakan
                perjalanan singkat untuk produk hidup.
              </p>
            </div>
          </section>
          <ContactSeller product={product} />
          <p className="mt-2 text-center text-[10px] text-muted">
            Demo · Chat WhatsApp sungguhan belum diaktifkan
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <SaveProductButton
              slug={product.slug}
              name={product.name}
              detailed
            />
            <ShareProduct name={product.name} />
          </div>
          <ListingActions listingId={product.slug} title={product.name} />
        </div>
      </div>
      <div className="mt-8 grid items-start gap-6 xl:grid-cols-[1fr_300px]">
        <div className="panel p-5 sm:p-6">
          <h2 className="text-lg font-extrabold tracking-tight">
            Tentang barang ini
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-7 text-muted">
            {product.description.split("\n\n").map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <h3 className="mb-3 mt-7 text-sm font-bold">Detail singkat</h3>
          <dl className="grid grid-cols-1 gap-0 rounded-xl bg-canvas p-4 sm:grid-cols-2 sm:gap-x-6">
            {product.specs.map((spec) => (
              <div
                key={spec.label}
                className="border-b border-border py-3 last:border-0"
              >
                <dt className="text-[11px] text-muted">{spec.label}</dt>
                <dd className="mt-1 text-xs font-semibold">{spec.value}</dd>
              </div>
            ))}
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
            <li>Minta foto atau video kondisi terbaru.</li>
            <li>Jangan kirim uang sebelum yakin dengan penjual.</li>
            <li>Pilih lokasi COD yang ramai dan aman.</li>
            <li>Aquaku belum menyediakan escrow atau jaminan transaksi.</li>
          </ul>
          <Link href="/forum" className="section-link mt-3">
            <MessageCircle size={14} aria-hidden="true" />
            Tanya komunitas
          </Link>
        </aside>
      </div>
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
