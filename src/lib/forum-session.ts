import {
  appendForumComment,
  forumCategories,
  forumPosts,
  getForumThread,
  type ForumComment,
  type ForumPost,
} from "@/lib/forum-data";

export const FORUM_STORAGE_KEY = "aquaku-forum-v1";

/** Limits apply to trimmed text and to the first stored entries, not fixture data. */
export const FORUM_LIMITS = {
  posts: 50,
  replies: 500,
  titleMin: 8,
  titleMax: 120,
  bodyMin: 20,
  bodyMax: 5000,
  commentMin: 3,
  commentMax: 2000,
} as const;

export type LocalForumPost = ForumPost & { body: string };
export type LocalForumReply = {
  slug: string;
  parentId: string | null;
  // time is an ISO timestamp in the event; getSessionComments formats it for UI.
  comment: ForumComment;
};
export type ForumSessionData = {
  posts: LocalForumPost[];
  replies: LocalForumReply[];
};

const LOCAL_SLUG =
  /^local-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TIMESTAMP =
  /^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,3})?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/;

export function isLocalForumSlug(slug: string): boolean {
  return typeof slug === "string" && slug.length === 42 && LOCAL_SLUG.test(slug);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function trimmedText(value: unknown, min: number, max: number): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text.length >= min && text.length <= max ? text : null;
}

function timestamp(value: unknown): string | null {
  if (typeof value !== "string" || value !== value.trim() || !TIMESTAMP.test(value)) {
    return null;
  }
  const milliseconds = Date.parse(value);
  const day = Date.parse(`${value.slice(0, 10)}T00:00:00.000Z`);
  // Date.parse normalizes dates such as February 30; those are not valid input.
  if (
    !Number.isFinite(milliseconds) ||
    !Number.isFinite(day) ||
    new Date(day).toISOString().slice(0, 10) !== value.slice(0, 10)
  ) {
    return null;
  }
  return new Date(milliseconds).toISOString();
}

function displayTime(iso: string): string {
  return new Date(iso).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/** Rebuild display fields rather than trusting persisted identity, counts or images. */
export function normalizeLocalForumPost(value: unknown): LocalForumPost | null {
  if (!isRecord(value) || typeof value.slug !== "string") return null;
  if (!isLocalForumSlug(value.slug)) return null;
  const title = trimmedText(
    value.title,
    FORUM_LIMITS.titleMin,
    FORUM_LIMITS.titleMax,
  );
  const body = trimmedText(value.body, FORUM_LIMITS.bodyMin, FORUM_LIMITS.bodyMax);
  const category = forumCategories.find((item) => item === value.category);
  const publishedAt = timestamp(value.publishedAt);
  if (!title || !body || !category || !publishedAt) return null;

  return {
    slug: value.slug,
    title,
    body,
    category,
    publishedAt,
    author: "Kamu (demo)",
    initials: "KM",
    time: displayTime(publishedAt),
    excerpt: body.length > 170 ? `${body.slice(0, 170)}…` : body,
    location: "Semarang · demo lokal",
    comments: 0,
  };
}

export function normalizeForumCommentBody(value: unknown): string | null {
  return trimmedText(value, FORUM_LIMITS.commentMin, FORUM_LIMITS.commentMax);
}

function normalizeReply(value: unknown): LocalForumReply | null {
  if (
    !isRecord(value) ||
    typeof value.slug !== "string" ||
    (value.parentId !== null && typeof value.parentId !== "string") ||
    !isRecord(value.comment)
  ) {
    return null;
  }
  const { id } = value.comment;
  const body = normalizeForumCommentBody(value.comment.body);
  const time = timestamp(value.comment.time);
  if (typeof id !== "string" || !isLocalForumSlug(id) || !body || !time) {
    return null;
  }
  return {
    slug: value.slug,
    parentId: value.parentId,
    comment: {
      id,
      body,
      time,
      author: "Kamu (demo)",
      initials: "KM",
      isLocal: true,
      replies: [],
    },
  };
}

function commentIds(comments: ForumComment[]): Set<string> {
  const ids = new Set<string>();
  const pending = [...comments];
  while (pending.length > 0) {
    const comment = pending.pop()!;
    ids.add(comment.id);
    pending.push(...comment.replies);
  }
  return ids;
}

/**
 * Read the v1 schema defensively. Only post content and flat comment events count;
 * persisted display fields and nested comment trees are deliberately discarded.
 */
export function parseForumSession(raw: string | null): ForumSessionData {
  const data: ForumSessionData = { posts: [], replies: [] };
  if (raw === null) return data;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return data;
  }
  if (!isRecord(parsed)) return data;

  const slugs = new Set<string>();
  if (Array.isArray(parsed.posts)) {
    for (const value of parsed.posts.slice(0, FORUM_LIMITS.posts)) {
      const post = normalizeLocalForumPost(value);
      if (!post || slugs.has(post.slug)) continue;
      slugs.add(post.slug);
      data.posts.push(post);
    }
  }

  // Map/Set lookups never interpret user-supplied slugs as object property names.
  const threads = new Map<string, Set<string>>();
  const seenIds = new Set<string>();
  for (const post of forumPosts) {
    const ids = commentIds(getForumThread(post.slug)?.comments ?? []);
    threads.set(post.slug, ids);
    ids.forEach((id) => seenIds.add(id));
  }
  for (const post of data.posts) threads.set(post.slug, new Set());

  let pending: LocalForumReply[] = [];
  if (Array.isArray(parsed.replies)) {
    for (const value of parsed.replies.slice(0, FORUM_LIMITS.replies)) {
      const reply = normalizeReply(value);
      if (!reply || !threads.has(reply.slug) || seenIds.has(reply.comment.id)) {
        continue;
      }
      seenIds.add(reply.comment.id);
      pending.push(reply);
    }
  }

  // Resolve parents first even if stored events are out of order. Cycles and
  // orphan references never become attached and are discarded when progress stops.
  while (pending.length > 0) {
    const deferred: LocalForumReply[] = [];
    for (const reply of pending) {
      const ids = threads.get(reply.slug)!;
      if (reply.parentId !== null && !ids.has(reply.parentId)) {
        deferred.push(reply);
        continue;
      }
      ids.add(reply.comment.id);
      data.replies.push(reply);
    }
    if (deferred.length === pending.length) break;
    pending = deferred;
  }
  return data;
}

export function getSessionComments(
  data: ForumSessionData,
  slug: string,
): ForumComment[] {
  const thread = getForumThread(slug);
  if (!thread && !data.posts.some((post) => post.slug === slug)) return [];

  let comments = thread?.comments ?? [];
  const ids = commentIds(comments);
  for (const reply of data.replies) {
    if (
      reply.slug !== slug ||
      ids.has(reply.comment.id) ||
      (reply.parentId !== null && !ids.has(reply.parentId))
    ) {
      continue;
    }
    comments = appendForumComment(comments, reply.parentId, {
      ...reply.comment,
      time: displayTime(reply.comment.time),
      replies: [],
    });
    ids.add(reply.comment.id);
  }
  return comments;
}
