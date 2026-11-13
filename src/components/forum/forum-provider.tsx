"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  countForumComments,
  getForumThread,
  type ForumComment,
  type ForumPost,
} from "@/lib/forum-data";
import {
  FORUM_LIMITS,
  FORUM_STORAGE_KEY,
  getSessionComments,
  isLocalForumSlug,
  normalizeForumCommentBody,
  normalizeLocalForumPost,
  parseForumSession,
  type ForumSessionData,
  type LocalForumPost,
} from "@/lib/forum-session";

type Snapshot = ForumSessionData & { ready: boolean; persistent: boolean };
type ForumSession = {
  posts: LocalForumPost[];
  ready: boolean;
  persistent: boolean;
  createPost: (post: LocalForumPost) => string | null;
  addComment: (slug: string, parentId: string | null, body: string) => string | null;
  getComments: (slug: string) => ForumComment[];
  getCommentCount: (post: ForumPost) => number;
};

const SERVER_SNAPSHOT: Snapshot = {
  posts: [],
  replies: [],
  ready: false,
  persistent: false,
};
const getServerSnapshot = () => SERVER_SNAPSHOT;
const ForumContext = createContext<ForumSession | null>(null);

function containsComment(comments: ForumComment[], id: string): boolean {
  const pending = [...comments];
  while (pending.length > 0) {
    const comment = pending.pop()!;
    if (comment.id === id) return true;
    pending.push(...comment.replies);
  }
  return false;
}

function serializeSession(data: ForumSessionData): string {
  return JSON.stringify({
    posts: data.posts.map(({ slug, title, body, category, publishedAt }) => ({
      slug,
      title,
      body,
      category,
      publishedAt,
    })),
    replies: data.replies.map(({ slug, parentId, comment }) => ({
      slug,
      parentId,
      comment: { id: comment.id, body: comment.body, time: comment.time },
    })),
  });
}

function createForumStore() {
  let snapshot = SERVER_SNAPSHOT;
  const listeners = new Set<() => void>();

  function readSnapshot(): Snapshot {
    try {
      return {
        ...parseForumSession(window.localStorage.getItem(FORUM_STORAGE_KEY)),
        ready: true,
        persistent: true,
      };
    } catch {
      // A failed read must not replace an already usable in-memory session.
      return { ...snapshot, ready: true, persistent: false };
    }
  }

  function getSnapshot(): Snapshot {
    if (typeof window === "undefined") return SERVER_SNAPSHOT;
    if (!snapshot.ready) snapshot = readSnapshot();
    return snapshot;
  }

  function publish(next: Snapshot) {
    snapshot = next;
    listeners.forEach((listener) => listener());
  }

  function commit(data: ForumSessionData) {
    let persistent = false;
    try {
      window.localStorage.setItem(FORUM_STORAGE_KEY, serializeSession(data));
      persistent = true;
    } catch {
      // Quota/security errors affect persistence, not the success of a local action.
    }
    publish({ ...data, ready: true, persistent });
  }

  function onStorage(event: StorageEvent) {
    if (event.key !== FORUM_STORAGE_KEY && event.key !== null) return;
    try {
      if (event.storageArea && event.storageArea !== window.localStorage) return;
    } catch {
      publish({ ...snapshot, ready: true, persistent: false });
      return;
    }
    // Read the current value, not a possibly superseded queued event.newValue.
    publish(readSnapshot());
  }

  return {
    getSnapshot,
    subscribe(listener: () => void) {
      listeners.add(listener);
      if (listeners.size === 1) {
        window.addEventListener("storage", onStorage);
        // Catch changes while unsubscribed, but never reload stale storage over
        // a session whose last read/write failed and is now memory-only.
        if (snapshot.ready && snapshot.persistent) publish(readSnapshot());
      }
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) window.removeEventListener("storage", onStorage);
      };
    },
    createPost(post: LocalForumPost): string | null {
      const current = getSnapshot();
      if (!current.ready) return "Forum belum siap. Coba lagi sebentar.";
      const normalized = normalizeLocalForumPost(post);
      if (!normalized) {
        return "Diskusi tidak valid. Gunakan judul 8–120 karakter, cerita 20–5.000 karakter, kategori yang tersedia, serta ID dan waktu yang valid.";
      }
      if (current.posts.some((item) => item.slug === normalized.slug)) {
        return "Diskusi ini sudah ditambahkan.";
      }
      if (current.posts.length >= FORUM_LIMITS.posts) {
        return "Batas 50 diskusi lokal tercapai.";
      }
      // Actions use the store's current snapshot, not a previous React render.
      commit({ posts: [normalized, ...current.posts], replies: current.replies });
      return null;
    },
    addComment(slug: string, parentId: string | null, body: string): string | null {
      const current = getSnapshot();
      if (!current.ready) return "Forum belum siap. Coba lagi sebentar.";
      const text = normalizeForumCommentBody(body);
      if (!text) return "Komentar perlu 3–2.000 karakter, bukan hanya spasi.";
      if (
        typeof slug !== "string" ||
        (!getForumThread(slug) && !current.posts.some((post) => post.slug === slug))
      ) {
        return "Diskusi tidak ditemukan. Diskusi lokal mungkin sudah dihapus.";
      }
      if (
        parentId !== null &&
        (typeof parentId !== "string" ||
          !containsComment(getSessionComments(current, slug), parentId))
      ) {
        return "Komentar yang ingin dibalas tidak ditemukan.";
      }
      if (current.replies.length >= FORUM_LIMITS.replies) {
        return "Batas 500 komentar lokal tercapai.";
      }
      let id: string;
      try {
        id = `local-${window.crypto.randomUUID()}`;
      } catch {
        return "Browser tidak dapat membuat ID komentar. Coba gunakan browser terbaru melalui HTTPS atau localhost.";
      }
      if (
        !isLocalForumSlug(id) ||
        current.replies.some((reply) => reply.comment.id === id)
      ) {
        return "ID komentar tidak valid atau sudah digunakan. Silakan coba lagi.";
      }
      commit({
        posts: current.posts,
        replies: [
          ...current.replies,
          {
            slug,
            parentId,
            comment: {
              id,
              body: text,
              time: new Date().toISOString(),
              author: "Kamu (demo)",
              initials: "KM",
              isLocal: true,
              replies: [],
            },
          },
        ],
      });
      return null;
    },
  };
}

export function ForumProvider({ children }: { children: ReactNode }) {
  // Every mounted provider owns its store; no mutable session crosses SSR requests.
  const [store] = useState(createForumStore);
  const snapshot = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    getServerSnapshot,
  );
  const value = useMemo<ForumSession>(
    () => ({
      posts: snapshot.posts,
      ready: snapshot.ready,
      persistent: snapshot.persistent,
      createPost: store.createPost,
      addComment: store.addComment,
      // Render selectors must use the React snapshot too, including during hydration.
      getComments: (slug) => getSessionComments(snapshot, slug),
      getCommentCount: (post) => {
        const fixtureCount = countForumComments(
          getForumThread(post.slug)?.comments ?? [],
        );
        return snapshot.replies.reduce(
          (total, reply) => total + (reply.slug === post.slug ? 1 : 0),
          fixtureCount,
        );
      },
    }),
    [snapshot, store],
  );

  return <ForumContext.Provider value={value}>{children}</ForumContext.Provider>;
}

export function useForumSession(): ForumSession {
  const session = useContext(ForumContext);
  if (!session) {
    throw new Error("useForumSession harus digunakan di dalam ForumProvider.");
  }
  return session;
}
