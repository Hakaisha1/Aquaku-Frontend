import { expect, test } from "@playwright/test";
import {
  validateForumPostInput,
  validateForumPhotoAttachment,
  canUserCreateForumPost,
  buildCreateForumPostPayload,
  FORUM_POST_RULES,
} from "@/lib/forum-post-validator";
import {
  backendPostToForumPost,
  forumCategories,
  type ForumCategory,
} from "@/lib/forum-data";
import type { BackendForumPost } from "@/types/api";

test.describe("Forum Post Unit Tests: Validasi Input Judul & Konten", () => {
  test("menolak judul yang kurang dari 8 karakter", () => {
    const invalidTitles = ["", "Halo", "Tanya", "1234567", "   abc  "];
    for (const title of invalidTitles) {
      const result = validateForumPostInput({
        title,
        body: "Ini adalah isi diskusi yang cukup panjang lebih dari dua puluh karakter.",
        category: "Perawatan",
      });
      expect(result.valid, `Judul "${title}" seharusnya ditolak`).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain("Judul diskusi minimal 8 karakter");
      }
    }
  });

  test("menerima judul tepat 8 karakter atau lebih dan melakukan trimming whitespace", () => {
    const titleWithSpaces = "  Perawatan Rotala  ";
    const result = validateForumPostInput({
      title: titleWithSpaces,
      body: "Ini adalah isi diskusi yang cukup panjang lebih dari dua puluh karakter.",
      category: "Perawatan",
    });
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.sanitized.title).toBe("Perawatan Rotala");
    }
  });

  test("menolak judul yang melebihi batas 120 karakter", () => {
    const longTitle = "A".repeat(121);
    const result = validateForumPostInput({
      title: longTitle,
      body: "Ini adalah isi diskusi yang cukup panjang lebih dari dua puluh karakter.",
      category: "Perawatan",
    });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain("Judul diskusi maksimal 120 karakter");
    }
  });

  test("menerima judul tepat pada batas maksimal 120 karakter", () => {
    const validMaxTitle = "A".repeat(120);
    const result = validateForumPostInput({
      title: validMaxTitle,
      body: "Ini adalah isi diskusi yang cukup panjang lebih dari dua puluh karakter.",
      category: "Perawatan",
    });
    expect(result.valid).toBe(true);
  });

  test("menolak isi cerita/body yang kurang dari 20 karakter atau hanya spasi", () => {
    const invalidBodies = [
      "",
      "Pendek",
      "Kurang dari 20",
      "                        ",
      "   1234567890123456789 ",
    ];
    for (const body of invalidBodies) {
      const result = validateForumPostInput({
        title: "Judul Diskusi Standar",
        body,
        category: "Perawatan",
      });
      expect(result.valid, `Body "${body}" seharusnya ditolak`).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain("Cerita/konteks diskusi minimal 20 karakter");
      }
    }
  });

  test("menolak body yang melebihi 5.000 karakter", () => {
    const hugeBody = "X".repeat(5001);
    const result = validateForumPostInput({
      title: "Judul Diskusi Standar",
      body: hugeBody,
      category: "Perawatan",
    });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain("Cerita/konteks diskusi maksimal 5000 karakter");
    }
  });

  test("menerima body tepat 20 karakter dan tepat 5.000 karakter", () => {
    const exactMinBody = "12345678901234567890"; // 20 chars
    const exactMaxBody = "M".repeat(5000); // 5000 chars

    const minRes = validateForumPostInput({
      title: "Judul Diskusi Standar",
      body: exactMinBody,
      category: "Perawatan",
    });
    expect(minRes.valid).toBe(true);

    const maxRes = validateForumPostInput({
      title: "Judul Diskusi Standar",
      body: exactMaxBody,
      category: "Perawatan",
    });
    expect(maxRes.valid).toBe(true);
  });
});

