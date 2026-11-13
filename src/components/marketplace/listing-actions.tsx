"use client";

import { useState } from "react";
import { CheckCircle, Flag, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { api, ApiError } from "@/lib/api";
import { ReportModal } from "./report-modal";

export function ListingActions({
  listingId,
  title,
  sellerId,
  status = "active",
}: {
  listingId: string;
  title: string;
  sellerId?: string;
  status?: string;
}) {
  const { user, openAuthModal, openPhoneVerifyModal, refreshQuota } = useAuth();
  const [reportOpen, setReportOpen] = useState(false);
  const [soldModalOpen, setSoldModalOpen] = useState(false);
  const [buyerIdInput, setBuyerIdInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isOwner = user && sellerId && user.id === sellerId;

  const handleMarkSold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!user.phone_verified) {
      openPhoneVerifyModal();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.markSold(listingId, buyerIdInput.trim() || undefined);
      setActionMsg("Listing berhasil ditandai Terjual (Sold).");
      setSoldModalOpen(false);
      await refreshQuota();
      window.location.reload();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Gagal menandai listing terjual.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Yakin ingin menghapus listing ini? Menghapus listing aktif dapat memicu cooldown.")) return;
    setLoading(true);
    setError(null);
    try {
      await api.deleteListing(listingId);
      await refreshQuota();
      window.location.href = "/marketplace";
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        alert(err.message);
      } else {
        alert("Gagal menghapus listing.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRenew = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.renewListing(listingId);
      await refreshQuota();
      window.location.reload();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        alert(err.message);
      } else {
        alert("Gagal memperpanjang masa tayang.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {/* Owner Controls */}
        {isOwner && status === "active" && (
          <>
            <button
              type="button"
              onClick={() => setSoldModalOpen(true)}
              disabled={loading}
              className="button-primary min-h-9 py-1 text-xs"
            >
              <CheckCircle size={14} /> Tandai Terjual
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="button-secondary min-h-9 py-1 text-xs text-red-600 hover:text-red-700 dark:text-red-400"
            >
              <Trash2 size={14} /> Hapus
            </button>
          </>
        )}

        {isOwner && status === "expired" && (
          <button
            type="button"
            onClick={handleRenew}
            disabled={loading}
            className="button-primary min-h-9 py-1 text-xs"
          >
            <RefreshCw size={14} /> Perpanjang Masa Tayang
          </button>
        )}

        {/* Report Button (for anyone) */}
        <button
          type="button"
          onClick={() => {
            if (!user) {
              openAuthModal("login");
            } else {
              setReportOpen(true);
            }
          }}
          className="button-secondary min-h-9 py-1 text-xs text-muted hover:text-red-600 dark:hover:text-red-400"
        >
          <Flag size={13} /> Laporkan
        </button>
      </div>

      {actionMsg && (
        <p className="mt-2 text-xs font-semibold text-brand">{actionMsg}</p>
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType="listing"
        targetId={listingId}
        targetName={title}
      />

      {/* Mark Sold Modal */}
      {soldModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="modal-backdrop-animate fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSoldModalOpen(false);
          }}
        >
          <div className="modal-panel-animate w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-xl">
            <h3 className="text-base font-bold text-foreground">
              Tandai Listing Terjual
            </h3>
            <p className="mt-1 text-xs text-muted">
              Kamu bisa menandai terjual tanpa menautkan pembeli, atau memasukkan
              ID Pembeli untuk mengaktifkan konfirmasi transaksi dan rating.
            </p>

            <form onSubmit={handleMarkSold} className="mt-4 space-y-3.5">
              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}
              <div>
                <label
                  htmlFor="buyer-id"
                  className="mb-1 block text-xs font-semibold text-muted"
                >
                  ID Pengguna Pembeli (UUID, Opsional)
                </label>
                <input
                  id="buyer-id"
                  type="text"
                  placeholder="Kosongkan jika deal di luar aplikasi"
                  value={buyerIdInput}
                  onChange={(e) => setBuyerIdInput(e.target.value)}
                  className="field text-xs font-mono"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="button-primary flex-1 py-2 text-xs"
                >
                  {loading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    "Konfirmasi Terjual"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setSoldModalOpen(false)}
                  className="button-secondary py-2 text-xs"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
