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

  const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  const executeMarkSold = async (buyerId?: string) => {
    if (!user) return;
    if (!user.phone_verified) {
      openPhoneVerifyModal();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.markSold(listingId, buyerId);
      setActionMsg("Listing berhasil ditandai Terjual (Sold).");
      setSoldModalOpen(false);
      await refreshQuota();
      window.location.reload();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.message.includes("validation")) {
          setError(
            "Validasi gagal: Pastikan format ID Pembeli adalah UUID yang valid (36 karakter), atau kosongkan kolom jika pembeli tidak terhubung."
          );
        } else {
          setError(err.message);
        }
      } else {
        setError("Gagal menandai listing terjual.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMarkSold = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = buyerIdInput.trim();
    if (trimmed && !UUID_REGEX.test(trimmed)) {
      setError(
        `"${trimmed}" bukan format User ID yang valid. ID Pembeli harus berupa kode UUID 36 karakter (misal: fbe7f4e4-f10a-49b2-9582-656ced97354a). Pembeli dapat menyalin ID ini dari menu Profil akun mereka.`
      );
      return;
    }
    await executeMarkSold(trimmed || undefined);
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
        targetType="LISTING"
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
                <div className="space-y-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
                  <p className="leading-relaxed">{error}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setBuyerIdInput("");
                      setError(null);
                      executeMarkSold(undefined);
                    }}
                    disabled={loading}
                    className="button-primary min-h-8 w-full py-1 text-xs"
                  >
                    Tandai Terjual Tanpa ID Pembeli
                  </button>
                </div>
              )}
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label
                    htmlFor="buyer-id"
                    className="text-xs font-semibold text-muted"
                  >
                    ID Akun Pembeli (Opsional)
                  </label>
                  <span className="text-[10px] text-muted">Format UUID</span>
                </div>
                <input
                  id="buyer-id"
                  type="text"
                  placeholder="Kosongkan jika transaksi langsung via WhatsApp / COD"
                  value={buyerIdInput}
                  onChange={(e) => {
                    setBuyerIdInput(e.target.value);
                    if (error) setError(null);
                  }}
                  className="field text-xs font-mono"
                />
                <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
                  💡 Pembeli dapat melihat dan menyalin User ID mereka di <strong>Menu Profil</strong> akun pembeli. Kosongkan kolom jika transaksi disepakati di luar aplikasi.
                </p>
              </div>

              <div className="flex gap-2 pt-1">
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
                  onClick={() => {
                    setSoldModalOpen(false);
                    setError(null);
                  }}
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
