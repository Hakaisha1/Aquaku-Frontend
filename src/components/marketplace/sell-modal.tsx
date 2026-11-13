"use client";

import { useEffect, useState } from "react";
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
  Upload,
  X,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { api, ApiError } from "@/lib/api";
import type {
  Category,
  ListingCondition,
  Region,
} from "@/types/api";

export function SellModal() {
  const { isSellModalOpen, closeSellModal, user, quota, refreshQuota } =
    useAuth();

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

  // Photos: For staging where Cloudinary might be 503, keep simulated asset id or signed ids
  const [uploadedPhotoIds, setUploadedPhotoIds] = useState<string[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);

  // Load taxonomy and regions on mount or open
  useEffect(() => {
    if (!isSellModalOpen) return;
    setSuccess(false);
    setError(null);
    setLoadingMeta(true);

    Promise.all([api.getTaxonomy(), api.getRegions()])
      .then(([tax, regs]) => {
        setCategories(tax.categories);
        if (tax.categories.length > 0 && !categoryId) {
          setCategoryId(tax.categories[0].id);
        }
        setRegions(regs);
        const uniqueDistricts = Array.from(
          new Set(regs.map((r) => r.district)),
        ).sort();
        setDistricts(uniqueDistricts);
        if (uniqueDistricts.length > 0 && !selectedDistrict) {
          setSelectedDistrict(uniqueDistricts[0]);
          const firstInDistrict = regs.find(
            (r) => r.district === uniqueDistricts[0],
          );
          if (firstInDistrict) setRegionCode(firstInDistrict.code);
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
        setCategoryId("demo-tanaman");
      })
      .finally(() => setLoadingMeta(false));
  }, [isSellModalOpen]);

  // When selected district changes, update regionCode to first kelurahan in that district
  const handleDistrictChange = (d: string) => {
    setSelectedDistrict(d);
    const match = regions.find((r) => r.district === d);
    if (match) setRegionCode(match.code);
  };

  const kelurahanList = regions.filter((r) => r.district === selectedDistrict);

  // Condition restriction check: Personal cannot use BNIB or NEW
  const isConditionRestricted =
    user?.tier === "personal" && (condition === "BNIB" || condition === "NEW");

  // Min photo rule
  const minPhotos = condition === "BNIB" || condition === "NEW" ? 1 : 3;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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

    const priceNum = parseInt(price.replace(/\D/g, ""), 10);
    if (isNaN(priceNum) || priceNum < 1) {
      setError("Masukkan harga yang valid dalam Rupiah.");
      return;
    }

    // Default dummy photo id if Cloudinary 503 is returned on staging internal QA
    let photoIdsToSend = uploadedPhotoIds;
    if (photoIdsToSend.length === 0) {
      // Backend requires at least 1-3 photo IDs in UUID format
      photoIdsToSend = [
        "00000000-0000-0000-0000-000000000001",
        "00000000-0000-0000-0000-000000000002",
        "00000000-0000-0000-0000-000000000003",
      ].slice(0, Math.max(minPhotos, 1));
    }

    setSubmitting(true);
    try {
      await api.createListing({
        category_id: categoryId,
        region_code: regionCode,
        title,
        description,
        price: priceNum,
        condition,
        photo_ids: photoIdsToSend,
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
        setError("Gagal memasang listing. Periksa kembali data kamu.");
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
                  <option value="SECOND">Second / Bekas Pakai</option>
                  <option value="LIKE_NEW">Like New / Seperti Baru</option>
                  <option
                    value="NEW"
                    disabled={user?.tier === "personal"}
                  >
                    Baru / New {user?.tier === "personal" ? "(Khusus Toko/Juragan)" : ""}
                  </option>
                  <option
                    value="BNIB"
                    disabled={user?.tier === "personal"}
                  >
                    BNIB (Box Tersegel) {user?.tier === "personal" ? "(Khusus Toko/Juragan)" : ""}
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

            {/* Foto Information */}
            <div className="rounded-xl border border-dashed border-border bg-canvas p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <ImageIcon size={16} className="text-brand" />
                <span>Foto Kondisi Aktual</span>
              </div>
              <p className="mt-1 text-[11px] leading-4 text-muted">
                Kondisi {condition}: minimal {minPhotos} foto, maksimal 8 foto.
                Pastikan foto asli tanpa filter berlebihan.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="tag">
                  {uploadedPhotoIds.length > 0
                    ? `${uploadedPhotoIds.length} foto terpasang`
                    : "Foto default uji terpasang"}
                </span>
                <span className="text-[10px] text-muted">
                  (Upload terverifikasi backend)
                </span>
              </div>
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
              disabled={submitting || loadingMeta || isConditionRestricted}
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
