import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, MapPin, ShieldCheck } from "lucide-react";
import { formatRupiah, type Product } from "@/lib/marketplace-data";
import { SaveProductButton } from "./saved-products";

export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  return (
    <article className="product-card overflow-hidden rounded-xl border border-border bg-surface">
      <div className="relative aspect-[1.12/1] bg-soft">
        <Link
          href={`/marketplace/${product.slug}`}
          tabIndex={-1}
          aria-hidden="true"
          className="absolute inset-0"
        >
          <Image
            src={product.image}
            alt=""
            fill
            sizes="(max-width: 639px) 46vw, (max-width: 1279px) 28vw, 260px"
            className="object-cover"
            style={{ objectPosition: product.imagePosition }}
            priority={priority}
          />
        </Link>
        <SaveProductButton slug={product.slug} name={product.name} />
        <span className="absolute bottom-2 left-2 rounded-md bg-surface/95 px-2 py-1 text-[10px] font-semibold text-foreground">
          {product.condition}
        </span>
      </div>
      <div className="p-3 sm:p-3.5">
        <Link
          href={`/marketplace/${product.slug}`}
          className="block rounded-md hover:text-brand"
        >
          <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 tracking-[-0.01em]">
            {product.name}
          </h3>
        </Link>
        <p className="mt-2 text-lg font-extrabold tracking-[-0.035em]">
          {formatRupiah(product.price)}
        </p>
        <p className="mt-0.5 text-[11px] text-muted">per {product.unit}</p>
        <p className="mt-3 flex items-center gap-1 truncate text-[11px] text-muted sm:text-xs">
          <MapPin size={12} aria-hidden="true" />
          {product.district}
        </p>
        <div className="mt-1.5 flex items-center gap-1.5 truncate text-[11px] font-medium text-muted">
          {product.official ? (
            <span className="inline-flex shrink-0 items-center gap-0.5 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldCheck size={11} className="text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              Official
            </span>
          ) : product.verified ? (
            <BadgeCheck
              size={13}
              className="shrink-0 text-brand"
              aria-label="Toko Terverifikasi"
            />
          ) : null}
          <span className="truncate">{product.seller}</span>
        </div>
      </div>
    </article>
  );
}