test.describe("Forum Post Unit Tests: Validasi Kategori", () => {
  test("menolak jika kategori kosong atau tidak dipilih", () => {
    const result = validateForumPostInput({
      title: "Judul Diskusi Standar",
      body: "Ini adalah isi diskusi yang cukup panjang lebih dari dua puluh karakter.",
      category: "",
    });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain("Pilih kategori diskusi yang sesuai");
    }
  });

  test("menerima semua kategori resmi yang terdaftar", () => {
    for (const category of forumCategories) {
      const result = validateForumPostInput({
        title: "Judul Diskusi Standar",
        body: "Ini adalah isi diskusi yang cukup panjang lebih dari dua puluh karakter.",
        category,
      });
      expect(result.valid, `Kategori ${category} harus valid`).toBe(true);
    }
  });

  test("menolak kategori liar atau sembarangan yang tidak ada di daftar", () => {
    const invalidCategories = ["Kategori Gaib", "Spam", "__proto__", "null"];
    for (const category of invalidCategories) {
      const result = validateForumPostInput({
        title: "Judul Diskusi Standar",
        body: "Ini adalah isi diskusi yang cukup panjang lebih dari dua puluh karakter.",
        category,
      });
      expect(result.valid, `Kategori "${category}" seharusnya ditolak`).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain(`Kategori "${category}" tidak valid`);
      }
    }
  });

  test("mendukung validasi dengan kategori dinamis dari backend", () => {
    const customBackendCategories = ["Diskusi Komunitas", "Jual Beli Santai", "Aquascape Contest"];
    const result = validateForumPostInput({
      title: "Judul Diskusi Standar",
      body: "Ini adalah isi diskusi yang cukup panjang lebih dari dua puluh karakter.",
      category: "Diskusi Komunitas",
      validCategories: customBackendCategories,
    });
    expect(result.valid).toBe(true);

    const rejected = validateForumPostInput({
      title: "Judul Diskusi Standar",
      body: "Ini adalah isi diskusi yang cukup panjang lebih dari dua puluh karakter.",
      category: "Perawatan", // Tidak ada di customBackendCategories
      validCategories: customBackendCategories,
    });
    expect(rejected.valid).toBe(false);
  });
});

test.describe("Forum Post Unit Tests: Validasi Lampiran Foto", () => {
  test("menerima foto dengan ukuran valid <= 5 MB dan tipe yang diizinkan (JPG, PNG, WebP)", () => {
    for (const type of FORUM_POST_RULES.ALLOWED_PHOTO_MIME_TYPES) {
      const result = validateForumPhotoAttachment({
        size: 2 * 1024 * 1024, // 2 MB
        type,
      });
      expect(result.valid).toBe(true);
    }
  });

  test("menolak foto yang melebihi batas 5 MB", () => {
    const oversizedFile = {
      size: 5 * 1024 * 1024 + 1, // 5 MB + 1 byte
      type: "image/jpeg",
    };
    const result = validateForumPhotoAttachment(oversizedFile);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toBe("Ukuran foto maksimal 5 MB.");
    }
  });

  test("menolak format foto selain JPG, PNG, dan WebP (misal GIF, PDF, atau executable)", () => {
    const invalidTypes = ["image/gif", "application/pdf", "text/plain", "video/mp4"];
    for (const type of invalidTypes) {
      const result = validateForumPhotoAttachment({
        size: 1024 * 100,
        type,
      });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toBe("Format foto harus JPG, PNG, atau WebP.");
      }
    }
  });
});

test.describe("Forum Post Unit Tests: Hak Akses Pembuatan Postingan", () => {
  test("menolak posting jika user belum login (unauthenticated)", () => {
    const access = canUserCreateForumPost(null);
    expect(access.allowed).toBe(false);
    if (!access.allowed) {
      expect(access.reason).toBe("unauthenticated");
      expect(access.message).toContain("masuk terlebih dahulu");
    }
  });

  test("menolak posting jika user sudah login tetapi nomor WhatsApp belum terverifikasi (unverified)", () => {
    const userUnverified = { phone_verified: false };
    const access = canUserCreateForumPost(userUnverified);
    expect(access.allowed).toBe(false);
    if (!access.allowed) {
      expect(access.reason).toBe("unverified");
      expect(access.message).toContain("WhatsApp kamu belum diverifikasi");
    }
  });

  test("mengizinkan posting jika user sudah login dan nomor WhatsApp telah terverifikasi", () => {
    const userVerified = { phone_verified: true };
    const access = canUserCreateForumPost(userVerified);
    expect(access.allowed).toBe(true);
  });
});

