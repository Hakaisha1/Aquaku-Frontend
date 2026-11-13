"use client";

import Image from "next/image";
import Link from "next/link";
import Form from "next/form";
import { usePathname } from "next/navigation";

import type { ReactNode } from "react";
import {
  ArrowUpRight,
  BadgeCheck,
  Fish,
  Leaf,
  MapPin,
  MessageCircle,
  Package,
  Plus,
  Search,
  ShieldCheck,
  Sprout,
  TreeDeciduous,
  Waves,
  ChevronRight,
} from "lucide-react";
import { ThemeToggle } from "./theme-provider";
import { PrimaryNavigation } from "./primary-navigation";
import { HeaderAuthActions } from "./header-auth-actions";
import { AppModals } from "./app-modals";

const categoryLinks = [
  { slug: "tanaman", label: "Tanaman air", icon: Sprout },
  { slug: "fauna", label: "Ikan & udang", icon: Fish },
  { slug: "hardscape", label: "Hardscape", icon: TreeDeciduous },
  { slug: "peralatan", label: "Peralatan", icon: Waves },
  { slug: "substrat", label: "Substrat & pupuk", icon: Package },
];

function Brand() {
  return (
    <Link
      href="/"
      aria-label="Aquaku, kembali ke beranda"
      className="flex shrink-0 items-center gap-2 rounded-xl sm:gap-2.5"
    >
      <span className="logo-art size-8 overflow-hidden rounded-full sm:size-9">
        <Image
          src="/images/logo-mark.webp"
          alt=""
          width={36}
          height={36}
          priority
        />
      </span>
      <span className="text-[23px] font-extrabold tracking-[-0.06em] text-brand sm:text-[25px]">
        aquaku<span className="text-accent">.</span>
      </span>
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login";

  if (isAuthPage) {
    return (
      <>
        {children}
        <AppModals />
      </>
    );
  }

  return (
    <>
      <a
        href="#main-content"
        className="fixed left-4 top-3 z-60 -translate-y-24 rounded-xl bg-brand px-4 py-3 font-semibold text-on-brand focus:translate-y-0"
      >
        Langsung ke konten
      </a>
      <header className="site-header">
        <div className="border-b border-border bg-canvas">
          <div className="mx-auto flex max-w-[1536px] items-center justify-between gap-3 px-4 py-2 text-[10px] font-medium text-muted sm:px-7 sm:text-[11px]">
            <p className="flex items-center gap-1.5">
              <Leaf size={12} className="text-brand" aria-hidden="true" />
              <span>Rumah untuk hobi yang tumbuh.</span>
            </p>
            <span className="flex items-center gap-1.5">
              <MapPin size={12} aria-hidden="true" />
              Semarang & sekitarnya
            </span>
          </div>
        </div>
        <div className="mx-auto flex max-w-[1536px] flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 sm:px-7 lg:gap-x-8">
          <Brand />
          <Form
            action="/marketplace"
            role="search"
            className="order-3 flex w-full items-center rounded-xl border border-border bg-canvas px-3.5 lg:order-none lg:ml-8 lg:max-w-[620px] lg:flex-1"
          >
            <label htmlFor="global-search" className="sr-only">
              Cari di marketplace
            </label>
            <Search size={18} className="text-muted" aria-hidden="true" />
            <input
              id="global-search"
              type="search"
              name="q"
              placeholder="Cari tanaman, ikan, atau teman tank barumu…"
              className="min-h-11 min-w-0 flex-1 bg-transparent px-3 text-xs outline-none sm:text-sm"
            />
            <button
              type="submit"
              className="min-h-11 rounded-lg px-1 text-xs font-bold text-brand"
            >
              Cari
            </button>
          </Form>
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <span className="mx-1 hidden h-7 w-px bg-border sm:block" />
            <HeaderAuthActions />
          </div>
        </div>
      </header>

      <div className="site-frame">
        <aside
          className="desktop-sidebar"
          aria-label="Navigasi utama dan kategori"
        >
          <nav aria-label="Navigasi utama" className="space-y-1">
            <PrimaryNavigation />
          </nav>
          <div className="mx-3 my-6 border-t border-border" />
          <p className="mb-2 px-3.5 text-[11px] font-semibold text-muted">
            Jelajahi marketplace
          </p>
          <nav aria-label="Kategori produk" className="space-y-1">
            {categoryLinks.map(({ slug, label, icon: Icon }) => (
              <Link
                key={slug}
                href={`/marketplace?category=${slug}`}
                className="flex min-h-11 items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-medium text-muted hover:bg-soft hover:text-brand"
              >
                <Icon size={18} strokeWidth={1.7} aria-hidden="true" />
                {label}
              </Link>
            ))}
          </nav>
          <div className="mx-3 my-6 border-t border-border" />
          <div className="px-3.5">
            <span className="mb-3 inline-flex size-9 items-center justify-center rounded-xl bg-soft text-brand">
              <MessageCircle size={18} aria-hidden="true" />
            </span>
            <p className="text-sm font-bold">Baru mulai aquascape?</p>
            <p className="mt-2 text-xs leading-5 text-muted">
              Nggak harus tahu semuanya. Mulai dari satu pertanyaan.
            </p>
            <Link href="/forum" className="section-link mt-1">
              Mampir ke forum
              <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-8 px-3.5 text-[10px] leading-5 text-muted">
            <p>Aquaku · Tumbuh bersama komunitas.</p>
            <p>Komunitas Aquascape Semarang</p>
          </div>
        </aside>

        <div className="min-w-0">
          <main id="main-content" className="main-content" tabIndex={-1}>
            {children}
          </main>
          <footer className="border-t border-border px-4 pb-25 pt-6 text-[11px] leading-6 text-muted sm:px-7 lg:pb-6">
            <div className="flex flex-col justify-between gap-2 sm:flex-row">
              <p>© Aquaku. Dari sesama hobiis, untuk sesama hobiis.</p>
              <p className="flex items-center gap-1.5">
                <ShieldCheck size={13} aria-hidden="true" />
                Marketplace & Forum Aquascape Semarang
              </p>
            </div>
          </footer>
        </div>
      </div>

      <nav
        aria-label="Navigasi mobile"
        className="mobile-tabs fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-surface lg:hidden"
      >
        <PrimaryNavigation mobile />
      </nav>

      <AppModals />
    </>
  );
}

export function LocalTrustStrip() {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-muted sm:gap-x-8">
      <span className="flex items-center gap-1.5">
        <MapPin size={14} className="text-brand" aria-hidden="true" />
        Dekat, di Semarang
      </span>
      <span className="flex items-center gap-1.5">
        <BadgeCheck size={14} className="text-brand" aria-hidden="true" />
        Kenali penjualnya
      </span>
      <span className="flex items-center gap-1.5">
        <MessageCircle size={14} className="text-brand" aria-hidden="true" />
        Sepakati lewat chat
      </span>
    </div>
  );
}

export function Breadcrumbs({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-2 text-[11px] text-muted sm:text-xs">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-2">
            {index ? <ChevronRight size={12} aria-hidden="true" /> : null}
            {item.href ? (
              <Link href={item.href} className="rounded hover:text-brand">
                {item.label}
              </Link>
            ) : (
              <span
                aria-current="page"
                className="line-clamp-1 max-w-60 text-foreground"
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
