"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock,
  CreditCard,
  Crown,
  ExternalLink,
  FileCheck,
  History,
  Layers,
  Loader2,
  QrCode,
  ShieldCheck,
  Sparkles,
  Store,
  Upload,
  X,
  Zap,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { api, ApiError } from "@/lib/api";
import type { AddonKind, BenefitRequest, MembershipPlan } from "@/types/api";

function PaymentMethodSection({
  paymentMethod,
  setPaymentMethod,
  amount,
  label,
}: {
  paymentMethod: "qris" | "transfer";
  setPaymentMethod: (method: "qris" | "transfer") => void;
  amount: string;
  label: string;
}) {
  return (
    <div className="mt-5 rounded-2xl border border-border bg-canvas p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
          <CreditCard size={15} className="text-brand" />
          Metode Pembayaran Resmi Aquaku
        </span>
        <span className="text-[10px] text-muted">{label}</span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setPaymentMethod("qris")}
          className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-bold transition-all ${
            paymentMethod === "qris"
              ? "border-brand bg-brand/10 text-brand shadow-xs ring-1 ring-brand"
              : "border-border bg-surface text-muted hover:border-brand/40"
          }`}
        >
          <QrCode size={15} />
          <span>QRIS (Semua Bank / E-Wallet)</span>
        </button>

        <button
          type="button"
          onClick={() => setPaymentMethod("transfer")}
          className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-bold transition-all ${
            paymentMethod === "transfer"
              ? "border-brand bg-brand/10 text-brand shadow-xs ring-1 ring-brand"
              : "border-border bg-surface text-muted hover:border-brand/40"
          }`}
        >
          <Building2 size={15} />
          <span>Transfer Bank (BCA)</span>
        </button>
      </div>

      {paymentMethod === "qris" ? (
        <div className="mt-4 flex flex-col sm:flex-row items-center gap-4 rounded-xl border border-border bg-surface p-3.5">
          <div className="flex shrink-0 flex-col items-center rounded-lg border border-border bg-white p-2 shadow-xs">
            <Image
              src="/images/qris-payment.jpg"
              alt="QRIS Pembayaran Resmi Aquaku"
              width={140}
              height={195}
              className="rounded object-contain"
            />
            <a
              href="/images/qris-payment.jpg"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-brand hover:underline"
            >
              <ExternalLink size={11} /> Buka / Simpan QRIS
            </a>
          </div>

          <div className="flex-1 space-y-2 text-xs">
            <div>
              <span className="inline-block rounded-md bg-brand/10 px-2 py-0.5 text-[10px] font-bold text-brand uppercase">
                QRIS Standar Pembayaran Nasional (GPN)
              </span>
              <h4 className="mt-1 text-sm font-bold text-foreground">
                AQUAKU OFFICIAL
              </h4>
              <p className="text-[11px] font-mono text-muted">
                NMID: ID1025455962379
              </p>
            </div>

            <div className="rounded-lg bg-soft p-2.5">
              <span className="text-[10px] text-muted">Total Pembayaran:</span>
              <p className="text-base font-extrabold text-brand font-mono">
                {amount}
              </p>
            </div>

            <ul className="space-y-1 text-[11px] leading-relaxed text-muted">
              <li>✓ Mendukung GoPay, BCA Mobile, Livin Mandiri, BRImo, BNI, Dana, OVO, & semua mobile banking.</li>
              <li>✓ Scan QRIS langsung atau simpan QRIS untuk diunggah lewat galeri m-banking.</li>
              <li>✓ Masukkan nominal transfer tepat <strong>{amount}</strong>.</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-border bg-surface p-3.5 text-xs">
          <p className="font-bold text-foreground">Rekening Tujuan Transfer Manual:</p>
          <div className="mt-2 space-y-1 font-mono text-muted">
            <p>
              Bank BCA: <strong className="text-foreground">123-456-7890</strong> a/n Aquaku Marketplace
            </p>
            <p>
              Total Transfer: <strong className="text-brand font-bold">{amount}</strong>
            </p>
          </div>
          <p className="mt-2 text-[11px] text-muted">
            Setelah transfer berhasil, unggah bukti transfer/struk di bawah.
          </p>
        </div>
      )}
    </div>
  );
}

