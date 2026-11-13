"use client";

import { useRef, useState } from "react";
import { Check, Copy, MessageCircle, Share2, X } from "lucide-react";
import type { Product } from "@/lib/marketplace-data";

export function ContactSeller({
  product,
}: {
  product: Pick<Product, "name" | "seller">;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [status, setStatus] = useState("");
  const message = `Halo ${product.seller}, saya tertarik dengan ${product.name} di Aquaku. Apakah masih tersedia? Boleh info kondisi dan pilihan COD di Semarang?`;
  async function copy() {
    try {
      await navigator.clipboard.writeText(message);
      setStatus("Pesan contoh berhasil disalin. Belum dikirim ke penjual.");
    } catch {
      setStatus(
        "Belum bisa menyalin otomatis. Pilih dan salin teks pesan di atas.",
      );
    }
  }
  return (
    <>
      <button
        type="button"
        className="button-primary w-full"
        onClick={() => {
          setStatus("");
          dialog.current?.showModal();
        }}
      >
        <MessageCircle size={18} aria-hidden="true" />
        Chat penjual
      </button>
      <dialog
        ref={dialog}
        aria-label="Pratinjau chat WhatsApp"
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
      >
        <div className="p-6 sm:p-8">
          <div className="mb-4 flex items-center justify-between">
            <span className="flex size-11 items-center justify-center rounded-full bg-soft text-brand">
              <MessageCircle size={22} aria-hidden="true" />
            </span>
            <button
              className="icon-button"
              aria-label="Tutup pratinjau chat"
              onClick={() => dialog.current?.close()}
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">
            Mulai dengan obrolan.
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            Ini pratinjau alur WhatsApp. Nomor penjual sungguhan belum
            dihubungkan, jadi tidak ada pesan yang dikirim.
          </p>
          <div className="mt-5 select-text rounded-xl border border-border bg-canvas p-4 text-sm leading-7">
            {message}
          </div>
          <button
            type="button"
            onClick={copy}
            className="button-primary mt-5 w-full"
          >
            {status.startsWith("Pesan") ? (
              <Check size={16} aria-hidden="true" />
            ) : (
              <Copy size={16} aria-hidden="true" />
            )}
            Salin pesan contoh
          </button>
          <p role="status" className="mt-3 text-xs leading-6 text-muted">
            {status}
          </p>
        </div>
      </dialog>
    </>
  );
}

export function ShareProduct({ name }: { name: string }) {
  const [status, setStatus] = useState("");
  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title: name, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setStatus("Tautan disalin");
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError"))
        setStatus("Salin URL dari bilah alamat");
    }
  }
  return (
    <>
      <button type="button" className="button-secondary" onClick={share}>
        <Share2 size={17} aria-hidden="true" />
        Bagikan
      </button>
      <span role="status" className="self-center text-[11px] text-muted">
        {status}
      </span>
    </>
  );
}
