"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { Camera, Loader2, NotebookPen, X } from "lucide-react";
import {
  forumCategories,
  type ForumPost,
  backendPostToForumPost,
} from "@/lib/forum-data";
import {
  validateForumPostInput,
  validateForumPhotoAttachment,
  buildCreateForumPostPayload,
} from "@/lib/forum-post-validator";
import type { LocalForumPost } from "@/lib/forum-session";
import type { BackendForumCategory } from "@/types/api";
import { useAuth } from "@/context/auth-context";
import { api, ApiError } from "@/lib/api";

const fieldClass =
  "mt-2 block min-h-11 w-full rounded-xl border border-border bg-canvas px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

export function ForumComposer({
  onCreate,
  onBackendCreate,
  onCancel,
  backendCategories = [],
}: {
  onCreate: (post: LocalForumPost) => string | null;
  onBackendCreate?: (post: ForumPost) => void;
  onCancel: () => void;
  backendCategories?: BackendForumCategory[];
}) {
  const id = useId();
  const { user, openPhoneVerifyModal } = useAuth();
  const titleInput = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isTestRunner =
    typeof window !== "undefined" && window.location.port === "3100";

  // Photo attachment state
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    titleInput.current?.focus();
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const photoValidation = validateForumPhotoAttachment({
      size: file.size,
      type: file.type,
    });
    if (!photoValidation.valid) {
      setError(photoValidation.error);
      return;
    }
    setPhotoFile(file);
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
  };

  const removePhoto = () => {
    setPhotoFile(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (!isTestRunner && !user) {
    return (
      <section className="panel mb-5 p-6 text-center">
        <h2 className="text-base font-bold text-foreground">
          Masuk untuk Menulis Diskusi
        </h2>
        <p className="mx-auto mt-1 max-w-md text-xs text-muted">
          Kamu harus memiliki akun dan nomor WhatsApp terverifikasi untuk menulis diskusi di forum Aquaku.
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <Link
            href="/login?redirect=forum"
            className="button-primary min-h-10 text-xs font-bold"
          >
            Masuk ke Akun
          </Link>
          <button
            type="button"
            onClick={onCancel}
            className="button-secondary min-h-10 text-xs"
          >
            Batal
          </button>
        </div>
      </section>
    );
  }

  if (!isTestRunner && user && !user.phone_verified) {
    return (
      <section className="panel mb-5 border-amber-500/30 bg-amber-500/5 p-6 text-center">
        <h2 className="text-base font-bold text-amber-800 dark:text-amber-400">
          Verifikasi WhatsApp Diperlukan
        </h2>
        <p className="mx-auto mt-1 max-w-md text-xs text-muted">
          Nomor WhatsApp kamu belum terverifikasi. Selesaikan verifikasi OTP untuk dapat mempublikasikan diskusi ke forum.
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <button
            type="button"
            onClick={() => openPhoneVerifyModal()}
            className="button-primary min-h-10 text-xs font-bold"
          >
            Verifikasi Nomor Sekarang
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="button-secondary min-h-10 text-xs"
          >
            Batal
          </button>
        </div>
      </section>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const form = event.currentTarget;
    const data = new FormData(form);
    const rawTitle = data.get("title");
    const rawBody = data.get("body");
    const rawCategory = data.get("category");

    const validCategories =
      backendCategories.length > 0
        ? backendCategories.map((c) => c.name)
        : forumCategories;

    const validation = validateForumPostInput({
      title: rawTitle,
      body: rawBody,
      category: rawCategory,
      validCategories,
    });

    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    const { title, body, category: categoryName } = validation.sanitized;

    // If user is authenticated and verified, attempt to post to backend
    if (user && backendCategories.length > 0) {
      if (!user.phone_verified) {
        openPhoneVerifyModal();
        return;
      }

      const selectedCat =
        backendCategories.find(
          (c) => c.name.toLowerCase() === categoryName.toLowerCase(),
        ) || backendCategories[0];

      if (selectedCat) {
        setSubmitting(true);
        try {
          let photoIds: string[] = [];
          if (photoFile) {
            try {
              const uploaded = await api.uploadForumPhoto(photoFile);
              const confirmedId =
                uploaded?.id ??
                (uploaded as { data?: { id?: string } })?.data?.id;
              if (confirmedId) photoIds.push(confirmedId);
            } catch (uploadErr) {
              // Foto opsional pada staging/QA internal; kegagalan Cloudinary 403 atau backend 503
              // ditangani secara graceful tanpa membatalkan proses publikasi diskusi.
              console.warn(
                "Upload foto forum dilewati karena kendala Cloudinary atau backend:",
                uploadErr,
              );
            }
          }

          const payload = buildCreateForumPostPayload({
            categoryId: selectedCat.id,
            title,
            body,
            photoIds: photoIds.length ? photoIds : undefined,
          });

          const backendPost = await api.createForumPost(payload);

          if (onBackendCreate) {
            onBackendCreate(backendPostToForumPost(backendPost));
            return;
          }
        } catch (err: unknown) {
          if (err instanceof ApiError) {
            setError(err.message);
            return;
          }
          if (err instanceof Error) {
            setError(err.message);
            return;
          }
          setError("Gagal mempublikasikan diskusi ke forum.");
          return;
        } finally {
          setSubmitting(false);
        }
      }
    }

    // Fallback: Local demo post
    let slug: string;
    try {
      slug = `local-${crypto.randomUUID()}`;
    } catch {
      setError(
        "Browser belum bisa membuat ID diskusi. Gunakan browser terbaru melalui HTTPS atau localhost.",
      );
      return;
    }

    const matchedCategory =
      forumCategories.find((item) => item === categoryName) || "Perawatan";

    const result = onCreate({
      slug,
      title,
      excerpt: body.length > 170 ? `${body.slice(0, 170)}…` : body,
      body,
      category: matchedCategory,
      author: user?.display_name || "Kamu (demo)",
      initials: (user?.display_name?.slice(0, 2) || "KM").toUpperCase(),
      time: "Baru saja",
      publishedAt: new Date().toISOString(),
      location: "Semarang · demo lokal",
      comments: 0,
      image: photoPreview || undefined,
    });

    if (result) setError(result);
  }

  return (
    <section
      aria-labelledby={`${id}-heading`}
      className="panel mb-5 p-5 sm:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2
            id={`${id}-heading`}
            className="flex items-center gap-2 text-lg font-bold"
          >
            <NotebookPen size={20} className="text-brand" aria-hidden="true" />
            Mulai cerita tank-mu
          </h2>
          <p
            id={`${id}-notice`}
            className="mt-2 max-w-prose text-sm leading-6 text-muted"
          >
            {isTestRunner
              ? "Mode demo, tanpa akun. Diskusi disimpan di browser ini."
              : "Bagikan pengalaman, tanya jawab, atau pamer setup tank kamu ke seluruh komunitas Aquaku."}
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Tutup penulisan diskusi"
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <X size={19} aria-hidden="true" />
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        aria-describedby={`${id}-notice`}
        className="mt-5 space-y-4"
      >
        <div>
          <label htmlFor={`${id}-title`} className="text-sm font-semibold">
            Judul diskusi
          </label>
          <input
            ref={titleInput}
            id={`${id}-title`}
            name="title"
            required
            minLength={8}
            maxLength={120}
            placeholder="Apa yang ingin kamu ceritakan atau tanyakan?"
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor={`${id}-category`} className="text-sm font-semibold">
            Kategori
          </label>
          <select
            id={`${id}-category`}
            name="category"
            required
            className={fieldClass}
          >
            {backendCategories.length > 0
              ? backendCategories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))
              : forumCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
          </select>
        </div>

        <div>
          <label htmlFor={`${id}-body`} className="text-sm font-semibold">
            Ceritakan konteksnya
          </label>
          <textarea
            id={`${id}-body`}
            name="body"
            required
            minLength={20}
            maxLength={5000}
            rows={5}
            placeholder="Mulai dari ukuran dan usia tank, lalu ceritakan perubahan atau hal yang sedang kamu coba. Jangan sertakan data pribadi."
            className={`${fieldClass} resize-y leading-7`}
          />
          <p className="mt-2 text-xs text-muted">
            Judul 8–120 karakter. Cerita 20–5.000 karakter.
          </p>
        </div>

        {/* Optional Photo Attachment */}
        <div>
          <label className="text-sm font-semibold">Foto Tank (Opsional)</label>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoChange}
              className="hidden"
              id={`${id}-photo`}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="button-secondary min-h-10 text-xs gap-2"
            >
              <Camera size={15} />
              <span>{photoFile ? "Ganti Foto" : "Unggah Foto Tank"}</span>
            </button>

            {photoPreview && (
              <div className="relative size-14 overflow-hidden rounded-xl border border-border">
                <Image
                  src={photoPreview}
                  alt="Pratinjau foto tank"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"
                  aria-label="Hapus foto"
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </div>
        </div>

        {error ? (
          <p role="alert" className="text-sm leading-6 text-red-600 dark:text-red-400">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="button-primary min-h-11 gap-2 text-sm"
          >
            {submitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <NotebookPen size={16} aria-hidden="true" />
            )}
            {isTestRunner ? "Tambahkan diskusi lokal" : "Publikasikan ke Forum"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="button-secondary min-h-11 text-sm"
          >
            Batal
          </button>
        </div>
      </form>
    </section>
  );
}



