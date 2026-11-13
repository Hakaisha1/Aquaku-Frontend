import Link from "next/link";
import {
  Fish,
  Layers3,
  Sprout,
  TreeDeciduous,
  Waves,
  ArrowUpRight,
} from "lucide-react";
import { categories } from "@/lib/marketplace-data";

const icons = {
  tanaman: Sprout,
  fauna: Fish,
  hardscape: TreeDeciduous,
  peralatan: Waves,
  substrat: Layers3,
};

export function CategoryStrip({ compact = false }: { compact?: boolean }) {
  return (
    <section
      aria-label="Kategori marketplace"
      className={compact ? "my-5" : "my-7"}
    >
      <div className="hide-scrollbar -mx-1 flex gap-2 overflow-x-auto p-1 sm:grid sm:grid-cols-5 sm:gap-3">
        {categories.map((category) => {
          const Icon = icons[category.slug];
          return (
            <Link
              key={category.slug}
              href={`/marketplace?category=${category.slug}`}
              className={`group flex shrink-0 items-center gap-2.5 rounded-xl border border-border bg-surface p-3 text-xs font-semibold transition-all duration-150 ease-out hover:border-brand hover:bg-soft hover:-translate-y-0.5 hover:shadow-sm active:scale-[0.98] sm:flex-col sm:items-start sm:gap-3 ${compact ? "sm:p-3" : "sm:p-4"}`}
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-soft text-brand transition-colors duration-150 group-hover:bg-brand group-hover:text-on-brand">
                <Icon size={21} strokeWidth={1.65} aria-hidden="true" />
              </span>
              <span className="flex w-full items-center justify-between gap-2">
                {category.name}
                <ArrowUpRight
                  size={12}
                  className="hidden text-muted transition-transform duration-150 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand sm:block"
                  aria-hidden="true"
                />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
