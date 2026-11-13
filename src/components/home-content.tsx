import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Leaf,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sprout,
} from "lucide-react";
import { ProductCard } from "@/components/marketplace/product-card";
import { CategoryStrip } from "@/components/marketplace/category-strip";
import { DiscussionCard } from "@/components/forum/discussion-card";
import { forumPosts } from "@/lib/forum-data";
import { products } from "@/lib/marketplace-data";
import { LocalTrustStrip } from "@/components/layout/app-shell";

export type HomeDirection =
  | "pasar"
  | "katalog"
  | "jurnal"
  | "tetangga"
  | "komunitas";

function Welcome({ compact = false }: { compact?: boolean }) {
  if (compact)
    return (
      <section className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-brand">
            <MapPin size={13} aria-hidden="true" />
            Pasar aquascape Semarang
          </p>
          <h1 className="page-title">
            Temukan bagian kecil untuk tank besarmu.
          </h1>
          <p className="page-description">
            Tanaman, penghuni, dan perlengkapan dari sekitar kamu.
          </p>
        </div>
        <Link href="/forum" className="section-link">
          Mampir ke komunitas
          <MessageCircle size={16} aria-hidden="true" />
        </Link>
      </section>
    );
  return (
    <section className="grid overflow-hidden rounded-2xl bg-hero sm:grid-cols-[1.05fr_1fr]">
      <div className="flex flex-col justify-center px-6 py-7 sm:px-8 sm:py-9 lg:px-9">
        <p className="mb-4 flex items-center gap-1.5 text-[11px] font-semibold text-brand">
          <span className="size-1.5 rounded-full bg-brand" />
          Untuk hobiis, dari sesama hobiis
        </p>
        <h1 className="max-w-[380px] text-[30px] font-extrabold leading-[1.16] tracking-[-0.055em] sm:text-[34px] xl:text-[40px]">
          Hutan kecilmu,
          <br />
          mulai dari sini.
        </h1>
        <p className="mt-4 max-w-[300px] text-sm leading-6 text-muted">
          Temukan tanaman, perlengkapan, dan teman berbagi cerita. Semuanya
          dekat, di Semarang.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href="/marketplace"
            className="button-primary px-4 text-xs sm:text-sm"
          >
            Jelajahi marketplace
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link
            href="/forum"
            className="hidden min-h-11 items-center gap-1.5 rounded-lg px-1 text-xs font-bold text-brand sm:inline-flex"
          >
            Kenalan dulu
            <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>
      <div className="hero-photo min-h-52 sm:min-h-80">
        <Image
          src="/images/planted-tank.jpg"
          alt="Aquascape hijau dalam nano tank dengan kayu dan tanaman rimbun"
          fill
          sizes="(max-width: 639px) 94vw, (max-width: 1023px) 46vw, 550px"
          className="object-cover"
          priority
        />
        <div className="absolute bottom-4 left-4 z-10 rounded-xl border border-white/20 bg-black/45 px-3 py-2 text-white backdrop-blur-sm">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold">
            <Sprout size={13} aria-hidden="true" />
            Sedikit alam, banyak ketenangan.
          </p>
          <p className="mt-0.5 text-[9px] text-white/80">
            Inspirasi tank · Foto Huy Phan
          </p>
        </div>
      </div>
    </section>
  );
}

