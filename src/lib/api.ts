import type {
  ApiErrorResponse,
  BackendForumCategory,
  BackendForumComment,
  BackendForumCommentPage,
  BackendForumPost,
  BackendForumPostPage,
  BackendForumReport,
  BenefitRequest,
  ForumMediaAsset,
  ForumReportReason,
  ForumUploadSignature,
  Listing,
  ListingCondition,
  ListingPage,
  MembershipPlan,
  PublicProfile,
  Quota,
  Rating,
  Region,
  Report,
  ReportReason,
  SaleTransaction,
  Taxonomy,
  TokenPair,
  UserProfile,
} from "@/types/api";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined"
    ? "/api/v1"
    : "https://aquaku-backend-staging.up.railway.app/api/v1");

const TOKEN_KEY = "aquaku_token_pair";
type AuthListener = (user: UserProfile | null) => void;
const listeners = new Set<AuthListener>();

export function getStoredTokens(): TokenPair | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredTokens(tokens: TokenPair | null): void {
  if (typeof window === "undefined") return;
  try {
    if (tokens) {
      localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // ignore storage restrictions
  }
  listeners.forEach((listener) => listener(tokens?.user ?? null));
}

export function subscribeAuth(listener: AuthListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

let refreshPromise: Promise<TokenPair | null> | null = null;

async function refreshTokens(): Promise<TokenPair | null> {
  const current = getStoredTokens();
  if (!current?.refresh_token) {
    setStoredTokens(null);
    return null;
  }

  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: current.refresh_token }),
      });
      if (!res.ok) {
        setStoredTokens(null);
        return null;
      }
      const json = await res.json();
      const updated: TokenPair = json.data;
      setStoredTokens(updated);
      return updated;
    } catch {
      setStoredTokens(null);
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  retried = false,
): Promise<T> {
  const tokens = getStoredTokens();
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (tokens?.access_token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${tokens.access_token}`);
  }

  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;

  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err) {
    throw new ApiError(
      503,
      "NETWORK_ERROR",
      "Tidak dapat terhubung ke server backend. Periksa koneksi internet kamu.",
    );
  }

  if (res.status === 401 && !retried && tokens?.refresh_token) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      return apiRequest<T>(path, options, true);
    }
  }

  if (!res.ok) {
    let code = `HTTP_${res.status}`;
    let message = `Permintaan gagal dengan status ${res.status}`;
    try {
      const errorJson: ApiErrorResponse = await res.json();
      if (errorJson?.error) {
        code = errorJson.error.code || code;
        message = errorJson.error.message || message;
      }
    } catch {
      // response is not json
    }
    throw new ApiError(res.status, code, message);
  }

  if (res.status === 204) {
    return undefined as unknown as T;
  }

  const json = await res.json();
  return json.data !== undefined ? json.data : (json as T);
}

// ----------------------------------------------------
// Specific API Endpoints
// ----------------------------------------------------

// Helper: format phone number from 08... or +62... to 62...
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.trim().replace(/[\s\-_()]/g, "");
  return cleaned.replace(/^(\+62|0)/, "62");
}

export const api = {
  // Auth
  async register(body: {
    email: string;
    password: string;
    display_name: string;
    phone_number: string;
  }): Promise<{ user: UserProfile; development_otp?: string }> {
    const formattedBody = {
      ...body,
      phone_number: formatPhoneNumber(body.phone_number),
    };
    let res: Response;
    try {
      res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedBody),
      });
    } catch {
      throw new ApiError(
        503,
        "NETWORK_ERROR",
        "Tidak dapat terhubung ke server backend. Periksa koneksi internet kamu.",
      );
    }
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      throw new ApiError(
        res.status,
        json?.error?.code || "REGISTER_FAILED",
        json?.error?.message || "Registrasi gagal",
      );
    }
    return {
      user: json.data,
      development_otp: json.development_otp,
    };
  },

  async login(body: { email: string; password: string }): Promise<TokenPair> {
    const data = await apiRequest<TokenPair>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    });
    setStoredTokens(data);
    return data;
  },

  logout(): void {
    setStoredTokens(null);
  },

  async verifyPhone(code: string): Promise<UserProfile> {
    const user = await apiRequest<UserProfile>("/auth/verify-phone", {
      method: "POST",
      body: JSON.stringify({ code }),
    });
    const tokens = getStoredTokens();
    if (tokens) {
      setStoredTokens({ ...tokens, user });
    }
    return user;
  },

  async resendOtp(): Promise<{ development_otp?: string }> {
    return apiRequest<{ development_otp?: string }>("/auth/otp/resend", {
      method: "POST",
    });
  },

  // Users
  async getMe(): Promise<UserProfile> {
    const user = await apiRequest<UserProfile>("/users/me");
    const tokens = getStoredTokens();
    if (tokens) {
      setStoredTokens({ ...tokens, user });
    }
    return user;
  },

  async updateMe(body: {
    display_name?: string;
    avatar_url?: string;
    whatsapp_number?: string;
    bio?: string;
  }): Promise<UserProfile> {
    const payload = {
      ...body,
      ...(body.whatsapp_number
        ? { whatsapp_number: formatPhoneNumber(body.whatsapp_number) }
        : {}),
    };
    const user = await apiRequest<UserProfile>("/users/me", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    const tokens = getStoredTokens();
    if (tokens) {
      setStoredTokens({ ...tokens, user });
    }
    return user;
  },

  async getPublicProfile(userId: string): Promise<PublicProfile> {
    return apiRequest<PublicProfile>(`/users/${userId}`);
  },

  // Taxonomy & Regions
  async getTaxonomy(): Promise<Taxonomy> {
    return apiRequest<Taxonomy>("/marketplace/taxonomy");
  },

  async getRegions(): Promise<Region[]> {
    return apiRequest<Region[]>("/marketplace/regions");
  },

  // Listings
  async getListings(params?: {
    q?: string;
    category?: string;
    condition?: string;
    min_price?: number;
    max_price?: number;
    region_code?: string;
    district_code?: string;
    sort?: "newest" | "price_asc" | "price_desc";
    page?: number;
    limit?: number;
  }): Promise<ListingPage> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== "") {
          query.set(key, String(val));
        }
      });
    }
    const qStr = query.toString();
    return apiRequest<ListingPage>(
      `/marketplace/listings${qStr ? `?${qStr}` : ""}`,
    );
  },

  async getListing(listingId: string): Promise<Listing> {
    return apiRequest<Listing>(`/marketplace/listings/${listingId}`);
  },

  async getMyListings(): Promise<Listing[]> {
    return apiRequest<Listing[]>("/marketplace/me/listings");
  },

  async createListing(body: {
    category_id: string;
    region_code: string;
    title: string;
    description: string;
    price: number;
    condition: ListingCondition;
    photo_ids: string[];
    cooldown_pass_id?: string;
  }): Promise<Listing> {
    return apiRequest<Listing>("/marketplace/listings", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async updateListing(
    listingId: string,
    body: {
      category_id?: string;
      region_code?: string;
      title?: string;
      description?: string;
      price?: number;
      condition?: ListingCondition;
      photo_ids?: string[];
    },
  ): Promise<Listing> {
    return apiRequest<Listing>(`/marketplace/listings/${listingId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  async deleteListing(listingId: string): Promise<void> {
    return apiRequest<void>(`/marketplace/listings/${listingId}`, {
      method: "DELETE",
    });
  },

  async renewListing(listingId: string): Promise<Listing> {
    return apiRequest<Listing>(`/marketplace/listings/${listingId}/renew`, {
      method: "POST",
    });
  },

  async reactivateListing(listingId: string): Promise<Listing> {
    return apiRequest<Listing>(
      `/marketplace/listings/${listingId}/reactivate`,
      {
        method: "POST",
      },
    );
  },

  async markSold(
    listingId: string,
    buyer_id?: string,
  ): Promise<{
    id: string;
    status: "sold";
    sold_at: string;
    transaction: { id: string; buyer_id: string; status: string } | null;
  }> {
    return apiRequest(`/marketplace/listings/${listingId}/sold`, {
      method: "POST",
      body: JSON.stringify(buyer_id ? { buyer_id } : {}),
    });
  },

  async linkSale(
    listingId: string,
    buyer_id: string,
  ): Promise<SaleTransaction> {
    return apiRequest<SaleTransaction>(
      `/marketplace/listings/${listingId}/sale`,
      {
        method: "POST",
        body: JSON.stringify({ buyer_id }),
      },
    );
  },

  // Sales & Purchases
  async getMySales(): Promise<SaleTransaction[]> {
    return apiRequest<SaleTransaction[]>("/marketplace/me/sales");
  },

  async getMyPurchases(): Promise<SaleTransaction[]> {
    return apiRequest<SaleTransaction[]>("/marketplace/me/purchases");
  },

  async respondSale(
    saleId: string,
    decision: "CONFIRM" | "REJECT",
    note?: string,
  ): Promise<SaleTransaction> {
    return apiRequest<SaleTransaction>(`/marketplace/sales/${saleId}/respond`, {
      method: "POST",
      body: JSON.stringify({ decision, note }),
    });
  },

  async rateSale(saleId: string, score: number): Promise<Rating> {
    return apiRequest<Rating>(`/marketplace/sales/${saleId}/rating`, {
      method: "POST",
      body: JSON.stringify({ score }),
    });
  },

  // Membership & Quota
  async getMembershipPlans(): Promise<MembershipPlan[]> {
    return apiRequest<MembershipPlan[]>("/marketplace/membership/plans");
  },

  async getQuota(): Promise<Quota> {
    return apiRequest<Quota>("/marketplace/me/quota");
  },

  async getBenefitRequests(): Promise<BenefitRequest[]> {
    return apiRequest<BenefitRequest[]>("/marketplace/me/benefit-requests");
  },

  async requestMembership(formData: FormData): Promise<BenefitRequest> {
    return apiRequest<BenefitRequest>("/marketplace/me/membership-requests", {
      method: "POST",
      body: formData,
    });
  },

  async requestAddon(formData: FormData): Promise<BenefitRequest> {
    return apiRequest<BenefitRequest>("/marketplace/me/addon-requests", {
      method: "POST",
      body: formData,
    });
  },

  // Reports
  async createReport(body: {
    target_type: "listing" | "user";
    target_id: string;
    reason: ReportReason;
    details?: string;
  }): Promise<Report> {
    return apiRequest<Report>("/marketplace/reports", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async getMyReports(): Promise<Report[]> {
    return apiRequest<Report[]>("/marketplace/me/reports");
  },

  // Admin endpoints
  async getAdminReports(status: "OPEN" | "RESOLVED" | "DISMISSED" = "OPEN"): Promise<Report[]> {
    return apiRequest<Report[]>(`/marketplace/admin/reports?status=${status}`);
  },

  async reviewAdminReport(
    reportId: string,
    action: "RESOLVED" | "DISMISSED",
    review_note: string,
  ): Promise<Report> {
    return apiRequest<Report>(`/marketplace/admin/reports/${reportId}/review`, {
      method: "POST",
      body: JSON.stringify({ action, review_note }),
    });
  },

  async moderateListing(
    listingId: string,
    action: "HIDE" | "RESTORE",
    reason: string,
  ): Promise<{ status: string }> {
    return apiRequest<{ status: string }>(
      `/marketplace/admin/listings/${listingId}/moderation`,
      {
        method: "POST",
        body: JSON.stringify({ action, reason }),
      },
    );
  },

  // ----------------------------------------------------
  // Forum Endpoints (OpenAPI v1)
  // ----------------------------------------------------
  async getForumCategories(): Promise<BackendForumCategory[]> {
    return apiRequest<BackendForumCategory[]>("/forum/categories");
  },

  async getForumPosts(params?: {
    page?: number;
    limit?: number;
    category?: string;
  }): Promise<BackendForumPostPage> {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    if (params?.category && params.category !== "Semua") {
      q.set("category", params.category);
    }
    const qs = q.toString();
    return apiRequest<BackendForumPostPage>(`/forum/posts${qs ? `?${qs}` : ""}`);
  },

  async createForumPost(body: {
    category_id: string;
    title: string;
    body: string;
    photo_ids?: string[];
  }): Promise<BackendForumPost> {
    return apiRequest<BackendForumPost>("/forum/posts", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async getForumPost(postId: string): Promise<BackendForumPost> {
    return apiRequest<BackendForumPost>(`/forum/posts/${postId}`);
  },

  async updateForumPost(
    postId: string,
    body: { category_id?: string; title?: string; body?: string },
  ): Promise<BackendForumPost> {
    return apiRequest<BackendForumPost>(`/forum/posts/${postId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  async deleteForumPost(postId: string): Promise<void> {
    return apiRequest<void>(`/forum/posts/${postId}`, {
      method: "DELETE",
    });
  },

  async getForumComments(
    postId: string,
    params?: { page?: number; limit?: number },
  ): Promise<BackendForumCommentPage> {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    const qs = q.toString();
    return apiRequest<BackendForumCommentPage>(
      `/forum/posts/${postId}/comments${qs ? `?${qs}` : ""}`,
    );
  },

  async addForumComment(
    postId: string,
    body: string,
  ): Promise<BackendForumComment> {
    return apiRequest<BackendForumComment>(`/forum/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ body }),
    });
  },

  async deleteForumComment(
    postId: string,
    commentId: string,
  ): Promise<void> {
    return apiRequest<void>(
      `/forum/posts/${postId}/comments/${commentId}`,
      {
        method: "DELETE",
      },
    );
  },

  async reportForumPost(
    postId: string,
    reason: ForumReportReason,
    details?: string,
  ): Promise<BackendForumReport> {
    return apiRequest<BackendForumReport>(`/forum/posts/${postId}/reports`, {
      method: "POST",
      body: JSON.stringify({ reason, details: details || undefined }),
    });
  },

  async getForumUploadSignature(): Promise<ForumUploadSignature> {
    return apiRequest<ForumUploadSignature>("/forum/media/upload-signatures", {
      method: "POST",
    });
  },

  async confirmForumUpload(asset_id: string): Promise<ForumMediaAsset> {
    return apiRequest<ForumMediaAsset>("/forum/media/confirm-upload", {
      method: "POST",
      body: JSON.stringify({ asset_id }),
    });
  },

  async uploadForumPhoto(file: File): Promise<ForumMediaAsset> {
    const sig = await this.getForumUploadSignature();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", sig.api_key);
    formData.append("timestamp", String(sig.timestamp));
    formData.append("signature", sig.signature);
    formData.append("public_id", sig.public_id);
    formData.append("folder", sig.folder);
    formData.append("upload_preset", sig.upload_preset);
    formData.append("overwrite", sig.overwrite);

    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${sig.cloud_name}/image/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!uploadRes.ok) {
      throw new ApiError(uploadRes.status, "UPLOAD_FAILED", "Gagal mengunggah foto ke Cloudinary.");
    }

    return this.confirmForumUpload(sig.asset_id);
  },
};
