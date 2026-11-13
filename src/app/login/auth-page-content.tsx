"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  LogIn,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  User,
  UserPlus,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { ApiError } from "@/lib/api";
import { ThemeToggle } from "@/components/layout/theme-provider";

export function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, login, register, openSellModal } = useAuth();

  const initialTab = searchParams.get("tab") === "register" ? "register" : "login";
  const [tab, setTab] = useState<"login" | "register">(initialTab);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register form state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  // Success message after action
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const redirect = searchParams.get("redirect");
      if (redirect === "sell") {
        router.push("/marketplace");
        setTimeout(() => {
          openSellModal();
        }, 300);
      } else {
        router.push("/");
      }
    }
  }, [user, router, searchParams, openSellModal]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    try {
      await login({ email: loginEmail, password: loginPassword });
      setSuccessMsg("Berhasil masuk! Mengalihkan…");
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 401 || err.code === "UNAUTHORIZED") {
          setLoginError(
            "Email atau kata sandi salah, atau akun belum terdaftar.",
          );
        } else {
          setLoginError(err.message);
        }
      } else {
        setLoginError("Terjadi kesalahan. Coba beberapa saat lagi.");
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    if (regPassword.length < 12) {
      setRegError("Kata sandi minimal 12 karakter.");
      return;
    }
    setRegLoading(true);
    try {
      await register({
        email: regEmail,
        password: regPassword,
        display_name: regName,
        phone_number: regPhone,
      });
      setSuccessMsg("Akun berhasil dibuat! Mengalihkan…");
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 409 || err.code === "CONFLICT") {
          setRegError(
            "Email atau nomor WhatsApp ini sudah terdaftar. Silakan pilih tab Masuk.",
          );
        } else {
          setRegError(err.message);
        }
      } else {
        setRegError("Registrasi gagal. Periksa format data kamu.");
      }
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-between bg-canvas text-foreground">
      {/* Top Header with Back Navigation and Theme Toggle */}
      <header className="border-b border-border bg-surface px-4 py-3 sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) {
                router.back();
              } else {
                router.push("/");
              }
            }}
            className="group inline-flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-bold text-muted transition-all duration-150 ease-out hover:bg-soft hover:text-brand active:scale-[0.96]"
            aria-label="Kembali ke halaman sebelumnya"
          >
            <ArrowLeft size={16} className="transition-transform duration-150 ease-out group-hover:-translate-x-0.5" />
            <span>Kembali</span>
          </button>

          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-extrabold tracking-[-0.05em] text-brand"
            aria-label="Kembali ke Beranda Aquaku"
          >
            <span className="size-7 overflow-hidden rounded-full">
              <Image
                src="/images/logo-mark.webp"
                alt=""
                width={28}
                height={28}
                priority
              />
            </span>
            <span>
              aquaku<span className="text-accent">.</span>
            </span>
          </Link>

          <div className="flex items-center">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Focus Form Card */}
      <main className="my-auto px-4 py-8 sm:py-12">
        <div className="mx-auto w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
          {/* Header Title */}
          <div className="mb-6 text-center">
            <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-soft text-brand">
              {tab === "login" ? <LogIn size={20} /> : <Sparkles size={20} />}
            </span>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight">
              {tab === "login" ? "Selamat Datang Kembali" : "Mulai Bersama Aquaku"}
            </h1>
            <p className="mt-1 text-xs leading-5 text-muted">
              {tab === "login"
                ? "Masuk untuk mengelola listing dan transaksi hobi aquascape kamu."
                : "Daftar akun gratis untuk jual-beli dan berdiskusi dengan sesama hobiis."}
            </p>
          </div>

          {/* Success Banner */}
          {successMsg && (
            <div className="banner-animate mb-5 flex items-center gap-2 rounded-xl border border-brand/30 bg-soft p-3 text-xs font-semibold text-brand">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Tabs Selector */}
          <div className="mb-6 flex rounded-xl bg-canvas p-1">
            <button
              type="button"
              onClick={() => {
                setTab("login");
                setLoginError(null);
              }}
              className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all duration-200 ease-out active:scale-[0.98] ${
                tab === "login"
                  ? "bg-surface text-brand shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("register");
                setRegError(null);
              }}
              className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all duration-200 ease-out active:scale-[0.98] ${
                tab === "register"
                  ? "bg-surface text-brand shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Daftar Akun
            </button>
          </div>

          {/* Tab Pane with Smooth Transition */}
          <div key={tab} className="tab-pane-animate">
            {tab === "login" ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {loginError && (
                  <div className="banner-animate flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="page-login-email"
                    className="mb-1.5 block text-xs font-semibold text-muted"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
                    />
                    <input
                      id="page-login-email"
                      type="email"
                      required
                      placeholder="nama@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="field pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="page-login-password"
                    className="mb-1.5 block text-xs font-semibold text-muted"
                  >
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <KeyRound
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
                    />
                    <input
                      id="page-login-password"
                      type="password"
                      required
                      placeholder="Masukkan kata sandi"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="field pl-10"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="button-primary mt-2 min-h-12 w-full text-sm"
                >
                  <LogIn size={17} />
                  {loginLoading ? "Memverifikasi…" : "Masuk Sekarang"}
                </button>
              </form>
            ) : (
              /* Register Form */
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                {regError && (
                  <div className="banner-animate flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <span>{regError}</span>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="page-reg-name"
                    className="mb-1 block text-xs font-semibold text-muted"
                  >
                    Nama Lengkap / Nama Toko
                  </label>
                  <div className="relative">
                    <User
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
                    />
                    <input
                      id="page-reg-name"
                      type="text"
                      required
                      placeholder="Contoh: Rimbun Aquatic"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="field pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="page-reg-phone"
                    className="mb-1 block text-xs font-semibold text-muted"
                  >
                    Nomor WhatsApp
                  </label>
                  <div className="relative">
                    <Phone
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
                    />
                    <input
                      id="page-reg-phone"
                      type="tel"
                      required
                      placeholder="Contoh: 081234567890"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="field pl-10"
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-muted">
                    Bisa diawali 08 atau 62 (otomatis diformat).
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="page-reg-email"
                    className="mb-1 block text-xs font-semibold text-muted"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
                    />
                    <input
                      id="page-reg-email"
                      type="email"
                      required
                      placeholder="nama@email.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="field pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="page-reg-password"
                    className="mb-1 block text-xs font-semibold text-muted"
                  >
                    Kata Sandi (Minimal 12 Karakter)
                  </label>
                  <div className="relative">
                    <KeyRound
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
                    />
                    <input
                      id="page-reg-password"
                      type="password"
                      required
                      minLength={12}
                      placeholder="Minimal 12 karakter"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="field pl-10"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={regLoading}
                  className="button-primary mt-2 min-h-12 w-full text-sm"
                >
                  <UserPlus size={17} />
                  {regLoading ? "Mendaftarkan…" : "Daftar Akun Baru"}
                </button>
              </form>
            )}
          </div>

          {/* Alternative Link */}
          <div className="mt-6 border-t border-border pt-4 text-center">
            <Link
              href="/marketplace"
              className="text-xs font-medium text-muted hover:text-brand hover:underline"
            >
              Hanya ingin melihat-lihat dulu? Jelajahi marketplace →
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-4 text-center text-xs text-muted sm:px-8">
        <p className="flex items-center justify-center gap-1.5">
          <ShieldCheck size={14} className="text-brand" />
          <span>Aquaku · Komunitas & Marketplace Aquascape Semarang</span>
        </p>
      </footer>
    </div>
  );
}