function ProductSection({
  title = "Temuan di sekitar kamu",
  count = 8,
  horizontal = false,
}: {
  title?: string;
  count?: number;
  horizontal?: boolean;
}) {
  return (
    <section aria-label={title} className="min-w-0">
      <div className="mb-4 flex items-start justify-between gap-3 sm:items-center">
        <div>
          <h2 className="section-heading">{title}</h2>
          <p className="mt-1 text-xs leading-5 text-muted">
            Dari trimmingan tetangga sampai perlengkapan toko lokal.
          </p>
        </div>
        <Link href="/marketplace" className="section-link shrink-0">
          Lihat semua
          <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
      </div>
      <div
        className={
          horizontal
            ? "hide-scrollbar grid auto-cols-[165px] grid-flow-col gap-3 overflow-x-auto pb-2 sm:auto-cols-[220px]"
            : "product-grid"
        }
      >
        {products.slice(0, count).map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </section>
  );
}

function CommunitySection({ split = false }: { split?: boolean }) {
  return (
    <section className="mt-9 border-t border-border pt-7">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="section-heading">Lagi ramai di komunitas</h2>
          <p className="mt-1 text-xs text-muted">
            Ada cerita di balik setiap tank.
          </p>
        </div>
        <Link href="/forum" className="section-link shrink-0">
          Ke forum
          <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
      </div>
      <div
        className={`grid gap-4 ${split ? "" : "xl:grid-cols-[minmax(0,1.5fr)_minmax(240px,1fr)]"}`}
      >
        <div className="grid gap-3">
          {forumPosts.slice(0, split ? 3 : 2).map((post) => (
            <DiscussionCard post={post} key={post.slug} compact />
          ))}
        </div>
        {!split ? (
          <div className="flex flex-col justify-between rounded-2xl bg-soft p-6">
            <div>
              <span className="mb-5 flex size-11 items-center justify-center rounded-xl bg-surface text-brand">
                <MessageCircle size={23} strokeWidth={1.6} aria-hidden="true" />
              </span>
              <h3 className="max-w-60 text-xl font-extrabold leading-snug tracking-tight">
                Tanaman bisa tumbuh.
                <br />
                Begitu juga pengetahuanmu.
              </h3>
              <p className="mt-3 text-xs leading-6 text-muted">
                Mau tanya alga, pamer layout, atau sekadar cari teman satu hobi?
                Ada tempatnya di sini.
              </p>
            </div>
            <Link href="/forum" className="section-link mt-4 self-start">
              Gabung obrolannya
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function LocalSellers() {
  return (
    <section className="my-6 grid gap-4 rounded-2xl border border-border bg-surface p-5 sm:grid-cols-[1fr_1.5fr] sm:p-6">
      <div>
        <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-brand">
          <MapPin size={14} aria-hidden="true" />
          Kenalan dengan tetangga
        </p>
        <h2 className="section-heading">Toko kecil, hobi yang sama.</h2>
        <p className="mt-2 text-xs leading-6 text-muted">
          Cari barangnya, kenali penjualnya, lalu sepakati titik temu. Profil
          berikut adalah contoh.
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {[
          { name: "Rimbun Aquatic", district: "Banyumanik", initials: "RA" },
          { name: "Taman Air Studio", district: "Candisari", initials: "TA" },
        ].map((seller) => (
          <Link
            href={`/marketplace?q=${encodeURIComponent(seller.name)}`}
            key={seller.name}
            className="flex items-center gap-3 rounded-xl bg-canvas p-4 hover:bg-soft"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-soft text-xs font-extrabold text-brand">
              {seller.initials}
            </span>
            <span>
              <span className="flex items-center gap-1 text-xs font-bold">
                {seller.name}
                <BadgeCheck
                  size={13}
                  className="text-brand"
                  aria-hidden="true"
                />
              </span>
              <span className="mt-1 block text-[10px] text-muted">
                {seller.district} · Profil contoh
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function TankStory() {
  const post =
    forumPosts.find((entry) => entry.category === "Pamer tank") ??
    forumPosts[0];
  return (
    <section className="mb-7 grid gap-0 overflow-hidden rounded-2xl bg-surface sm:grid-cols-[1.4fr_1fr]">
      <div className="relative min-h-64 sm:min-h-[360px]">
        <Image
          src="/images/aquascape-story.jpg"
          alt="Tanaman dan kayu membentuk pemandangan alami dalam aquascape"
          fill
          sizes="(max-width: 639px) 94vw, 55vw"
          className="object-cover"
          priority
        />
        <span className="absolute bottom-4 left-4 rounded-full bg-black/50 px-3 py-1.5 text-[10px] text-white">
          Inspirasi komunitas · Foto ilustrasi
        </span>
      </div>
      <div className="flex flex-col justify-center p-6 sm:p-8">
        <p className="text-xs font-bold text-brand">Jurnal tank</p>
        <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-[-0.045em]">
          Satu tank.
          <br />
          Banyak cerita yang tumbuh.
        </h1>
        <p className="mt-4 text-sm leading-7 text-muted">
          Mulai dari layout sederhana, temukan inspirasi dan perlengkapan untuk
          sudut hijau di rumahmu.
        </p>
        <Link
          href={`/forum/${post.slug}`}
          className="button-primary mt-5 self-start"
        >
          Baca cerita tank
          <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

export function HomeContent({
  direction = "pasar",
}: {
  direction?: HomeDirection;
}) {
  return (
    <div className="mx-auto max-w-[1200px]">
      {direction === "jurnal" ? (
        <TankStory />
      ) : (
        <Welcome
          compact={direction === "katalog" || direction === "komunitas"}
        />
      )}
      {direction === "tetangga" ? <LocalSellers /> : null}
      <CategoryStrip compact={direction === "katalog"} />
      {direction === "komunitas" ? (
        <div className="grid items-start gap-7 xl:grid-cols-[1.25fr_1fr]">
          <ProductSection title="Pilihan dari sekitar" count={4} />
          <div className="xl:-mt-9">
            <CommunitySection split />
          </div>
        </div>
      ) : (
        <>
          <ProductSection
            title={
              direction === "jurnal"
                ? "Lengkapi cerita tank kamu"
                : "Temuan di sekitar kamu"
            }
            horizontal={direction === "tetangga"}
          />
          <div className="mt-5">
            <LocalTrustStrip />
          </div>
          <CommunitySection />
        </>
      )}
      <div className="mt-7 flex flex-col justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-4 sm:flex-row sm:items-center sm:px-5">
        <p className="flex items-center gap-2 text-xs font-semibold">
          <ShieldCheck size={17} className="text-brand" aria-hidden="true" />
          Hobi boleh serius. Transaksi tetap hati-hati.
        </p>
        <p className="max-w-xl text-[11px] leading-5 text-muted">
          Cek kondisi, kenali penjual, dan pilih titik COD yang aman. Semua
          listing di demo ini adalah contoh.
        </p>
      </div>
      <p className="mt-5 flex items-center justify-center gap-1.5 text-[10px] text-muted">
        <Leaf size={11} aria-hidden="true" />
        Satu komunitas, banyak cara untuk tumbuh.
      </p>
    </div>
  );
}