test.describe("Forum Post Unit Tests: Pembentukan Payload Backend API", () => {
  test("membangun payload bersih tanpa photo_ids jika tidak ada foto terlampir", () => {
    const payload = buildCreateForumPostPayload({
      categoryId: "cat-123-uuid",
      title: "  Tips Mengatasi BGA di Karpet Cuba  ",
      body: "  Pemberian H2O2 dengan pipet tepat sasaran sangat efektif.  ",
    });

    expect(payload).toEqual({
      category_id: "cat-123-uuid",
      title: "Tips Mengatasi BGA di Karpet Cuba",
      body: "Pemberian H2O2 dengan pipet tepat sasaran sangat efektif.",
    });
    expect(payload.photo_ids).toBeUndefined();
  });

  test("membangun payload lengkap dengan photo_ids jika terdapat foto yang diunggah", () => {
    const payload = buildCreateForumPostPayload({
      categoryId: "cat-123-uuid",
      title: "Setup Iwagumi 60x30x30 Stone Layout",
      body: "Batu seiryu stone dipadukan dengan pasir silika dan tanaman glossostigma.",
      photoIds: ["photo-uuid-1", "photo-uuid-2"],
    });

    expect(payload.photo_ids).toEqual(["photo-uuid-1", "photo-uuid-2"]);
    expect(payload.category_id).toBe("cat-123-uuid");
  });
});

test.describe("Forum Post Unit Tests: Transformasi Respons Backend (backendPostToForumPost)", () => {
  const dummyBackendPost: BackendForumPost = {
    id: "post-uuid-9999",
    category: {
      id: "cat-1",
      slug: "perawatan",
      name: "Perawatan",
      description: "Perawatan tanaman dan air",
    },
    title: "Mengatasi Rotala Kerdil Setelah Trimming",
    body: "Setelah memangkas rotala h'ra pada minggu ketiga, pucuk baru terlihat kerdil dan daun melengkung. Saya menduga ada defisiensi kalsium atau kalium dalam air.",
    status: "published",
    author: {
      id: "user-1",
      display_name: "Budi Santoso",
      avatar_url: null,
    },
    photos: [{ id: "photo-1", url: "https://example.com/rotala.jpg" }],
    reports_count: 0,
    moderation_reason: null,
    comments_count: 5,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 jam lalu
    updated_at: new Date().toISOString(),
  };

  test("memetakan id menjadi slug, judul, jumlah komentar, dan inisial avatar yang tepat", () => {
    const result = backendPostToForumPost(dummyBackendPost);

    expect(result.slug).toBe(dummyBackendPost.id);
    expect(result.title).toBe(dummyBackendPost.title);
    expect(result.comments).toBe(5);
    expect(result.author).toBe("Budi Santoso");
    expect(result.initials).toBe("BU");
    expect(result.image).toBe("https://example.com/rotala.jpg");
    expect(result.category).toBe("Perawatan");
    expect(result.time).toBe("2 jam lalu");
  });

  test("memotong excerpt hingga maksimal 170 karakter dengan akhiran elipsis (…) jika teks panjang", () => {
    const longBody = "A".repeat(200);
    const postWithLongBody: BackendForumPost = {
      ...dummyBackendPost,
      body: longBody,
    };

    const result = backendPostToForumPost(postWithLongBody);
    expect(result.excerpt).toBe(`${"A".repeat(170)}…`);
    expect(result.excerpt.length).toBe(171); // 170 + 1 char unicode elipsis
  });

  test("fallback kategori ke Perawatan jika kategori backend belum dikenal", () => {
    const postWithUnknownCat: BackendForumPost = {
      ...dummyBackendPost,
      category: {
        id: "cat-unknown",
        slug: "unknown",
        name: "Kategori Tak Dikenal",
        description: "Deskripsi",
      },
    };

    const result = backendPostToForumPost(postWithUnknownCat);
    expect(result.category).toBe("Perawatan");
  });

  test("fallback inisial jika display_name penulis tidak tersedia", () => {
    const postWithAnonAuthor: BackendForumPost = {
      ...dummyBackendPost,
      author: null,
    };

    const result = backendPostToForumPost(postWithAnonAuthor);
    expect(result.author).toBe("Anggota Komunitas");
    expect(result.initials).toBe("AN");
  });
});
