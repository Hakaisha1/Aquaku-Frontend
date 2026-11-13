import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, MapPin } from "lucide-react";
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
        <p className="mt-1.5 flex items-center gap-1 truncate text-[11px] font-medium text-muted">
          {product.verified ? (
            <BadgeCheck
              size={13}
              className="text-brand"
              aria-label="Badge toko pada data contoh"
            />
          ) : null}
          <span className="truncate">{product.seller}</span>
        </p>
      </div>
    </article>
  );
}
