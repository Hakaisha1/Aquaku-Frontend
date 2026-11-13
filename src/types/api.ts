export type UserTier = "personal" | "toko" | "juragan";
export type UserRole = "member" | "admin";

export type UserProfile = {
  id: string;
  email: string;
  display_name: string;
  phone_number?: string | null;
  avatar_url: string | null;
  phone_verified: boolean;
  tier: UserTier;
  tier_expires_at: string | null;
  verified_store: boolean;
  role: UserRole;
  created_at: string;
};

export type PublicProfile = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  tier: UserTier;
  verified_store: boolean;
  created_at: string;
  rating_average: number | null;
  rating_count: number;
  active_listing_count: number;
};

export type TokenPair = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: UserProfile;
};

export type ListingCondition = "BNIB" | "NEW" | "LIKE_NEW" | "SECOND";
export type ListingStatus = "active" | "sold" | "expired" | "inactive";

export type Category = {
  id: string;
  slug: string;
  name: string;
};

export type TaxonomyTag = {
  id: string;
  slug: string;
  name: string;
  minimum_tier: UserTier;
};

export type Taxonomy = {
  categories: Category[];
  tags: TaxonomyTag[];
};

export type Region = {
  code: string;
  district_code: string;
  district: string;
  kelurahan: string;
};

export type ListingPhoto = {
  id: string;
  url: string;
  order: number;
};

export type ListingSeller = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  tier: UserTier;
  verified_store: boolean;
  rating_average: number | null;
  rating_count: number;
};

export type Listing = {
  id: string;
  category_id: string;
  region_code: string;
  title: string;
  description: string;
  price: number;
  condition: ListingCondition;
  photos: ListingPhoto[];
  seller: ListingSeller;
  status: ListingStatus;
  moderation_hidden_at: string | null;
  moderation_reason: string | null;
  created_at: string;
  expires_at: string;
  sold_at: string | null;
  category?: Category;
  region?: Region;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type ListingPage = {
  items: Listing[];
  pagination: Pagination;
};

export type Quota = {
  tier: UserTier;
  active_listings: number;
  base_quota: number;
  inactive_listings: number;
  addon_slots: number;
  total_quota: number;
  available_slots: number;
  available_cooldown_passes: number;
  cooldown_until: string | null;
  may_list: boolean;
  may_list_with_cooldown_pass: boolean;
};

export type SaleStatus =
  | "awaiting_confirmation"
  | "confirmed"
  | "rejected"
  | "cancelled";

export type Rating = {
  id: string;
  score: number;
  created_at: string;
};

export type SaleTransaction = {
  id: string;
  listing: {
    id: string;
    title: string;
    price: number;
  };
  seller: {
    id: string;
    display_name: string;
  };
  buyer: {
    id: string;
    display_name: string;
  };
  status: SaleStatus;
  response_note: string | null;
  responded_at: string | null;
  rating: Rating | null;
  created_at: string;
};

export type MembershipPlan = {
  tier: "toko" | "juragan";
  price: number;
  period_days: number;
  base_quota: number;
  listing_days: number;
  features: {
    may_sell_new_condition: boolean;
    cooldown: boolean;
  };
};

export type BenefitKind =
  | "membership"
  | "slot_addon"
  | "cooldown_bypass"
  | "shop_verification";

export type BenefitStatus = "pending" | "approved" | "rejected";

export type BenefitRequest = {
  id: string;
  kind: BenefitKind;
  status: BenefitStatus;
  requested_tier: "toko" | "juragan" | null;
  requested_slots: number | null;
  approved_slots: number | null;
  payment_amount: number | null;
  proof_available: boolean;
  proof_mime_type: "image/jpeg" | "image/png" | "application/pdf" | null;
  review_note: string | null;
  reviewed_at: string | null;
  entitlement_starts_at: string | null;
  entitlement_expires_at: string | null;
  created_at: string;
};

export type ReportReason =
  | "SPAM"
  | "SCAM"
  | "PROHIBITED_ITEM"
  | "MISLEADING"
  | "HARASSMENT"
  | "OTHER";

export type ReportStatus = "OPEN" | "RESOLVED" | "DISMISSED";

export type Report = {
  id: string;
  reporter_id: string;
  target_type: "listing" | "user";
  target_id: string;
  reason: ReportReason;
  details: string | null;
  status: ReportStatus;
  review_note: string | null;
  reviewed_at: string | null;
  created_at: string;
};

// Forum Types
export type BackendForumCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
};

export type BackendForumAuthor = {
  id: string;
  display_name: string;
  avatar_url: string | null;
} | null;

export type BackendForumPhoto = {
  id: string;
  url: string;
};

export type BackendForumPost = {
  id: string;
  title: string;
  body: string;
  status: "published" | "hidden" | "deleted";
  category: BackendForumCategory | null;
  author: BackendForumAuthor;
  photos: BackendForumPhoto[];
  comments_count: number;
  reports_count: number;
  moderation_reason: string | null;
  created_at: string;
  updated_at: string;
};

export type BackendForumPostPage = {
  items: BackendForumPost[];
  pagination: Pagination;
};

export type BackendForumComment = {
  id: string;
  post_id: string;
  body: string;
  author: BackendForumAuthor;
  created_at: string;
  updated_at: string;
};

export type BackendForumCommentPage = {
  items: BackendForumComment[];
  pagination: Pagination;
};

export type ForumReportReason =
  | "spam"
  | "harassment"
  | "inappropriate"
  | "misinformation"
  | "other";

export type BackendForumReport = {
  id: string;
  post_id: string;
  reporter_id: string;
  reason: ForumReportReason;
  details: string;
  status: "open" | "resolved" | "dismissed";
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_note: string | null;
  created_at: string;
};

export type ForumUploadSignature = {
  asset_id: string;
  cloud_name: string;
  api_key: string;
  timestamp: number;
  public_id: string;
  asset_folder: string;
  allowed_formats: string;
  upload_preset: string;
  overwrite: string;
  signature: string;
};

export type ForumMediaAsset = {
  id: string;
  url: string | null;
  format: string | null;
  bytes: number | null;
  uploaded_at: string | null;
};

export type MarketplaceUploadSignature = {
  asset_id: string;
  cloud_name: string;
  api_key: string;
  timestamp: number;
  public_id: string;
  asset_folder: string;
  allowed_formats: string;
  upload_preset: string;
  overwrite: string;
  signature: string;
};

export type MarketplaceMediaAsset = {
  id: string;
  url?: string | null;
  format?: string | null;
  bytes?: number | null;
  uploaded_at?: string | null;
};

export type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
  };
};
