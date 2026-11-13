import { forumCategories, type ForumCategory } from "./forum-data";

export const FORUM_POST_RULES = {
  TITLE_MIN_LENGTH: 8,
  TITLE_MAX_LENGTH: 120,
  BODY_MIN_LENGTH: 20,
  BODY_MAX_LENGTH: 5000,
  MAX_PHOTO_SIZE_BYTES: 5 * 1024 * 1024, // 5 MB
  ALLOWED_PHOTO_MIME_TYPES: [
    "image/jpeg",
    "image/png",
    "image/webp",
  ] as const,
} as const;

export type ForumPostValidationResult =
  | {
      valid: true;
      sanitized: {
        title: string;
        body: string;
        category: ForumCategory | string;
      };
    }
  | {
      valid: false;
      error: string;
    };

/**
 * Validates forum post title, body, and category inputs.
 * Ensures whitespace trimming and length constraints match API & UX specs.
 */
export function validateForumPostInput(input: {
  title?: unknown;
  body?: unknown;
  category?: unknown;
  validCategories?: readonly string[];
}): ForumPostValidationResult {
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const body = typeof input.body === "string" ? input.body.trim() : "";
  const category = typeof input.category === "string" ? input.category.trim() : "";

  if (title.length < FORUM_POST_RULES.TITLE_MIN_LENGTH) {
    return {
      valid: false,
      error: `Judul diskusi minimal ${FORUM_POST_RULES.TITLE_MIN_LENGTH} karakter (bukan hanya spasi).`,
    };
  }

  if (title.length > FORUM_POST_RULES.TITLE_MAX_LENGTH) {
    return {
      valid: false,
      error: `Judul diskusi maksimal ${FORUM_POST_RULES.TITLE_MAX_LENGTH} karakter.`,
    };
  }

  if (body.length < FORUM_POST_RULES.BODY_MIN_LENGTH) {
    return {
      valid: false,
      error: `Cerita/konteks diskusi minimal ${FORUM_POST_RULES.BODY_MIN_LENGTH} karakter (bukan hanya spasi).`,
    };
  }

  if (body.length > FORUM_POST_RULES.BODY_MAX_LENGTH) {
    return {
      valid: false,
      error: `Cerita/konteks diskusi maksimal ${FORUM_POST_RULES.BODY_MAX_LENGTH} karakter.`,
    };
  }

  if (!category) {
    return {
      valid: false,
      error: "Pilih kategori diskusi yang sesuai.",
    };
  }

  const allowedCategories = input.validCategories ?? forumCategories;
  const isCategoryValid = allowedCategories.some(
    (c) => c.toLowerCase() === category.toLowerCase(),
  );

  if (!isCategoryValid) {
    return {
      valid: false,
      error: `Kategori "${category}" tidak valid.`,
    };
  }

  return {
    valid: true,
    sanitized: {
      title,
      body,
      category,
    },
  };
}

/**
 * Validates photo attachment constraints (size limit and MIME types).
 */
export function validateForumPhotoAttachment(file: {
  size: number;
  type: string;
}): { valid: true } | { valid: false; error: string } {
  if (file.size > FORUM_POST_RULES.MAX_PHOTO_SIZE_BYTES) {
    return {
      valid: false,
      error: "Ukuran foto maksimal 5 MB.",
    };
  }

  const isAllowed = (FORUM_POST_RULES.ALLOWED_PHOTO_MIME_TYPES as readonly string[]).includes(
    file.type,
  );

  if (!isAllowed) {
    return {
      valid: false,
      error: "Format foto harus JPG, PNG, atau WebP.",
    };
  }

  return { valid: true };
}

/**
 * Verifies if user has permission to post to backend forum:
 * User must be logged in AND have verified phone number (WhatsApp OTP).
 */
export function canUserCreateForumPost(user: {
  phone_verified?: boolean;
} | null):
  | { allowed: true }
  | {
      allowed: false;
      reason: "unauthenticated" | "unverified";
      message: string;
    } {
  if (!user) {
    return {
      allowed: false,
      reason: "unauthenticated",
      message: "Kamu harus masuk terlebih dahulu untuk menulis postingan forum.",
    };
  }

  if (!user.phone_verified) {
    return {
      allowed: false,
      reason: "unverified",
      message: "Nomor WhatsApp kamu belum diverifikasi.",
    };
  }

  return { allowed: true };
}

/**
 * Builds the typed payload expected by the backend `POST /forum/posts` endpoint.
 */
export function buildCreateForumPostPayload(params: {
  categoryId: string;
  title: string;
  body: string;
  photoIds?: string[];
}): {
  category_id: string;
  title: string;
  body: string;
  photo_ids?: string[];
} {
  return {
    category_id: params.categoryId,
    title: params.title.trim(),
    body: params.body.trim(),
    ...(params.photoIds && params.photoIds.length > 0
      ? { photo_ids: params.photoIds }
      : {}),
  };
}
