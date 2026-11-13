"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  Loader2,
  Receipt,
  Star,
  User,
  X,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { api, ApiError } from "@/lib/api";
import type { SaleTransaction } from "@/types/api";

export function TransactionsModal() {
  const { isTransactionsModalOpen, closeTransactionsModal, user } = useAuth();

  const [tab, setTab] = useState<"purchases" | "sales">("purchases");
  const [purchases, setPurchases] = useState<SaleTransaction[]>([]);
  const [sales, setSales] = useState<SaleTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Rating modal state for a specific sale
  const [ratingSaleId, setRatingSaleId] = useState<string | null>(null);
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, s] = await Promise.all([
        api.getMyPurchases(),
        api.getMySales(),
      ]);
      setPurchases(p);
      setSales(s);
    } catch {
      // offline/demo fallback
      setPurchases([]);
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isTransactionsModalOpen) {
      loadData();
    }
  }, [isTransactionsModalOpen]);

  const handleRespond = async (saleId: string, decision: "CONFIRM" | "REJECT") => {
    setActionLoading(saleId);
    setError(null);
    try {
      await api.respondSale(saleId, decision);
      await loadData();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Gagal merespons transaksi.");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleRate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingSaleId) return;
    setRatingSubmitting(true);
    setError(null);
    try {
      await api.rateSale(ratingSaleId, ratingScore);
      setRatingSaleId(null);
      await loadData();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Gagal memberikan rating.");
      }
    } finally {
      setRatingSubmitting(false);
    }
  };

  if (!isTransactionsModalOpen) return null;

  const currentList = tab === "purchases" ? purchases : sales;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Riwayat Transaksi"
      className="modal-backdrop-animate fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeTransactionsModal();
      }}
    >
      <div className="modal-panel-animate relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-2xl sm:p-7">
        <button
          onClick={closeTransactionsModal}
          className="icon-button absolute right-4 top-4"
          aria-label="Tutup"
        >
          <X size={18} />
        </button>

        <div className="mb-4">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-brand">
            <Receipt size={14} /> Transaksi Marketplace
          </p>
          <h2 className="text-xl font-extrabold tracking-tight">
            Riwayat Transaksi & Konfirmasi
          </h2>
          <p className="mt-1 text-xs text-muted">
            Konfirmasi kesepakatan barang COD dan berikan ulasan reputasi penjual.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-5 flex border-b border-border">
          <button
            type="button"
            onClick={() => setTab("purchases")}
            className={`flex-1 pb-3 text-xs font-bold transition-colors ${
              tab === "purchases"
                ? "border-b-2 border-brand text-brand"
                : "text-muted hover:text-foreground"
            }`}
          >
            Pembelian Saya ({purchases.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("sales")}
            className={`flex-1 pb-3 text-xs font-bold transition-colors ${
              tab === "sales"
                ? "border-b-2 border-brand text-brand"
                : "text-muted hover:text-foreground"
            }`}
          >
            Penjualan Saya ({sales.length})
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-48 flex-col items-center justify-center text-xs text-muted">
            <Loader2 size={24} className="mb-2 animate-spin text-brand" />
            Memuat transaksi…
          </div>
        ) : currentList.length === 0 ? (
          <div className="empty-state py-12">
            <p className="text-sm font-bold text-foreground">
              Belum ada transaksi di bagian ini.
            </p>
            <p className="mt-1 text-xs text-muted">
              {tab === "purchases"
                ? "Bila kamu sepakat membeli barang dari penjual, penjual akan menautkan transaksi ke akunmu."
                : "Tandai listing kamu terjual dan cantumkan ID pembeli untuk memulai konfirmasi."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {currentList.map((item) => {
              const isBuyer = tab === "purchases";
              const isActioning = actionLoading === item.id;

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-border bg-canvas p-4 text-xs transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-foreground">
                        {item.listing.title}
                      </h4>
                      <p className="mt-0.5 font-mono text-[11px] font-bold text-brand">
                        Rp {item.listing.price.toLocaleString("id-ID")}
                      </p>
                      <p className="mt-1 text-[11px] text-muted">
                        {isBuyer ? (
                          <>Penjual: <strong>{item.seller.display_name}</strong></>
                        ) : (
                          <>Pembeli: <strong>{item.buyer.display_name}</strong></>
                        )}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                        item.status === "confirmed"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : item.status === "rejected"
                            ? "bg-red-500/10 text-red-600 dark:text-red-400"
                            : item.status === "cancelled"
                              ? "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {item.status === "awaiting_confirmation"
                        ? "Menunggu Konfirmasi"
                        : item.status}
                    </span>
                  </div>

                  {/* Actions for Buyer */}
                  {isBuyer && item.status === "awaiting_confirmation" && (
                    <div className="mt-3.5 flex items-center gap-2 border-t border-border pt-3">
                      <button
                        type="button"
                        disabled={isActioning}
                        onClick={() => handleRespond(item.id, "CONFIRM")}
                        className="button-primary min-h-9 flex-1 py-1 text-xs"
                      >
                        <Check size={14} /> Konfirmasi Deal
                      </button>
                      <button
                        type="button"
                        disabled={isActioning}
                        onClick={() => handleRespond(item.id, "REJECT")}
                        className="button-secondary min-h-9 flex-1 py-1 text-xs text-red-600 hover:text-red-700 dark:text-red-400"
                      >
                        <X size={14} /> Tolak
                      </button>
                    </div>
                  )}

                  {/* Rating Section for confirmed buyer */}
                  {isBuyer && item.status === "confirmed" && (
                    <div className="mt-3 flex items-center justify-between border-t border-border pt-2 text-[11px]">
                      {item.rating ? (
                        <span className="flex items-center gap-1 font-semibold text-amber-500">
                          <Star size={13} fill="currentColor" /> Rating kamu: {item.rating.score} / 5
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setRatingSaleId(item.id);
                            setRatingScore(5);
                          }}
                          className="flex items-center gap-1.5 font-bold text-brand hover:underline"
                        >
                          <Star size={13} /> Berikan Rating Penjual
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Beri Rating */}
        {ratingSaleId && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-xl">
              <h3 className="text-base font-bold text-foreground">
                Beri Rating Penjual
              </h3>
              <p className="mt-1 text-xs text-muted">
                Bantu komunitas hobiis mengetahui reputasi dan keandalan penjual ini.
              </p>

              <form onSubmit={handleRate} className="mt-4 space-y-4">
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRatingScore(s)}
                      className="p-1 text-amber-400 transition-transform hover:scale-110"
                    >
                      <Star
                        size={30}
                        fill={s <= ratingScore ? "currentColor" : "none"}
                        className={s <= ratingScore ? "text-amber-500" : "text-border"}
                      />
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={ratingSubmitting}
                    className="button-primary flex-1"
                  >
                    {ratingSubmitting ? "Mengirim…" : "Kirim Rating"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRatingSaleId(null)}
                    className="button-secondary"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
