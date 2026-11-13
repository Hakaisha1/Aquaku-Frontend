"use client";

import { useState, type ReactNode } from "react";
import { Check, Palette } from "lucide-react";

const directions = [
  {
    name: "Pasar hijau",
    thesis: "Foto pembuka, katalog dominan, komunitas menyusul.",
    fit: "Paling sesuai brief; arah utama yang dipakai di beranda.",
    cost: "Foto pembuka; struktur sederhana dan mudah dirawat.",
  },
  {
    name: "Katalog langsung",
    thesis: "Pembuka ringkas, barang langsung terlihat.",
    fit: "Untuk pengunjung yang sudah tahu apa yang dicari.",
    cost: "Lebih padat; ruang storytelling lebih kecil.",
  },
  {
    name: "Jurnal tank",
    thesis: "Cerita dan foto tank mengantar ke produk.",
    fit: "Eksplorasi visual dan inspirasi layout.",
    cost: "Area foto lebih besar sebelum katalog.",
  },
  {
    name: "Pasar tetangga",
    thesis: "Konteks penjual lokal dan deretan barang horizontal.",
    fit: "Kenalan dengan toko dan rencana COD.",
    cost: "Lebih banyak gulir horizontal pada katalog.",
  },
  {
    name: "Ruang komunitas",
    thesis: "Katalog dan diskusi berdampingan di desktop.",
    fit: "Penyeimbang belanja dan obrolan, katalog tetap dulu di HP.",
    cost: "Pembagian kolom membuat kartu lebih padat.",
  },
];

export function PreviewSwitcher({ previews }: { previews: ReactNode[] }) {
  const [selected, setSelected] = useState(0);
  const direction = directions[selected];
  return (
    <>
      <section className="panel mb-7 overflow-hidden">
        <div className="border-b border-border p-5">
          <p className="mb-2 flex items-center gap-2 text-xs font-bold text-brand">
            <Palette size={16} aria-hidden="true" />
            Studio arah beranda
          </p>
          <h1 className="text-xl font-extrabold tracking-tight">
            Satu Aquaku, lima komposisi.
          </h1>
          <p className="mt-2 text-xs leading-6 text-muted">
            Pembanding desain, bukan pengaturan tampilan pengguna. Pasar hijau
            tetap menjadi beranda utama; tombol di sini hanya mengubah
            pratinjau.
          </p>
        </div>
        <div
          role="group"
          aria-label="Pilih arah desain"
          className="flex flex-wrap gap-2 p-4"
        >
          {directions.map((item, index) => (
            <button
              key={item.name}
              aria-pressed={selected === index}
              onClick={() => setSelected(index)}
              className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-xs font-semibold ${selected === index ? "bg-brand text-on-brand" : "bg-canvas text-muted hover:bg-soft"}`}
            >
              {index === 0 ? <Check size={14} aria-hidden="true" /> : null}
              {index + 1}. {item.name}
            </button>
          ))}
        </div>
        <div
          className="grid gap-3 border-t border-border bg-canvas p-4 text-xs leading-6 sm:grid-cols-3"
          role="status"
        >
          <p>
            <strong className="block text-foreground">Komposisi</strong>
            {direction.thesis}
          </p>
          <p>
            <strong className="block text-foreground">Cocok untuk</strong>
            {direction.fit}
          </p>
          <p>
            <strong className="block text-foreground">Tradeoff</strong>
            {direction.cost}
          </p>
        </div>
      </section>
      <div key={selected}>{previews[selected]}</div>
    </>
  );
}
