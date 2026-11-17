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
  const safeImages = images && images.length > 0 ? images : ["/images/plant-anubias.svg"];
  const [selected, setSelected] = useState(0);
  const currentImage = safeImages[selected] || safeImages[0];

  return (
    <section aria-label={`Galeri ${name}`}>
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-soft">
        <Image
          src={currentImage}
          alt={`${name}, gambar ${selected + 1}`}
          fill
          priority
          sizes="(max-width: 639px) 92vw, (max-width: 1023px) 50vw, 480px"
          className="object-cover"
        />
        {safeImages.length > 1 && (
          <span className="absolute bottom-3 right-3 rounded-lg bg-surface/95 px-2.5 py-1.5 text-[11px] font-semibold">
            {selected + 1} / {safeImages.length}
          </span>
        )}
      </div>
      {safeImages.length > 1 && (
        <div className="mt-3 flex gap-3 overflow-x-auto pb-1" aria-label="Pilih gambar produk">
          {safeImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              onClick={() => setSelected(index)}
              aria-label={`Lihat gambar ${index + 1}`}
              aria-pressed={selected === index}
              className={`relative size-17 shrink-0 overflow-hidden rounded-xl border-2 bg-soft sm:size-20 ${selected === index ? "border-brand" : "border-transparent hover:border-border"}`}
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
      )}
      <p className="mt-3 text-[10px] leading-5 text-muted">
        Foto kondisi barang yang diunggah penjual.
      </p>
    </section>
  );
}
