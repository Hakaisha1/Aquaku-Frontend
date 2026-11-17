"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  BadgeCheck,
  CheckCircle2,
  Clock,
  Loader2,
  Plus,
  ShieldCheck,
  Store,
  X,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { Shop, UserProfile } from "@/types/api";

interface ShopManagerProps {
  user: UserProfile;
  openPhoneVerifyModal?: () => void;
  onShopChange?: (shop: Shop | null) => void;
}

export function ShopManager({
  user,
  openPhoneVerifyModal,
  onShopChange,
}: ShopManagerProps) {
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Verification request state
  const [requestingVerify, setRequestingVerify] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    api
      .getMyShop()
      .then((data) => {
        if (isMounted) {
          setShop(data);
          onShopChange?.(data);
        }
      })
      .catch(() => {
        // ignore 404 / errors
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [onShopChange]);

  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) {
      setErrorMsg("Nama toko minimal 2 karakter.");
      return;
    }

    if (!user.phone_verified) {
      setErrorMsg("Nomor HP WhatsApp wajib diverifikasi sebelum membuka toko.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const created = await api.createShop({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      setShop(created);
      onShopChange?.(created);
      setIsCreating(false);
      setSuccessMsg("Selamat! Toko kamu berhasil didaftarkan.");
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 403) {
          setErrorMsg(
            "Pembuatan toko memerlukan keanggotaan Tier Toko / Juragan atau akun Toko Resmi yang sudah disetujui.",
          );
        } else if (err.status === 409) {
          setErrorMsg("Akun ini sudah memiliki toko yang terdaftar.");
        } else {
          setErrorMsg(err.message || "Gagal membuat toko.");
        }
      } else {
        setErrorMsg("Terjadi kendala jaringan saat mendaftarkan toko.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestVerification = async () => {
    setRequestingVerify(true);
    setVerifyMsg(null);
    try {
      await api.requestShopVerification();
      setVerifyMsg("Pengajuan verifikasi toko berhasil dikirim ke admin.");
      // Refresh shop data
      const refreshed = await api.getMyShop();
      if (refreshed) {
        setShop(refreshed);
        onShopChange?.(refreshed);
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setVerifyMsg(err.message || "Gagal mengajukan verifikasi toko.");
      } else {
        setVerifyMsg("Terjadi kendala jaringan.");
      }
    } finally {
      setRequestingVerify(false);
    }
  };

  if (loading) {
    return (
      <div className="my-3 flex items-center justify-center rounded-xl border border-border bg-canvas p-6 text-xs text-muted">
        <Loader2 size={16} className="animate-spin mr-2" />
        Memeriksa profil toko...
      </div>
    );
  }

  // 1. Tampilan jika SUDAH memiliki toko
  if (shop) {
    const isOfficial = shop.is_official || Boolean(user.official_store);
    const isVerified = shop.verification_status === "verified" || isOfficial;
    const isPending = shop.verification_status === "pending";

    return (
      <div
        className={`my-3 rounded-xl border p-4 transition-all ${
          isOfficial
            ? "border-emerald-500/30 bg-emerald-500/[0.03] dark:border-emerald-500/25 dark:bg-emerald-500/[0.04]"
            : "border-border bg-canvas"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-base ${
                isOfficial
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : "bg-brand/10 text-brand"
              }`}
            >
              <Store size={20} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-bold text-foreground">{shop.name}</h3>
                {isOfficial ? (
                  <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-extrabold text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-400 border border-emerald-500/20">
                    <ShieldCheck size={12} /> Official Store
                  </span>
                ) : isVerified ? (
                  <span className="inline-flex items-center gap-1 rounded bg-brand/10 px-2 py-0.5 text-[10px] font-bold text-brand">
                    <BadgeCheck size={12} /> Toko Terverifikasi
                  </span>
                ) : isPending ? (
                  <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                    <Clock size={11} /> Menunggu Verifikasi
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded bg-muted/10 px-2 py-0.5 text-[10px] font-semibold text-muted">
                    Toko Reguler
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-muted leading-relaxed">
                {shop.description || "Belum ada deskripsi toko."}
              </p>
            </div>
          </div>
        </div>

        {/* Status Verification Action */}
        {!isVerified && !isPending && (
          <div className="mt-3.5 flex items-center justify-between border-t border-border pt-3">
            <span className="text-[11px] text-muted">
              Tingkatkan kepercayaan pembeli dengan badge verifikasi.
            </span>
            <button
              type="button"
              disabled={requestingVerify}
              onClick={handleRequestVerification}
              className="button-secondary min-h-7 px-3 py-1 text-xs font-semibold"
            >
              {requestingVerify ? "Mengajukan..." : "Ajukan Verifikasi"}
            </button>
          </div>
        )}

        {verifyMsg && (
          <p className="mt-2 text-[11px] font-semibold text-brand">
            {verifyMsg}
          </p>
        )}
      </div>
    );
  }

  // 2. Tampilan jika BELUM memiliki toko
  return (
    <div className="my-3 rounded-xl border border-border bg-canvas p-4">
      {successMsg && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {!isCreating ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-soft text-brand">
              <Store size={20} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-foreground">
                Profil Toko (Shop)
              </h3>
              <p className="mt-0.5 text-[11px] leading-5 text-muted max-w-md">
                Belum memiliki toko formal. Buka toko untuk menampilkan nama brand tokomu di semua listing produk dan mendapatkan reputasi terpercaya.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsCreating(true);
              setErrorMsg(null);
            }}
            className="button-primary min-h-9 shrink-0 px-4 py-1.5 text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <Plus size={14} />
            Buka Toko
          </button>
        </div>
      ) : (
        <form onSubmit={handleCreateShop} className="space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2.5">
            <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <Store size={15} className="text-brand" />
              Buka Toko Baru
            </span>
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setErrorMsg(null);
              }}
              className="text-muted hover:text-foreground text-xs"
              aria-label="Tutup form buka toko"
            >
              <X size={16} />
            </button>
          </div>

          {!user.phone_verified && (
            <div className="flex items-center justify-between gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-[11px] text-amber-700 dark:text-amber-400">
              <span>Nomor HP belum diverifikasi. Verifikasi diperlukan sebelum membuka toko.</span>
              {openPhoneVerifyModal && (
                <button
                  type="button"
                  onClick={openPhoneVerifyModal}
                  className="shrink-0 font-bold underline hover:text-amber-800 dark:hover:text-amber-300"
                >
                  Verifikasi Sekarang
                </button>
              )}
            </div>
          )}

          {user.tier === "personal" && !user.official_store && (
            <div className="rounded-lg bg-surface/80 border border-border/80 p-2.5 text-[11px] text-muted leading-relaxed">
              💡 <strong>Info:</strong> Pembuatan etalase toko formal ditujukan untuk anggota <strong>Tier Toko / Juragan</strong> atau akun <strong>Toko Resmi (Official Store)</strong>. Jika akun ini disiapkan untuk toko internal resmi, pastikan hak akses akun telah diatur oleh admin.
            </div>
          )}

          <div>
            <label htmlFor="shop-name-input" className="block text-[11px] font-semibold text-foreground mb-1">
              Nama Toko <span className="text-red-500">*</span>
            </label>
            <input
              id="shop-name-input"
              type="text"
              required
              minLength={2}
              maxLength={100}
              placeholder="Contoh: Ryan di Jastip atau Aquaku Official"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="field w-full py-1.5 text-xs"
            />
            <span className="mt-0.5 block text-[10px] text-muted">Minimal 2 karakter, maksimal 100 karakter.</span>
          </div>

          <div>
            <label htmlFor="shop-desc-input" className="block text-[11px] font-semibold text-foreground mb-1">
              Deskripsi Toko (Opsional)
            </label>
            <textarea
              id="shop-desc-input"
              rows={2}
              maxLength={500}
              placeholder="Contoh: Penyedia jasa titip tanaman aquascape segar, lelang fauna, dan hardscape pilihan area Semarang."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="field w-full py-1.5 text-xs resize-none"
            />
            <span className="mt-0.5 block text-[10px] text-muted">Maksimal 500 karakter.</span>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-600 dark:text-red-400">
              <AlertCircle size={15} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              disabled={submitting}
              onClick={() => {
                setIsCreating(false);
                setErrorMsg(null);
              }}
              className="button-secondary min-h-9 px-3.5 py-1.5 text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting || !name.trim() || !user.phone_verified}
              className="button-primary min-h-9 px-4 py-1.5 text-xs font-bold flex items-center gap-1.5"
            >
              {submitting ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Mendaftarkan...
                </>
              ) : (
                "Daftarkan Toko"
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