export function MembershipModal() {
  const { isMembershipModalOpen, closeMembershipModal, user, quota } = useAuth();

  const [activeTab, setActiveTab] = useState<"membership" | "addon">("membership");
  const [paymentMethod, setPaymentMethod] = useState<"qris" | "transfer">("qris");

  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [requests, setRequests] = useState<BenefitRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Membership state
  const [selectedTier, setSelectedTier] = useState<"toko" | "juragan">("toko");
  const [proofFile, setProofFile] = useState<File | null>(null);

  // Add-on state
  const [addonKind, setAddonKind] = useState<AddonKind>("SLOT_ADDON");
  const [addonSlots, setAddonSlots] = useState<number>(5);
  const [addonProofFile, setAddonProofFile] = useState<File | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Calculated Add-on Payment Amount according to backend security audit formula:
  // - SLOT_ADDON: slots * 10000
  // - COOLDOWN_BYPASS: flat 10000
  const calculatedAddonAmount =
    addonKind === "SLOT_ADDON"
      ? Math.max(1, addonSlots) * 10000
      : 10000;

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

  const handleMembershipSubmit = async (e: React.FormEvent) => {
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
        "Pengajuan membership berhasil dikirim! Benefit akan aktif setelah diverifikasi oleh admin.",
      );
      setProofFile(null);
      const updatedRequests = await api.getBenefitRequests();
      setRequests(updatedRequests);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Gagal mengirim pengajuan membership. Coba beberapa saat lagi.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addonProofFile) {
      setError("Pilih file bukti transfer pembayaran add-on.");
      return;
    }
    setError(null);
    setSubmitting(true);

    const formData = new FormData();
    formData.append("kind", addonKind);
    formData.append("payment_amount", String(calculatedAddonAmount));
    if (addonKind === "SLOT_ADDON") {
      formData.append("slots", String(Math.max(1, addonSlots)));
    }
    formData.append("proof", addonProofFile);

    try {
      await api.requestAddon(formData);
      setSuccessMsg(
        "Pengajuan add-on berhasil dikirim! Kuota atau cooldown pass akan aktif setelah diverifikasi oleh admin.",
      );
      setAddonProofFile(null);
      const updatedRequests = await api.getBenefitRequests();
      setRequests(updatedRequests);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Gagal mengirim pengajuan add-on. Coba beberapa saat lagi.");
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
            <Sparkles size={14} /> Tingkatkan Skala Toko & Kuota
          </p>
          <h2 className="text-xl font-extrabold tracking-tight">
            Paket Membership & Add-on Kuota
          </h2>
          <p className="mt-1 text-xs text-muted">
            Tingkatkan kuota listing aktif, masa tayang, dan hapus batasan cooldown.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="mb-5 flex rounded-xl border border-border bg-canvas p-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab("membership");
              setError(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
              activeTab === "membership"
                ? "bg-surface text-brand shadow-xs"
                : "text-muted hover:text-foreground"
            }`}
          >
            Upgrade Membership (Tier)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("addon");
              setError(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
              activeTab === "addon"
                ? "bg-surface text-brand shadow-xs"
                : "text-muted hover:text-foreground"
            }`}
          >
            Beli Add-on Slot & Cooldown
          </button>
        </div>

        {/* Alert Notifications */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-brand/30 bg-soft p-3 text-xs text-brand font-semibold">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* TAB 1: MEMBERSHIP TIERS */}
        {activeTab === "membership" ? (
          <>
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

            {/* Payment Method Section */}
            <PaymentMethodSection
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              amount={selectedTier === "toko" ? "Rp 40.000" : "Rp 100.000"}
              label={`Upgrade Membership ${selectedTier === "toko" ? "Toko" : "Juragan"}`}
            />

            {/* Form Upload Membership */}
            <form onSubmit={handleMembershipSubmit} className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="proof-upload-membership"
                  className="mb-1 block text-xs font-semibold text-muted"
                >
                  Unggah Bukti Pembayaran QRIS / Transfer (JPG, PNG, atau PDF) *
                </label>
                <input
                  id="proof-upload-membership"
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
          </>
        ) : (
          /* TAB 2: ADD-ON KUOTA & COOLDOWN BYPASS */
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* SLOT ADDON */}
              <div
                onClick={() => setAddonKind("SLOT_ADDON")}
                className={`cursor-pointer rounded-2xl border p-5 transition-all ${
                  addonKind === "SLOT_ADDON"
                    ? "border-brand bg-soft/60 shadow-sm"
                    : "border-border bg-canvas hover:border-brand/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                    <Layers size={20} />
                  </span>
                  <span className="text-xs font-extrabold text-brand uppercase">
                    Slot Add-on
                  </span>
                </div>
                <h3 className="mt-3 text-lg font-bold">Rp10.000 / slot</h3>
                <p className="text-[11px] text-muted">Tambah kuota listing aktif permanen</p>
                <p className="mt-3 text-xs text-muted leading-relaxed">
                  Beli slot tambahan di luar kuota tier saat ini. Berlaku akumulatif.
                </p>
              </div>

              {/* COOLDOWN BYPASS */}
              <div
                onClick={() => setAddonKind("COOLDOWN_BYPASS")}
                className={`cursor-pointer rounded-2xl border p-5 transition-all ${
                  addonKind === "COOLDOWN_BYPASS"
                    ? "border-brand bg-soft/60 shadow-sm"
                    : "border-border bg-canvas hover:border-brand/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                    <Zap size={20} />
                  </span>
                  <span className="text-xs font-extrabold text-brand uppercase">
                    Cooldown Pass
                  </span>
                </div>
                <h3 className="mt-3 text-lg font-bold">Rp10.000 flat</h3>
                <p className="text-[11px] text-muted">1x Pass bypass cooldown</p>
                <p className="mt-3 text-xs text-muted leading-relaxed">
                  Bypass masa tunggu cooldown hapus listing untuk akun Personal tanpa jeda.
                </p>
              </div>
            </div>

            <form onSubmit={handleAddonSubmit} className="space-y-4 rounded-2xl border border-border bg-canvas p-5">
              {addonKind === "SLOT_ADDON" ? (
                <div>
                  <label htmlFor="addon-slots" className="mb-1 block text-xs font-semibold text-muted">
                    Jumlah Slot yang Ingin Ditambahkan (1–100 slot) *
                  </label>
                  <input
                    id="addon-slots"
                    type="number"
                    min={1}
                    max={100}
                    value={addonSlots}
                    onChange={(e) => setAddonSlots(parseInt(e.target.value, 10) || 1)}
                    className="field font-mono"
                    required
                  />
                  <div className="mt-2 rounded-lg bg-soft p-2.5 text-xs text-brand font-medium">
                    Kalkulasi Biaya: {addonSlots} slot × Rp 10.000 ={" "}
                    <strong>Rp {calculatedAddonAmount.toLocaleString("id-ID")}</strong>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg bg-soft p-3 text-xs text-brand font-medium">
                  Biaya Cooldown Pass: <strong>Rp 10.000</strong> (Tarif flat per pengajuan)
                </div>
              )}

              {/* Nominal Pembayaran Terkunci (Read-Only) */}
              <div>
                <label htmlFor="addon-amount-locked" className="mb-1 block text-xs font-semibold text-muted">
                  Nominal Transfer Pembayaran (Terkunci Sesuai Rumus) *
                </label>
                <div className="relative">
                  <input
                    id="addon-amount-locked"
                    type="text"
                    readOnly
                    value={`Rp ${calculatedAddonAmount.toLocaleString("id-ID")}`}
                    className="field bg-soft/50 font-mono font-bold text-foreground cursor-not-allowed"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded bg-brand/10 px-2 py-0.5 text-[10px] font-bold text-brand">
                    Auto-Calculated
                  </span>
                </div>
              </div>

              {/* Payment Method Section */}
              <PaymentMethodSection
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                amount={`Rp ${calculatedAddonAmount.toLocaleString("id-ID")}`}
                label={addonKind === "SLOT_ADDON" ? "Add-on Kuota Slot" : "Cooldown Bypass Pass"}
              />

              {/* Bukti Transfer */}
              <div>
                <label
                  htmlFor="proof-upload-addon"
                  className="mb-1 block text-xs font-semibold text-muted"
                >
                  Unggah Bukti Pembayaran QRIS / Transfer (JPG, PNG, atau PDF) *
                </label>
                <input
                  id="proof-upload-addon"
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  required
                  onChange={(e) => setAddonProofFile(e.target.files?.[0] || null)}
                  className="field py-2 text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-soft file:px-3 file:py-1 file:text-xs file:font-semibold file:text-brand"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !addonProofFile}
                className="button-primary w-full"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Mengirim Pengajuan Add-on…
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Kirim Pengajuan Add-on (Rp {calculatedAddonAmount.toLocaleString("id-ID")})
                  </>
                )}
              </button>
            </form>
          </div>
        )}

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
                      {r.kind} - {r.requested_tier || (r.requested_slots ? `${r.requested_slots} slot` : "Bypass")}
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
