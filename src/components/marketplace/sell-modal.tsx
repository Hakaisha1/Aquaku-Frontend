"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Info,
  Loader2,
  Plus,
  ShieldAlert,
  Sparkles,
  Tag,
  UploadCloud,
  X,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { api, ApiError } from "@/lib/api";
import type {
  Category,
  ListingCondition,
  Region,
} from "@/types/api";

type UploadedPhotoItem = {
  id: string; // ID asset dari backend PostgreSQL (UUID)
  url: string; // URL preview gambar
  name: string;
};

export function SellModal() {
  const { isSellModalOpen, closeSellModal, user, quota, refreshQuota } =
    useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");

  const [loadingMeta, setLoadingMeta] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [regionCode, setRegionCode] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState<ListingCondition>("SECOND");
  const [description, setDescription] = useState("");
  const [useCooldownPass, setUseCooldownPass] = useState(false);

  // Photos state
  const [photos, setPhotos] = useState<UploadedPhotoItem[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Load taxonomy and regions on mount or open
  useEffect(() => {
    if (!isSellModalOpen) return;
    setSuccess(false);
    setError(null);
    setPhotoError(null);
    setLoadingMeta(true);

    Promise.all([api.getTaxonomy(), api.getRegions()])
      .then(([tax, regs]) => {
        setCategories(tax.categories || []);
        if (tax.categories?.length > 0) {
          setCategoryId((prev) =>
            tax.categories.some((c) => c.id === prev) ? prev : tax.categories[0].id,
          );
        }
        setRegions(regs || []);
        const uniqueDistricts = Array.from(
          new Set((regs || []).map((r) => r.district)),
        ).sort();
        setDistricts(uniqueDistricts);
        if (uniqueDistricts.length > 0) {
          setSelectedDistrict((prev) =>
            uniqueDistricts.includes(prev) ? prev : uniqueDistricts[0],
          );
        }
      })
      .catch(() => {
        // Fallback demo categories if offline
        setCategories([
          { id: "demo-tanaman", slug: "aquatic-plants", name: "Tanaman air" },
          { id: "demo-fauna", slug: "aquatic-animals", name: "Hewan air" },
          { id: "demo-hardscape", slug: "hardscape", name: "Hardscape" },
          { id: "demo-peralatan", slug: "equipment", name: "Peralatan" },
        ]);
      })
      .finally(() => setLoadingMeta(false));
  }, [isSellModalOpen]);

  // Sync regionCode whenever selectedDistrict or regions change
  useEffect(() => {
    if (!selectedDistrict || regions.length === 0) return;
    const kelurahans = regions.filter((r) => r.district === selectedDistrict);
    if (kelurahans.length > 0) {
      setRegionCode((prev) =>
        kelurahans.some((k) => k.code === prev) ? prev : kelurahans[0].code,
      );
    }
  }, [selectedDistrict, regions]);

  // Sync categoryId if categories are loaded and current categoryId is empty
  useEffect(() => {
    if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  // When selected district changes from select input
  const handleDistrictChange = (d: string) => {
    setSelectedDistrict(d);
    const match = regions.find((r) => r.district === d);
    if (match) setRegionCode(match.code);
  };

  const kelurahanList = regions.filter((r) => r.district === selectedDistrict);

  // Condition restriction check: Personal cannot use BNIB or NEW
  const isConditionRestricted =
    user?.tier === "personal" && (condition === "BNIB" || condition === "NEW");

  // Min photo rule based on condition
  const minPhotos = condition === "BNIB" || condition === "NEW" ? 1 : 3;

  // Handle file uploads (Dropzone or file input)
  const handleFilesUpload = async (files: File[]) => {
    setPhotoError(null);
    if (files.length === 0) return;

    if (photos.length + files.length > 8) {
      setPhotoError(
        `Maksimal 8 foto per listing. Kamu sudah memiliki ${photos.length} foto, hanya bisa menambah ${8 - photos.length} foto lagi.`,
      );
      return;
    }

    setUploadingPhotos(true);
    try {
      for (const file of files) {
        // Check size: max 5 MB
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`Ukuran foto "${file.name}" melebihi batas 5 MB.`);
        }
        // Check MIME type: JPG, PNG, WebP
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
          throw new Error(
            `Format file "${file.name}" tidak didukung. Gunakan file JPG, PNG, atau WebP.`,
          );
        }

        const uploadedAsset = await api.uploadListingPhoto(file);
        if (!uploadedAsset?.id) {
          throw new Error(`Gagal memproses unggahan foto "${file.name}".`);
        }

        const previewUrl = uploadedAsset.url || URL.createObjectURL(file);
        setPhotos((prev) => [
          ...prev,
          {
            id: uploadedAsset.id,
            url: previewUrl,
            name: file.name,
          },
        ]);
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setPhotoError(err.message);
      } else if (err instanceof Error) {
        setPhotoError(err.message);
      } else {
        setPhotoError("Terjadi kesalahan saat mengunggah foto ke Cloudinary.");
      }
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handleRemovePhoto = async (photoId: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    try {
      await api.deleteMarketplaceMedia(photoId);
    } catch {
      // ignore deletion error on UI
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPhotoError(null);

    if (isConditionRestricted) {
      setError(
        "Kondisi BNIB dan Baru hanya diizinkan untuk penjual berstatus Toko atau Juragan.",
      );
      return;
    }

    if (quota?.cooldown_until && !useCooldownPass) {
      setError(
        "Akun kamu sedang dalam masa cooldown. Gunakan Cooldown Pass jika tersedia atau tunggu masa cooldown selesai.",
      );
      return;
    }

    // 1. Validasi Kategori
    if (!categoryId || categoryId.startsWith("demo-")) {
      setError(
        "Kategori tidak valid atau belum termuat dari server. Pastikan koneksi server aktif.",
      );
      return;
    }

    // 2. Validasi Wilayah
    if (!regionCode) {
      setError(
        "Pilih kecamatan dan kelurahan di Kota Semarang untuk lokasi barang.",
      );
      return;
    }

    // 3. Validasi Judul
    const cleanTitle = title.trim();
    if (cleanTitle.length < 5 || cleanTitle.length > 120) {
      setError("Judul listing harus antara 5 hingga 120 karakter.");
      return;
    }

    // 4. Validasi Deskripsi
    const cleanDesc = description.trim();
    if (cleanDesc.length < 10 || cleanDesc.length > 5000) {
      setError("Deskripsi listing minimal 10 karakter (maksimal 5.000 karakter).");
      return;
    }

    // 5. Validasi Harga
    const priceNum = parseInt(price.replace(/\D/g, ""), 10);
    if (isNaN(priceNum) || priceNum < 1) {
      setError("Masukkan harga yang valid dalam Rupiah (minimal Rp 1).");
      return;
    }
    if (priceNum > 2147483647) {
      setError("Harga melebihi batas maksimal yang diizinkan.");
      return;
    }

    // 6. Validasi Foto
    if (photos.length < minPhotos) {
      setError(
        `Foto barang belum memenuhi syarat. Kondisi ${condition} membutuhkan minimal ${minPhotos} foto aktual terunggah. Silakan unggah foto produk Anda terlebih dahulu.`,
      );
      return;
    }

    const photoIds = photos.map((p) => p.id);

    setSubmitting(true);
    try {
      await api.createListing({
        category_id: categoryId,
        region_code: regionCode,
        title: cleanTitle,
        description: cleanDesc,
        price: priceNum,
        condition,
        photo_ids: photoIds,
      });
      setSuccess(true);
      await refreshQuota();
      setTimeout(() => {
        closeSellModal();
      }, 1500);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Gagal memasang listing. Periksa kembali kelengkapan data kamu.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isSellModalOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Pasang Listing Jual Barang"
      className="modal-backdrop-animate fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeSellModal();
      }}
    >
      <div className="modal-panel-animate relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-2xl sm:p-7">
        <button
          onClick={closeSellModal}
          className="icon-button absolute right-4 top-4"
          aria-label="Tutup"
        >
          <X size={18} />
        </button>

        <div className="mb-4">
          <p className="text-xs font-semibold text-brand">Marketplace Aquaku</p>
          <h2 className="text-xl font-extrabold tracking-tight">
            Pasang Listing Barang
          </h2>
          <p className="mt-1 text-xs text-muted">
            Jual tanaman, fauna, atau perlengkapan langsung ke hobiis di Semarang.
          </p>
        </div>

        {success ? (
          <div className="my-8 flex flex-col items-center justify-center rounded-2xl border border-brand/20 bg-soft p-6 text-center">
            <CheckCircle2 size={40} className="mb-2 text-brand" />
            <h3 className="text-base font-bold text-foreground">
              Listing Berhasil Dipasang!
            </h3>
            <p className="mt-1 text-xs text-muted">
              Barang kamu sekarang aktif dan dapat dilihat oleh pengguna lain.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Quota reminder */}
            {quota && (
              <div className="flex items-center justify-between rounded-xl border border-border bg-canvas px-3.5 py-2.5 text-xs text-muted">
                <span>
                  Slot Aktif:{" "}
                  <strong className="text-foreground">
                    {quota.active_listings} / {quota.total_quota}
                  </strong>
                </span>
                <span>
                  Sisa:{" "}
                  <strong className="text-brand">
                    {quota.available_slots} slot
                  </strong>
                </span>
              </div>
            )}

            {/* Judul */}
            <div>
              <label
                htmlFor="listing-title"
                className="mb-1 block text-xs font-semibold text-muted"
              >
                Judul Listing (5–120 karakter) *
              </label>
              <input
                id="listing-title"
                type="text"
                required
                minLength={5}
                maxLength={120}
                placeholder="Contoh: Anubias nana petite rimpang segar 5 daun"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="field"
              />
            </div>

            {/* Kategori & Kondisi */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="listing-category"
                  className="mb-1 block text-xs font-semibold text-muted"
                >
                  Kategori *
                </label>
                <select
                  id="listing-category"
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="field"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="listing-condition"
                  className="mb-1 block text-xs font-semibold text-muted"
                >
                  Kondisi Barang *
                </label>
                <select
                  id="listing-condition"
                  required
                  value={condition}
                  onChange={(e) =>
                    setCondition(e.target.value as ListingCondition)
                  }
                  className="field"
                >
                  <option value="SECOND">Second / Bekas Pakai (Min. 3 Foto)</option>
                  <option value="LIKE_NEW">Like New / Seperti Baru (Min. 3 Foto)</option>
                  <option
                    value="NEW"
                    disabled={user?.tier === "personal"}
                  >
                    Baru / New (Min. 1 Foto) {user?.tier === "personal" ? "- Khusus Toko/Juragan" : ""}
                  </option>
                  <option
                    value="BNIB"
                    disabled={user?.tier === "personal"}
                  >
                    BNIB Box Tersegel (Min. 1 Foto) {user?.tier === "personal" ? "- Khusus Toko/Juragan" : ""}
                  </option>
                </select>
              </div>
            </div>

            {isConditionRestricted && (
              <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
                <Info size={16} className="shrink-0" />
                <span>
                  Akun Personal hanya dapat menjual kondisi Second dan Like New.
                  Tingkatkan ke Toko untuk menjual barang Baru/BNIB.
                </span>
              </div>
            )}

            {/* Harga */}
            <div>
              <label
                htmlFor="listing-price"
                className="mb-1 block text-xs font-semibold text-muted"
              >
                Harga (Rupiah, bulat) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted">
                  Rp
                </span>
                <input
                  id="listing-price"
                  type="number"
                  min={1}
                  required
                  placeholder="25000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="field pl-10 font-mono"
                />
              </div>
            </div>

            {/* Lokasi Semarang */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="listing-district"
                  className="mb-1 block text-xs font-semibold text-muted"
                >
                  Kecamatan (Kota Semarang) *
                </label>
                <select
                  id="listing-district"
                  value={selectedDistrict}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="field"
                >
                  {districts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="listing-kelurahan"
                  className="mb-1 block text-xs font-semibold text-muted"
                >
                  Kelurahan *
                </label>
                <select
                  id="listing-kelurahan"
                  required
                  value={regionCode}
                  onChange={(e) => setRegionCode(e.target.value)}
                  className="field"
                >
                  {kelurahanList.map((k) => (
                    <option key={k.code} value={k.code}>
                      {k.kelurahan}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Deskripsi */}
            <div>
              <label
                htmlFor="listing-desc"
                className="mb-1 block text-xs font-semibold text-muted"
              >
                Deskripsi & Ketentuan COD (10–5000 karakter) *
              </label>
              <textarea
                id="listing-desc"
                required
                minLength={10}
                maxLength={5000}
                rows={4}
                placeholder="Jelaskan kondisi tanaman/ikan/barang, riwayat pemakaian, serta area COD yang disepakati di Semarang..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="field min-h-24 resize-y py-2 text-xs leading-5"
              />
            </div>

            {/* Foto Barang (Dropbox / Dropzone Upload Interaktif) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-semibold text-muted">
                    Foto Kondisi Aktual Barang *
                  </label>
                  <p className="text-[11px] text-muted">
                    Kondisi <strong>{condition}</strong>: minimal {minPhotos} foto, maksimal 8 foto (JPG, PNG, WebP maks 5 MB).
                  </p>
                </div>
                <span
                  className={`text-[11px] font-bold ${
                    photos.length >= minPhotos
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {photos.length} / 8 foto ({photos.length >= minPhotos ? "Siap dipasang" : `Kurang ${minPhotos - photos.length}`})
                </span>
              </div>

              {/* Dropzone Area */}
              {photos.length < 8 && (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files) {
                      handleFilesUpload(Array.from(e.dataTransfer.files));
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
                    isDragging
                      ? "border-brand bg-brand/5 scale-[1.01]"
                      : "border-border hover:border-brand/50 hover:bg-soft/50"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        handleFilesUpload(Array.from(e.target.files));
                        e.target.value = "";
                      }
                    }}
                  />
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-brand/10 text-brand transition-transform group-hover:scale-110">
                    {uploadingPhotos ? (
                      <Loader2 size={24} className="animate-spin" />
                    ) : (
                      <UploadCloud size={24} />
                    )}
                  </div>
                  <p className="mt-2 text-xs font-bold text-foreground">
                    {uploadingPhotos
                      ? "Sedang memproses & mengunggah foto ke Cloudinary..."
                      : "Tarik & lepas foto di sini, atau klik untuk memilih file"}
                  </p>
                  <p className="mt-1 text-[11px] text-muted">
                    Format JPG, PNG, atau WebP (maksimal 5 MB per foto).
                  </p>
                </div>
              )}

              {photoError && (
                <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{photoError}</span>
                </div>
              )}

              {/* Grid Pratinjau Foto */}
              {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                  {photos.map((photo, idx) => (
                    <div
                      key={photo.id}
                      className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-soft shadow-xs"
                    >
                      <Image
                        src={photo.url}
                        alt={`Foto produk ${idx + 1}`}
                        fill
                        className="object-cover transition-transform duration-200 group-hover:scale-105"
                      />
                      {idx === 0 && (
                        <span className="absolute bottom-1.5 left-1.5 rounded-md bg-black/75 px-1.5 py-0.5 text-[9px] font-bold text-white backdrop-blur-xs">
                          Cover Utama
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemovePhoto(photo.id);
                        }}
                        className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-black/75 text-white shadow-sm transition-transform hover:scale-110 hover:bg-red-600"
                        title="Hapus foto"
                        aria-label="Hapus foto"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cooldown pass checkbox if applicable */}
            {quota && quota.available_cooldown_passes > 0 && (
              <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={useCooldownPass}
                  onChange={(e) => setUseCooldownPass(e.target.checked)}
                  className="rounded border-border text-brand"
                />
                <span>
                  Gunakan 1 Cooldown Pass (Sisa: {quota.available_cooldown_passes})
                </span>
              </label>
            )}

            <button
              type="submit"
              disabled={submitting || loadingMeta || isConditionRestricted || uploadingPhotos}
              className="button-primary w-full"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Memasang Listing…
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Pasang Listing Sekarang
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
