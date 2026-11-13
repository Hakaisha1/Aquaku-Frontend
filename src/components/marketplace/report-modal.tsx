"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Flag, Loader2, X } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { api, ApiError } from "@/lib/api";
import type { ReportReason } from "@/types/api";

export function ReportModal({
  targetType,
  targetId,
  targetName,
  isOpen,
  onClose,
}: {
  targetType: "listing" | "user";
  targetId: string;
  targetName: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { user, openPhoneVerifyModal, openAuthModal } = useAuth();
  const [reason, setReason] = useState<ReportReason>("SPAM");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onClose();
      openAuthModal("login");
      return;
    }
    if (!user.phone_verified) {
      onClose();
      openPhoneVerifyModal();
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await api.createReport({
        target_type: targetType,
        target_id: targetId,
        reason,
        details: details.trim() || undefined,
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setError("Kamu sudah memiliki laporan aktif yang sedang ditinjau untuk item ini.");
        } else {
          setError(err.message);
        }
      } else {
        setError("Gagal mengirim laporan.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Laporkan Pelanggaran"
      className="modal-backdrop-animate fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-panel-animate relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl sm:p-7">
        <button
          onClick={onClose}
          className="icon-button absolute right-4 top-4"
          aria-label="Tutup"
        >
          <X size={18} />
        </button>

        <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400">
          <Flag size={22} />
        </div>

        <h2 className="text-xl font-extrabold tracking-tight">
          Laporkan {targetType === "listing" ? "Listing" : "Pengguna"}
        </h2>
        <p className="mt-1 text-xs text-muted">
          Target: <strong className="text-foreground">{targetName}</strong>
        </p>

        {success ? (
          <div className="my-6 flex flex-col items-center justify-center rounded-xl bg-soft p-5 text-center">
            <CheckCircle2 size={36} className="mb-2 text-brand" />
            <p className="text-sm font-bold text-foreground">
              Laporan Berhasil Dikirim
            </p>
            <p className="mt-1 text-xs text-muted">
              Tim moderasi akan meninjau laporan ini segera.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="report-reason"
                className="mb-1 block text-xs font-semibold text-muted"
              >
                Alasan Pelanggaran *
              </label>
              <select
                id="report-reason"
                required
                value={reason}
                onChange={(e) => setReason(e.target.value as ReportReason)}
                className="field"
              >
                <option value="SPAM">Spam / Iklan Berulang</option>
                <option value="SCAM">Indikasi Penipuan / Fake Deal</option>
                <option value="PROHIBITED_ITEM">
                  Barang Terlarang (Flora/Fauna Dilindungi)
                </option>
                <option value="MISLEADING">
                  Informasi Menyesatkan / Foto Palsu
                </option>
                <option value="HARASSMENT">Pelecehan / Kata-kata Kasar</option>
                <option value="OTHER">Lainnya</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="report-details"
                className="mb-1 block text-xs font-semibold text-muted"
              >
                Rincian Tambahan (Opsional)
              </label>
              <textarea
                id="report-details"
                rows={3}
                placeholder="Berikan bukti atau penjelasan singkat tentang pelanggaran ini…"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="field min-h-20 resize-y py-2 text-xs leading-5"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="button-primary w-full bg-red-600 hover:bg-red-700"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Mengirim Laporan…
                </>
              ) : (
                "Kirim Laporan"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
