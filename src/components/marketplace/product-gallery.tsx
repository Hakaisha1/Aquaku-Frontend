"use client";

import Image from "next/image";
import { useState } from "react";

export function ProductGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [selected, setSelected] = useState(0);
  return (
    <section aria-label={`Galeri ${name}`}>
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-soft">
        <Image
          src={images[selected]}
          alt={`${name}, gambar contoh ${selected + 1}`}
          fill
          priority
          sizes="(max-width: 639px) 92vw, (max-width: 1023px) 50vw, 480px"
          className="object-cover"
        />
        <span className="absolute bottom-3 right-3 rounded-lg bg-surface/95 px-2.5 py-1.5 text-[11px] font-semibold">
          {selected + 1} / {images.length}
        </span>
      </div>
      <div className="mt-3 flex gap-3" aria-label="Pilih gambar produk">
        {images.map((image, index) => (
          <button
            key={image}
            onClick={() => setSelected(index)}
            aria-label={`Lihat gambar ${index + 1}`}
            aria-pressed={selected === index}
            className={`relative size-17 overflow-hidden rounded-xl border-2 bg-soft sm:size-20 ${selected === index ? "border-brand" : "border-transparent hover:border-border"}`}
          >
            <Image
              src={image}
              alt=""
              fill
              sizes="80px"
              className="object-cover"
            />
          </button>
        ))}
      </div>
      <p className="mt-3 text-[10px] leading-5 text-muted">
        Gambar ilustrasi untuk prototipe, bukan foto kondisi barang penjual.
      </p>
    </section>
  );
}
