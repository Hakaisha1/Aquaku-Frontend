"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useDeferredValue, useEffect, useId, useState } from "react";
import {
  ArrowDownWideNarrow,
  Heart,
  MapPin,
  RotateCcw,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { categories, filterProducts, products, type Product } from "@/lib/marketplace-data";
import { api } from "@/lib/api";
import { ProductCard } from "./product-card";
import { useSavedProducts } from "./saved-products";

const conditions = Array.from(
  new Set(products.map((product) => product.condition)),
);

type MarketplaceFilters = {
  query: string;
  category: string;
  savedOnly: boolean;
  condition: string;
  delivery: string;
  sort: string;
  budget: string;
};
type FilterPatch = Partial<Omit<MarketplaceFilters, "savedOnly">>;
const queryKeys: Record<keyof FilterPatch, string> = {
  query: "q",
  category: "category",
  condition: "condition",
  delivery: "delivery",
  sort: "sort",
  budget: "max",
};

function MarketplaceResults({
  initial,
  updateFilters,
}: {
  initial: MarketplaceFilters;
  updateFilters: (patch: FilterPatch) => void;
}) {
  const id = useId();
  const { query, category, condition, delivery, sort, budget } = initial;
  const setQuery = (query: string) => updateFilters({ query });
  const setCategory = (category: string) => updateFilters({ category });
  const setCondition = (condition: string) => updateFilters({ condition });
  const setDelivery = (delivery: string) => updateFilters({ delivery });
  const setSort = (sort: string) => updateFilters({ sort });
  const setBudget = (budget: string) => updateFilters({ budget });
  const [showFilters, setShowFilters] = useState(false);
  const deferredQuery = useDeferredValue(query);
  const { saved, ready } = useSavedProducts();
  const [liveListings, setLiveListings] = useState<Product[]>([]);

  useEffect(() => {
    if (initial.savedOnly) return;
    let isCancelled = false;
    api
      .getListings({
        q: deferredQuery || undefined,
        category: category || undefined,
        sort:
          sort === "price-asc"
            ? "price_asc"
            : sort === "price-desc"
              ? "price_desc"
              : "newest",
      })
      .then((page) => {
        if (isCancelled) return;
        if (page?.items?.length > 0) {
          const mapped: Product[] = page.items.map((l) => {
            const photoUrls =
              l.photos?.length > 0
                ? l.photos.map((p) => p.url)
                : ["/images/plant-anubias.svg"];
            return {
              slug: l.id,
              name: l.title,
              category: (l.category?.slug as any) || "tanaman",
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
                  label: "Wilayah",
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
          });
          setLiveListings(mapped);
        } else {
          setLiveListings([]);
        }
      })
      .catch(() => {
        if (!isCancelled) setLiveListings([]);
      });

    return () => {
      isCancelled = true;
    };
  }, [deferredQuery, category, sort, initial.savedOnly]);

  const staticMatches = filterProducts({
    query: deferredQuery,
    category,
    condition,
    delivery,
    sort,
    saved: initial.savedOnly ? saved : undefined,
  }).filter((product) => !budget || product.price <= Number(budget));

  const matches =
    liveListings.length > 0
      ? [
          ...liveListings.filter(
            (p) => !budget || p.price <= Number(budget),
          ),
          ...staticMatches.filter(
            (s) => !liveListings.some((l) => l.slug === s.slug),
          ),
        ]
      : staticMatches;
  const activeFilters = [condition, delivery, budget].filter(Boolean).length;

  function reset() {
    updateFilters({
      query: "",
      category: "",
      condition: "",
      delivery: "",
      sort: "newest",
      budget: "",
    });
  }

  return (
    <div className="mx-auto max-w-[1200px]">
      <header className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-brand">
            {initial.savedOnly ? (
              <Heart size={14} aria-hidden="true" />
            ) : (
              <MapPin size={14} aria-hidden="true" />
            )}
            {initial.savedOnly
              ? "Koleksi di perangkat ini"
              : "Marketplace lokal Semarang"}
          </p>
          <h1 className="page-title">
            {initial.savedOnly
              ? "Disimpan dulu, dipikir pelan-pelan."
              : "Teman baru untuk tank kamu."}
          </h1>
          <p className="page-description">
            {initial.savedOnly
              ? "Barang yang kamu sukai tersimpan di browser ini. Tidak perlu buru-buru."
              : "Tanaman, ikan, dan perlengkapan dari sesama hobiis di sekitar kamu."}
          </p>
        </div>
        {initial.savedOnly ? (
          <Link className="button-secondary self-start" href="/marketplace">
            Jelajahi barang lain
          </Link>
        ) : (
          <span className="inline-flex self-start rounded-lg border border-border bg-surface px-3 py-2 text-[11px] text-muted">
            Semarang · Terhubung API Backend
          </span>
        )}
      </header>
      <div className="panel mb-5 flex items-center gap-3 px-4">
        <Search size={19} className="text-muted" aria-hidden="true" />
        <label htmlFor={`${id}-query`} className="sr-only">
          Cari barang di marketplace
        </label>
        <input
          id={`${id}-query`}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Coba ‘Anubias’, ‘filter’, atau ‘Banyumanik’…"
          className="min-h-13 w-full min-w-0 bg-transparent py-3 text-sm outline-none"
        />
        {query ? (
          <button
            className="icon-button shrink-0"
            aria-label="Hapus pencarian"
            onClick={() => setQuery("")}
          >
            <X size={17} aria-hidden="true" />
          </button>
        ) : null}
      </div>
      <div
        className="hide-scrollbar -mx-1 mb-6 flex gap-2 overflow-x-auto p-1"
        role="group"
        aria-label="Kategori barang"
      >
        {[{ slug: "", name: "Semua barang" }, ...categories].map((item) => (
          <button
            key={item.slug}
            onClick={() => setCategory(item.slug)}
            aria-pressed={category === item.slug}
            className={`min-h-11 shrink-0 rounded-full border px-4 py-2 text-xs font-semibold ${category === item.slug ? "border-brand bg-soft text-brand" : "border-border bg-surface text-muted hover:text-brand"}`}
          >
            {item.name}
          </button>
        ))}
      </div>
      <div className="grid items-start gap-5 xl:grid-cols-[190px_minmax(0,1fr)]">
        <aside
          className="panel overflow-hidden"
          aria-label="Filter marketplace"
        >
          <button
            type="button"
            className="flex min-h-12 w-full items-center justify-between gap-2 p-4 text-sm font-bold xl:hidden"
            aria-expanded={showFilters}
            aria-controls={`${id}-filters`}
            onClick={() => setShowFilters((value) => !value)}
          >
            <span className="flex items-center gap-2">
              <SlidersHorizontal size={17} aria-hidden="true" />
              Filter barang {activeFilters ? `(${activeFilters})` : ""}
            </span>
            <span className="text-xs font-medium text-brand">
              {showFilters ? "Tutup" : "Buka"}
            </span>
          </button>
          <div
            id={`${id}-filters`}
            className={`${showFilters ? "block" : "hidden"} space-y-5 p-4 xl:block`}
          >
            <div className="hidden items-center justify-between xl:flex">
              <h2 className="flex items-center gap-2 text-sm font-bold">
                <SlidersHorizontal size={15} aria-hidden="true" />
                Filter
              </h2>
              <button
                type="button"
                onClick={reset}
                className="min-h-8 rounded text-[10px] font-bold text-brand"
              >
                Reset
              </button>
            </div>
            <div>
              <label
                className="mb-2 block text-xs font-bold"
                htmlFor={`${id}-condition`}
              >
                Kondisi barang
              </label>
              <select
                id={`${id}-condition`}
                value={condition}
                onChange={(event) => setCondition(event.target.value)}
                className="field px-2 text-xs"
              >
                <option value="">Semua kondisi</option>
                {conditions.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </div>
            <div>
              <label
                className="mb-2 block text-xs font-bold"
                htmlFor={`${id}-budget`}
              >
                Harga maksimal
              </label>
              <input
                id={`${id}-budget`}
                type="number"
                min="0"
                step="1000"
                value={budget}
                onChange={(event) => setBudget(event.target.value)}
                placeholder="Rp tanpa batas"
                className="field px-2 text-xs"
              />
            </div>
            <fieldset>
              <legend className="mb-2 text-xs font-bold">Cara menerima</legend>
              {[
                { value: "", label: "Semua cara" },
                { value: "cod", label: "COD / meetup" },
                { value: "instant", label: "Kurir instan" },
              ].map((item) => (
                <label
                  key={item.value}
                  className="flex min-h-10 items-center gap-2 text-xs text-muted"
                >
                  <input
                    type="radio"
                    name={`${id}-delivery`}
                    value={item.value}
                    checked={delivery === item.value}
                    onChange={() => setDelivery(item.value)}
                    className="size-4"
                  />
                  {item.label}
                </label>
              ))}
            </fieldset>
            <div className="border-t border-border pt-4 text-[11px] leading-5 text-muted">
              <MapPin
                size={16}
                className="mb-2 text-brand"
                aria-hidden="true"
              />
              <p>
                Semua listing contoh berada di Semarang. Biaya kurir disepakati
                langsung dengan penjual.
              </p>
            </div>
            <button
              type="button"
              className="button-secondary w-full text-xs xl:hidden"
              onClick={reset}
            >
              <RotateCcw size={13} aria-hidden="true" />
              Reset filter
            </button>
          </div>
        </aside>
        <section aria-label="Hasil pencarian barang" className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p role="status" aria-live="polite" className="text-xs text-muted">
              <strong className="font-bold text-foreground">
                {initial.savedOnly && !ready ? "Memuat" : matches.length}
              </strong>{" "}
              listing {initial.savedOnly ? "tersimpan" : "contoh"}
              {category
                ? ` · ${categories.find((item) => item.slug === category)?.name ?? category}`
                : ""}
            </p>
            <div className="flex items-center gap-1.5 text-xs">
              <ArrowDownWideNarrow
                size={15}
                className="text-muted"
                aria-hidden="true"
              />
              <label htmlFor={`${id}-sort`} className="sr-only">
                Urutkan barang
              </label>
              <select
                id={`${id}-sort`}
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="min-h-11 max-w-44 rounded-lg border border-border bg-surface px-2 text-xs"
              >
                <option value="newest">Paling baru</option>
                <option value="price-asc">Harga terendah</option>
                <option value="price-desc">Harga tertinggi</option>
              </select>
            </div>
          </div>
          {matches.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 2xl:grid-cols-4">
              {matches.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-soft text-brand">
                {initial.savedOnly ? (
                  <Heart size={25} aria-hidden="true" />
                ) : (
                  <ShoppingBag size={25} aria-hidden="true" />
                )}
              </span>
              <h2 className="text-lg font-bold">
                {initial.savedOnly && !saved.length
                  ? "Belum ada barang yang disimpan."
                  : "Belum ada yang cocok."}
              </h2>
              <p className="mt-2 max-w-xs text-sm leading-6 text-muted">
                {initial.savedOnly && !saved.length
                  ? "Ketuk ikon hati pada barang yang kamu suka. Koleksinya akan muncul di sini."
                  : "Coba kata kunci yang lebih singkat atau longgarkan filter pencarianmu."}
              </p>
              {initial.savedOnly && !saved.length ? (
                <Link href="/marketplace" className="button-primary mt-5">
                  Jelajahi marketplace
                </Link>
              ) : (
                <button onClick={reset} className="button-secondary mt-5">
                  <RotateCcw size={15} aria-hidden="true" />
                  Reset pencarian
                </button>
              )}
            </div>
          )}
          <p className="mt-6 text-center text-[10px] leading-5 text-muted">
            Semua nama, harga, badge, dan listing adalah data demo. Belum
            tersedia transaksi sungguhan.
          </p>
        </section>
      </div>
    </div>
  );
}

export function MarketplaceBrowser() {
  const params = useSearchParams();
  const query = params.get("q") ?? "";
  const requestedCategory = params.get("category") ?? "";
  const category = categories.some((item) => item.slug === requestedCategory)
    ? requestedCategory
    : "";
  const savedOnly = params.get("view") === "saved";
  const requestedCondition = params.get("condition") ?? "";
  const condition = conditions.includes(requestedCondition)
    ? requestedCondition
    : "";
  const requestedDelivery = params.get("delivery") ?? "";
  const delivery = ["cod", "instant"].includes(requestedDelivery)
    ? requestedDelivery
    : "";
  const requestedSort = params.get("sort") ?? "newest";
  const sort = ["price-asc", "price-desc"].includes(requestedSort)
    ? requestedSort
    : "newest";
  const requestedBudget = params.get("max") ?? "";
  const budget =
    requestedBudget &&
    Number.isFinite(Number(requestedBudget)) &&
    Number(requestedBudget) >= 0
      ? requestedBudget
      : "";

  function updateFilters(patch: FilterPatch) {
    const next = new URLSearchParams(window.location.search);
    for (const key of Object.keys(patch) as (keyof FilterPatch)[]) {
      const value = patch[key];
      if (value && !(key === "sort" && value === "newest"))
        next.set(queryKeys[key], value);
      else next.delete(queryKeys[key]);
    }
    const search = next.toString();
    // Next's native History API integration updates useSearchParams without a reload.
    window.history.replaceState(
      null,
      "",
      "/marketplace" + (search ? "?" + search : ""),
    );
  }

  return (
    <MarketplaceResults
      key={String(savedOnly)}
      initial={{
        query,
        category,
        savedOnly,
        condition,
        delivery,
        sort,
        budget,
      }}
      updateFilters={updateFilters}
    />
  );
}
