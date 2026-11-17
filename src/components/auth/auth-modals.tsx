"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Hash,
  Phone,
  ReceiptText,
  Send,
  ShieldCheck,
  Sparkles,
  User,
  UserCheck,
  X,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { ApiError } from "@/lib/api";
import { ShopManager } from "@/components/marketplace/shop-manager";

export function AuthModals() {
  const {
    openAuthModal,
    openPhoneVerifyModal,
    isPhoneModalOpen,
    devOtp,
    closePhoneVerifyModal,
    isAccountModalOpen,
    closeAccountModal,
    user,
    quota,
    verifyPhone,
    resendOtp,
    logout,
    openMembershipModal,
    openTransactionsModal,
    updateWhatsAppNumber,
    updateDisplayName,
  } = useAuth();

  // OTP form & on-demand state
  const [otpCode, setOtpCode] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpStep, setOtpStep] = useState<"idle" | "sent">("idle");
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  // WhatsApp Profile Sync state
  const [waInput, setWaInput] = useState("");
  const [savingWa, setSavingWa] = useState(false);
  const [waSavedMsg, setWaSavedMsg] = useState<string | null>(null);

  // Display Name editing & Account ID state
  const [displayNameInput, setDisplayNameInput] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameSuccessMsg, setNameSuccessMsg] = useState<string | null>(null);
  const [nameErrorMsg, setNameErrorMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    if (isAccountModalOpen && typeof window !== "undefined") {
      const stored =
        localStorage.getItem("aquaku_user_phone") ||
        user?.whatsapp_number ||
        user?.phone_number ||
        "";
      setWaInput(stored);
      setWaSavedMsg(null);
    }
    if (isAccountModalOpen && user) {
      setDisplayNameInput(user.display_name || "");
      setNameSuccessMsg(null);
      setNameErrorMsg(null);
      setCopiedId(false);
    }
  }, [isAccountModalOpen, user]);

  const handleSaveDisplayName = async () => {
    const trimmed = displayNameInput.trim();
    if (!trimmed) {
      setNameErrorMsg("Nama yang ditampilkan tidak boleh kosong.");
      return;
    }
    if (trimmed.length > 80) {
      setNameErrorMsg("Nama maksimal 80 karakter.");
      return;
    }
    setSavingName(true);
    setNameSuccessMsg(null);
    setNameErrorMsg(null);
    try {
      await updateDisplayName(trimmed);
      setNameSuccessMsg("Nama tampilan berhasil diperbarui!");
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setNameErrorMsg(err.message);
      } else {
        setNameErrorMsg("Gagal memperbarui nama tampilan.");
      }
    } finally {
      setSavingName(false);
    }
  };

  const handleCopyUserId = async () => {
    if (!user?.id) return;
    try {
      await navigator.clipboard.writeText(user.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleSaveWa = async () => {
    if (!waInput.trim()) return;
    setSavingWa(true);
    setWaSavedMsg(null);
    try {
      await updateWhatsAppNumber(waInput.trim());
      setWaSavedMsg("Nomor WhatsApp berhasil disimpan dan disinkronkan ke backend!");
    } catch {
      setWaSavedMsg("Gagal menyimpan nomor WhatsApp.");
    } finally {
      setSavingWa(false);
    }
  };

  useEffect(() => {
    if (devOtp) {
      setOtpCode(devOtp);
      setOtpStep("sent");
    }
  }, [devOtp]);

  // Reset step ketika modal ditutup jika tidak dalam masa tunggu cooldown
  useEffect(() => {
    if (!isPhoneModalOpen) {
      setOtpError(null);
      if (resendCooldown === 0 && !devOtp) {
        setOtpStep("idle");
        setOtpCode("");
      }
    }
  }, [isPhoneModalOpen, resendCooldown, devOtp]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleRequestOtp = async () => {
    if (!user) {
      setOtpError("Silakan masuk terlebih dahulu untuk verifikasi akun.");
      closePhoneVerifyModal();
      openAuthModal("login");
      return;
    }
    setOtpError(null);
    setIsSendingOtp(true);
    try {
      const code = await resendOtp();
      if (code) {
        setOtpCode(code);
      }
      setResendCooldown(60);
      setOtpStep("sent");
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setOtpError(err.message);
      } else {
        setOtpError("Gagal mengirimkan kode OTP. Silakan coba beberapa saat lagi.");
      }
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);
    if (!user) {
      setOtpError("Silakan masuk terlebih dahulu untuk memverifikasi OTP.");
      closePhoneVerifyModal();
      openAuthModal("login");
      return;
    }
    if (otpCode.length !== 6) {
      setOtpError("Masukkan 6 digit kode OTP.");
      return;
    }
    setOtpLoading(true);
    try {
      await verifyPhone(otpCode);
      setOtpCode("");
      setOtpStep("idle");
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setOtpError("Sesi verifikasi berakhir. Silakan masuk terlebih dahulu.");
          closePhoneVerifyModal();
          openAuthModal("login");
        } else {
          setOtpError(err.message);
        }
      } else {
        setOtpError("Kode OTP tidak valid atau kedaluwarsa.");
      }
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isSendingOtp) return;
    setOtpError(null);
    setIsSendingOtp(true);
    try {
      const code = await resendOtp();
      if (code) {
        setOtpCode(code);
      }
      setResendCooldown(60);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setOtpError(err.message);
      } else {
        setOtpError("Gagal mengirim ulang kode OTP.");
      }
    } finally {
      setIsSendingOtp(false);
    }
  };

  return (
    <>
      {/* 1. Modal Verifikasi Nomor HP (OTP WhatsApp On-Demand) */}
      {isPhoneModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Verifikasi Nomor WhatsApp"
          className="modal-backdrop-animate fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) closePhoneVerifyModal();
          }}
        >
          <div className="modal-panel-animate relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl sm:p-7">
            <button
              onClick={closePhoneVerifyModal}
              className="icon-button absolute right-4 top-4"
              aria-label="Tutup"
            >
              <X size={18} />
            </button>

            <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Phone size={22} />
            </div>

            <h2 className="text-xl font-extrabold tracking-tight">
              Verifikasi Nomor WhatsApp
            </h2>
            <p className="mt-1.5 text-xs leading-5 text-muted">
              {otpStep === "idle"
                ? "Verifikasi nomor WhatsApp kamu untuk mengaktifkan pasang listing marketplace, transaksi aman, dan interaksi komunitas forum."
                : "Masukkan 6 digit kode OTP yang dikirimkan ke WhatsApp kamu untuk menyelesaikan verifikasi akun."}
            </p>

            {/* Step 1: Idle (Belum dikirim, User klik untuk meminta OTP) */}
            {otpStep === "idle" ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-xl border border-border bg-soft/60 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-xl bg-surface text-brand shadow-xs">
                        <Phone size={17} />
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-muted">WhatsApp Terdaftar</p>
                        <p className="font-mono text-sm font-bold text-foreground">
                          {user?.phone_number || user?.email || "Akun Terdaftar"}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                      Belum Verifikasi
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-border/80 bg-surface/50 p-3.5 text-xs text-muted space-y-2">
                  <div className="flex items-start gap-2">
                    <ShieldCheck size={16} className="mt-0.5 shrink-0 text-brand" />
                    <span>
                      Kode OTP <strong>hanya akan dikirim setelah kamu menekan tombol verifikasi</strong> di bawah.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>
                      Nomor WhatsApp digunakan untuk konfirmasi transaksi pembeli dan penjual terpercaya.
                    </span>
                  </div>
                </div>

                {otpError && (
                  <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{otpError}</span>
                  </div>
                )}

                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    disabled={isSendingOtp}
                    className="button-primary w-full py-2.5 flex items-center justify-center gap-2 text-xs font-bold"
                  >
                    <Send size={15} />
                    {isSendingOtp ? "Mengirim Kode ke WhatsApp…" : "Kirim Kode OTP WhatsApp"}
                  </button>

                  <button
                    type="button"
                    onClick={closePhoneVerifyModal}
                    className="w-full rounded-xl py-2 text-center text-xs font-semibold text-muted hover:text-foreground transition-colors"
                  >
                    Nanti Saja
                  </button>
                </div>
              </div>
            ) : (
              /* Step 2: Form Masukkan OTP */
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 size={16} className="shrink-0" />
                  <span>
                    Kode OTP 6 digit telah dikirimkan ke WhatsApp{" "}
                    <strong>{user?.phone_number || "nomor terdaftar kamu"}</strong>.
                  </span>
                </div>

                {devOtp && (
                  <div className="flex items-center justify-between rounded-xl border border-brand/30 bg-soft p-3 text-xs text-brand">
                    <span className="font-semibold">
                      Kode Uji: <strong className="font-mono text-sm">{devOtp}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setOtpCode(devOtp)}
                      className="rounded-lg bg-brand px-2.5 py-1 text-[11px] font-bold text-on-brand hover:opacity-90"
                    >
                      Pakai kode ini
                    </button>
                  </div>
                )}

                <form onSubmit={handleOtpSubmit} className="space-y-4">
                  {otpError && (
                    <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{otpError}</span>
                    </div>
                  )}

                  <div>
                    <label htmlFor="otp-input" className="sr-only">
                      Kode OTP 6 Digit
                    </label>
                    <input
                      id="otp-input"
                      type="text"
                      maxLength={6}
                      pattern="[0-9]{6}"
                      inputMode="numeric"
                      required
                      autoFocus
                      placeholder="6 Digit OTP"
                      value={otpCode}
                      onChange={(e) =>
                        setOtpCode(e.target.value.replace(/\D/g, ""))
                      }
                      className="field text-center font-mono text-xl tracking-[0.3em]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={otpLoading || otpCode.length !== 6}
                    className="button-primary w-full"
                  >
                    <UserCheck size={16} />
                    {otpLoading ? "Memverifikasi…" : "Verifikasi Sekarang"}
                  </button>

                  <div className="flex items-center justify-between text-xs text-muted pt-1">
                    <span>Tidak menerima kode?</span>
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resendCooldown > 0 || isSendingOtp}
                      className="font-bold text-brand hover:underline disabled:opacity-50"
                    >
                      {resendCooldown > 0
                        ? `Kirim ulang (${resendCooldown}s)`
                        : isSendingOtp
                        ? "Mengirim…"
                        : "Kirim Ulang OTP"}
                    </button>
                  </div>

                  <div className="border-t border-border pt-3 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setOtpError(null);
                        setOtpStep("idle");
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-foreground transition-colors"
                    >
                      <ArrowLeft size={13} />
                      Kembali ke info nomor
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Modal Akun & Profil Lengkap */}
      {isAccountModalOpen && user && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Profil Akun"
          className="modal-backdrop-animate fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeAccountModal();
          }}
        >
          <div className="modal-panel-animate relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-2xl sm:p-7">
            <button
              onClick={closeAccountModal}
              className="icon-button absolute right-4 top-4"
              aria-label="Tutup"
            >
              <X size={18} />
            </button>

            {/* User Profile Header */}
            <div className="flex items-center gap-4 border-b border-border pb-5">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-brand text-lg font-extrabold text-on-brand shadow-sm">
                {user.display_name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-lg font-bold">
                    {user.display_name}
                  </h2>
                  {user.official_store ? (
                    <span className="inline-flex items-center gap-1 rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-300 border border-emerald-500/30">
                      <ShieldCheck size={12} className="text-emerald-600 dark:text-emerald-400" />
                      Aquaku Official
                    </span>
                  ) : user.verified_store ? (
                    <span className="inline-flex items-center gap-1 rounded bg-brand/10 px-2 py-0.5 text-[10px] font-bold text-brand border border-brand/20">
                      <BadgeCheck
                        size={13}
                        className="shrink-0 text-brand"
                        aria-label="Toko Terverifikasi"
                      />
                      Verified Store
                    </span>
                  ) : null}
                </div>
                <p className="truncate text-xs text-muted">{user.email}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <span className="tag uppercase">
                    Tier: {user.tier}
                  </span>
                  {user.phone_verified ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 size={12} /> HP Terverifikasi
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        closeAccountModal();
                        openPhoneVerifyModal();
                      }}
                      className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-500/20"
                    >
                      <AlertCircle size={12} /> Belum Verifikasi HP · Verifikasi Sekarang
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Shop Profile & Creation Manager */}
            <ShopManager
              user={user}
              openPhoneVerifyModal={() => {
                closeAccountModal();
                openPhoneVerifyModal();
              }}
            />

            {/* Ganti Nama yang Ditampilkan (Display Name) */}
            <div className="my-3 rounded-xl border border-border bg-canvas p-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <User size={14} className="text-brand" />
                  Nama yang Ditampilkan
                </span>
                <span className="text-[10px] text-muted">Maks. 80 karakter</span>
              </div>
              <p className="mt-1 text-[11px] leading-5 text-muted">
                Ubah nama tampilan akun kamu. Nama ini yang akan dilihat oleh pengguna lain di marketplace dan forum diskusi.
              </p>
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  maxLength={80}
                  placeholder="Masukkan nama tampilan kamu"
                  value={displayNameInput}
                  onChange={(e) => {
                    setDisplayNameInput(e.target.value);
                    setNameSuccessMsg(null);
                    setNameErrorMsg(null);
                  }}
                  className="field flex-1 py-1.5 text-xs"
                />
                <button
                  type="button"
                  disabled={
                    savingName ||
                    !displayNameInput.trim() ||
                    displayNameInput.trim() === user.display_name
                  }
                  onClick={handleSaveDisplayName}
                  className="button-primary min-h-9 shrink-0 px-3.5 py-1.5 text-xs"
                >
                  {savingName ? "Menyimpan…" : "Simpan Nama"}
                </button>
              </div>
              {nameSuccessMsg && (
                <p className="mt-2 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  {nameSuccessMsg}
                </p>
              )}
              {nameErrorMsg && (
                <p className="mt-2 text-[11px] font-semibold text-red-500">
                  {nameErrorMsg}
                </p>
              )}
            </div>

            {/* Info Username & ID Pengguna (UUID) */}
            <div className="my-3 rounded-xl border border-border bg-canvas p-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <Hash size={14} className="text-brand" />
                  ID Akun Pengguna (User ID)
                </span>
                <span className="text-[10px] text-muted">UUID Unik</span>
              </div>
              <p className="mt-1 text-[11px] leading-5 text-muted">
                Salin kode ID ini dan berikan ke penjual saat kamu menjadi <strong>Pembeli</strong> agar penjual dapat menautkan transaksi ke akunmu untuk konfirmasi dan ulasan rating.
              </p>
              <div className="mt-2 rounded-lg bg-surface/60 border border-border/80 px-3 py-2 text-[11px] text-muted">
                💡 <strong>Catatan:</strong> Berikan ID ini ke penjual saat membeli barang dari orang lain. Jangan masukkan ID akunmu sendiri pada listing jualanmu.
              </div>
              {!user.phone_verified && (
                <div className="mt-2 flex items-center justify-between gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-[11px] text-amber-700 dark:text-amber-400">
                  <span>Nomor HP belum diverifikasi. Akun belum memenuhi syarat sebagai <em>verified buyer</em> untuk menerima tautan transaksi.</span>
                  <button
                    type="button"
                    onClick={() => {
                      closeAccountModal();
                      openPhoneVerifyModal();
                    }}
                    className="shrink-0 font-bold underline hover:text-amber-800 dark:hover:text-amber-300"
                  >
                    Verifikasi OTP
                  </button>
                </div>
              )}
              <div className="mt-2.5 flex items-center justify-between gap-2 rounded-lg border border-border bg-surface px-3 py-2 font-mono text-xs">
                <span className="truncate select-all text-foreground">{user.id}</span>
                <button
                  type="button"
                  onClick={handleCopyUserId}
                  className="button-secondary min-h-7 shrink-0 px-2.5 py-1 text-[11px] font-sans flex items-center gap-1"
                >
                  {copiedId ? (
                    <>
                      <Check size={12} className="text-brand" />
                      <span className="text-brand font-bold">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>Salin ID</span>
                    </>
                  )}
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-border pt-2.5 text-[11px] text-muted">
                <span>Username / Email Akun:</span>
                <span className="font-semibold text-foreground">{user.email}</span>
              </div>
            </div>

            {/* Quota & Status Box */}
            {quota && (
              <div className="my-4 rounded-xl border border-border bg-soft/60 p-4">
                <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                  <span>Kuota Listing Aktif:</span>
                  <span className="font-bold text-brand">
                    {quota.active_listings} / {quota.total_quota}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-muted">
                  <span>Slot Tersedia:</span>
                  <span>{quota.available_slots} slot</span>
                </div>
                {quota.cooldown_until && (
                  <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-2.5 py-1 text-[11px] text-amber-700 dark:text-amber-300">
                    <Clock size={13} className="shrink-0" />
                    <span>
                      Cooldown sampai{" "}
                      {new Date(quota.cooldown_until).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* WhatsApp Contact Section */}
            <div className="my-3 rounded-xl border border-border bg-canvas p-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <Phone size={14} className="text-brand" />
                  Nomor WhatsApp Penjual
                </span>
                <span className="text-[10px] text-muted">Untuk chat langsung pembeli</span>
              </div>
              <p className="mt-1 text-[11px] leading-5 text-muted">
                Nomor ini digunakan agar tombol &quot;Chat Penjual&quot; pada listing kamu langsung membuka ruang obrolan WhatsApp kamu.
              </p>
              <div className="mt-3 flex gap-2">
                <input
                  type="tel"
                  placeholder="Contoh: 081234567890"
                  value={waInput}
                  onChange={(e) => setWaInput(e.target.value)}
                  className="field flex-1 py-1.5 text-xs"
                />
                <button
                  type="button"
                  disabled={savingWa || !waInput.trim()}
                  onClick={handleSaveWa}
                  className="button-primary min-h-9 shrink-0 px-3.5 py-1.5 text-xs"
                >
                  {savingWa ? "Menyimpan…" : "Simpan"}
                </button>
              </div>
              {waSavedMsg && (
                <p className="mt-2 text-[11px] font-semibold text-brand">
                  {waSavedMsg}
                </p>
              )}
            </div>

            {/* Menu Links */}
            <div className="space-y-2 py-2">
              <button
                type="button"
                onClick={() => {
                  closeAccountModal();
                  openTransactionsModal();
                }}
                className="flex min-h-11 w-full items-center justify-between rounded-xl px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-soft"
              >
                <span className="flex items-center gap-2.5">
                  <ReceiptText size={17} className="text-brand" />
                  Transaksi Penjualan & Pembelian
                </span>
                <span className="text-[11px] text-muted">Lihat</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  closeAccountModal();
                  openMembershipModal();
                }}
                className="flex min-h-11 w-full items-center justify-between rounded-xl px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-soft"
              >
                <span className="flex items-center gap-2.5">
                  <Sparkles size={17} className="text-brand" />
                  Upgrade Membership & Slot Listing
                </span>
                <span className="text-[11px] text-brand font-bold">Katalog</span>
              </button>
            </div>

            {/* Logout button */}
            <div className="mt-4 border-t border-border pt-4">
              <button
                type="button"
                onClick={logout}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 text-xs font-bold text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-400"
              >
                <LogOut size={16} />
                Keluar dari Akun
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
