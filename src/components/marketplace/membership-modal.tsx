"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock,
  Crown,
  FileCheck,
  History,
  Loader2,
  ShieldCheck,
  Sparkles,
  Store,
  Upload,
  X,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { api, ApiError } from "@/lib/api";
import type { BenefitRequest, MembershipPlan } from "@/types/api";

export function MembershipModal() {
  const { isMembershipModalOpen, closeMembershipModal, user, quota } = useAuth();

  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [requests, setRequests] = useState<BenefitRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTier, setSelectedTier] = useState<"toko" | "juragan">("toko");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isMembershipModalOpen) return;
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    Promise.all([api.getMembershipPlans(), api.getBenefitRequests()])
      .then(([p, r]) => {
        setPlans(p);
        setRequests(r);
      })
      .catch(() => {
        // Fallback demo plans
        setPlans([
          {
            tier: "toko",
            price: 40000,
            period_days: 30,
            base_quota: 30,
            listing_days: 60,
            features: { may_sell_new_condition: true, cooldown: false },
          },
          {
            tier: "juragan",
            price: 100000,
            period_days: 30,
            base_quota: 100,
            listing_days: 90,
            features: { may_sell_new_condition: true, cooldown: false },
          },
        ]);
      })
      .finally(() => setLoading(false));
  }, [isMembershipModalOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofFile) {
      setError("Pilih file bukti transfer pembayaran.");
      return;
    }
    setError(null);
    setSubmitting(true);

    const formData = new FormData();
    formData.append("tier", selectedTier);
    formData.append("proof", proofFile);

    try {
      await api.requestMembership(formData);
      setSuccessMsg(
        "Pengajuan berhasil dikirim! Benefit akan aktif setelah diverifikasi oleh admin.",
      );
      setProofFile(null);
      const updatedRequests = await api.getBenefitRequests();
      setRequests(updatedRequests);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Gagal mengirim pengajuan. Coba beberapa saat lagi.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isMembershipModalOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Katalog Membership & Kuota"
      className="modal-backdrop-animate fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeMembershipModal();
      }}
    >
      <div className="modal-panel-animate relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-2xl sm:p-7">
        <button
          onClick={closeMembershipModal}
          className="icon-button absolute right-4 top-4"
          aria-label="Tutup"
        >
          <X size={18} />
        </button>

        <div className="mb-5">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-brand">
            <Sparkles size={14} /> Tingkatkan Skala Toko
          </p>
          <h2 className="text-xl font-extrabold tracking-tight">
            Paket Membership & Kuota Tambahan
          </h2>
          <p className="mt-1 text-xs text-muted">
            Dapatkan kuota listing lebih besar, masa tayang hingga 90 hari, dan
            izin menjual kondisi Baru / BNIB.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Toko */}
          <div
            onClick={() => setSelectedTier("toko")}
            className={`cursor-pointer rounded-2xl border p-5 transition-all ${
              selectedTier === "toko"
                ? "border-brand bg-soft/60 shadow-sm"
                : "border-border bg-canvas hover:border-brand/40"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <Store size={20} />
              </span>
              <span className="text-xs font-extrabold text-brand uppercase">
                Tier Toko
              </span>
            </div>
            <h3 className="mt-3 text-lg font-bold">Rp40.000</h3>
            <p className="text-[11px] text-muted">per 30 hari masa aktif</p>
            <ul className="mt-4 space-y-2 text-xs text-muted">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-brand shrink-0" />
                <span>30 Kuota Listing Aktif</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-brand shrink-0" />
                <span>Masa tayang 60 hari per listing</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-brand shrink-0" />
                <span>Bebas jual kondisi Baru & BNIB</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-brand shrink-0" />
                <span>Tanpa cooldown hapus listing</span>
              </li>
            </ul>
          </div>

          {/* Juragan */}
          <div
            onClick={() => setSelectedTier("juragan")}
            className={`cursor-pointer rounded-2xl border p-5 transition-all ${
              selectedTier === "juragan"
                ? "border-brand bg-soft/60 shadow-sm"
                : "border-border bg-canvas hover:border-brand/40"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <Crown size={20} />
              </span>
              <span className="text-xs font-extrabold text-brand uppercase">
                Tier Juragan
              </span>
            </div>
            <h3 className="mt-3 text-lg font-bold">Rp100.000</h3>
            <p className="text-[11px] text-muted">per 30 hari masa aktif</p>
            <ul className="mt-4 space-y-2 text-xs text-muted">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-brand shrink-0" />
                <span>100 Kuota Listing Aktif</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-brand shrink-0" />
                <span>Masa tayang 90 hari per listing</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-brand shrink-0" />
                <span>Prioritas pencarian & label Juragan</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-brand shrink-0" />
                <span>Bebas jual kondisi Baru & BNIB</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Transfer instructions */}
        <div className="mt-5 rounded-xl border border-border bg-canvas p-4 text-xs">
          <p className="font-bold text-foreground">Metode Pembayaran Manual Transfer:</p>
          <div className="mt-2 space-y-1 text-muted font-mono">
            <p>Bank BCA: <strong>123-456-7890</strong> a/n Aquaku Marketplace</p>
            <p>
              Nominal Transfer:{" "}
              <strong>{selectedTier === "toko" ? "Rp40.000" : "Rp100.000"}</strong>
            </p>
          </div>
          <p className="mt-2 text-[11px] text-muted leading-4">
            * Unggah bukti transfer di bawah. Pengajuan akan diproses oleh admin
            maksimal 1x24 jam kerja.
          </p>
        </div>

        {/* Form Upload */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {successMsg && (
            <div className="flex items-center gap-2 rounded-xl border border-brand/30 bg-soft p-3 text-xs text-brand font-semibold">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div>
            <label
              htmlFor="proof-upload"
              className="mb-1 block text-xs font-semibold text-muted"
            >
              Unggah Bukti Transfer (JPG, PNG, atau PDF)
            </label>
            <input
              id="proof-upload"
              type="file"
              accept="image/jpeg,image/png,application/pdf"
              required
              onChange={(e) => setProofFile(e.target.files?.[0] || null)}
              className="field py-2 text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-soft file:px-3 file:py-1 file:text-xs file:font-semibold file:text-brand"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !proofFile}
            className="button-primary w-full"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Mengirim Pengajuan…
              </>
            ) : (
              <>
                <Upload size={16} />
                Kirim Pengajuan Membership
              </>
            )}
          </button>
        </form>

        {/* Riwayat Pengajuan */}
        {requests.length > 0 && (
          <div className="mt-6 border-t border-border pt-5">
            <h4 className="flex items-center gap-2 text-xs font-bold text-foreground">
              <History size={14} className="text-brand" /> Riwayat Pengajuan Anda
            </h4>
            <div className="mt-3 space-y-2">
              {requests.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-canvas px-3.5 py-2.5 text-xs"
                >
                  <div>
                    <span className="font-bold uppercase text-foreground">
                      {r.kind} - {r.requested_tier || `${r.requested_slots} slot`}
                    </span>
                    <p className="text-[10px] text-muted">
                      {new Date(r.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                      r.status === "approved"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : r.status === "rejected"
                          ? "bg-red-500/10 text-red-600 dark:text-red-400"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
