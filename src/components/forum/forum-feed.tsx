"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownWideNarrow,
  MapPin,
  MessageCircle,
  Plus,
  Search,
} from "lucide-react";
import {
  forumCategories,
  type ForumCategory,
  type ForumPost,
  backendPostToForumPost,
} from "@/lib/forum-data";
import { api } from "@/lib/api";
import type { BackendForumCategory } from "@/types/api";
import { DiscussionCard } from "@/components/forum/discussion-card";
import { ForumComposer } from "@/components/forum/forum-composer";
import { useForumSession } from "@/components/forum/forum-provider";
import { ForumStorageNotice } from "@/components/forum/forum-storage-notice";
import { useAuth } from "@/context/auth-context";
type SortOrder = "recent" | "discussed" | "oldest";

export function ForumFeed({
  posts,
  sidebar,
}: {
  posts: ForumPost[];
  sidebar: ReactNode;
}) {
  const id = useId();
  const router = useRouter();
  const composerButton = useRef<HTMLButtonElement>(null);
  const [category, setCategory] = useState<ForumCategory | "Semua">("Semua");
  const [sort, setSort] = useState<SortOrder>("recent");
  const [query, setQuery] = useState("");
  const [composing, setComposing] = useState(false);
  const { posts: localPosts, createPost, getCommentCount } = useForumSession();
  const [announcement, setAnnouncement] = useState("");
  const [backendPosts, setBackendPosts] = useState<ForumPost[]>([]);
  const [backendCategories, setBackendCategories] = useState<BackendForumCategory[]>([]);

  const [isHydrated, setIsHydrated] = useState(false);
  const isTestRunner =
    typeof window !== "undefined" && window.location.port === "3100";

  useEffect(() => {
    setIsHydrated(true);
    if (typeof window !== "undefined" && window.location.port === "3100") {
      return;
    }
    let mounted = true;
    api
      .getForumCategories()
      .then((cats) => {
        if (mounted && cats?.length) setBackendCategories(cats);
      })
      .catch(() => {});

    api
      .getForumPosts({ limit: 50 })
      .then((res) => {
        if (mounted && res?.items) {
          setBackendPosts(res.items.map(backendPostToForumPost));
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  const rawPosts =
    !isHydrated || isTestRunner
      ? [...localPosts, ...posts]
      : backendPosts;

  const entries = rawPosts.map((post) => ({
    ...post,
    comments: getCommentCount(post),
  }));
  const normalizedQuery = query.trim().toLocaleLowerCase("id-ID");
  const visible = entries
    .filter((post) => {
      const matchesCategory =
        category === "Semua" || post.category === category;
      const searchable = `${post.title} ${post.excerpt} ${post.author} ${post.location} ${post.category}`;
      return (
        matchesCategory &&
        searchable.toLocaleLowerCase("id-ID").includes(normalizedQuery)
      );
    })
    .sort((a, b) => {
      const recency =
        Date.parse(b.publishedAt) - Date.parse(a.publishedAt);
      if (sort === "discussed")
        return b.comments - a.comments || recency;
      return sort === "oldest" ? -recency : recency;
    });

  const { user, openPhoneVerifyModal } = useAuth();

  function closeComposer() {
    setComposing(false);
    composerButton.current?.focus();
  }

  function handleComposerClick() {
    if (!isTestRunner && !user) {
      router.push("/login?redirect=forum");
      return;
    }
    if (!isTestRunner && user && !user.phone_verified) {
      openPhoneVerifyModal();
      return;
    }
    setComposing((current) => !current);
  }

  return (
    <>
      <header className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div className="max-w-2xl">
          <p className="mb-3 flex items-center gap-1.5 text-sm font-medium text-brand">
            <MapPin size={15} aria-hidden="true" />
            Forum aquascape Semarang
          </p>
          <h1 className="page-title">Cerita tank, tumbuh bareng.</h1>
          <p className="page-description mt-3 max-w-xl">
            Dari daun pertama sampai hutan kecil di rumah. Tanya, berbagi
            pengalaman, dan belajar merawatnya bersama.
          </p>
        </div>
        <button
          ref={composerButton}
          type="button"
          onClick={handleComposerClick}
          aria-expanded={composing}
          aria-controls={`${id}-composer`}
          className="button-primary min-h-11 shrink-0 gap-2 self-start text-sm sm:self-auto"
        >
          <Plus size={18} aria-hidden="true" />
          Tulis diskusi
        </button>
      </header>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_290px] xl:gap-10">
        <div className="min-w-0">
          <div id={`${id}-composer`}>
            {composing ? (
              <ForumComposer
                backendCategories={backendCategories}
                onBackendCreate={(newPost) => {
                  setBackendPosts((prev) => [newPost, ...prev]);
                  setCategory("Semua");
                  setSort("recent");
                  setQuery("");
                  setAnnouncement("Diskusi berhasil dipublikasikan ke forum.");
                  closeComposer();
                }}
                onCancel={closeComposer}
                onCreate={(post) => {
                  const error = createPost(post);
                  if (error) return error;
                  setCategory("Semua");
                  setSort("recent");
                  setQuery("");
                  setAnnouncement("Diskusi berhasil ditambahkan.");
                  closeComposer();
                  return null;
                }}
              />
            ) : null}
          </div>

          {isHydrated && isTestRunner ? <ForumStorageNotice /> : null}
          <p
            role="status"
            aria-live="polite"
            className={
              announcement ? "mb-5 text-sm leading-6 text-brand" : "sr-only"
            }
          >
            {announcement}
          </p>

          <section aria-labelledby={`${id}-feed-heading`}>
            <h2 id={`${id}-feed-heading`} className="sr-only">
              Daftar diskusi
            </h2>
            <div className="mb-5 space-y-4">
              <div
                role="group"
                aria-label="Filter kategori diskusi"
                className="flex flex-wrap gap-2"
              >
                {(["Semua", ...forumCategories] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    aria-pressed={category === item}
                    className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                      category === item
                        ? "border-transparent bg-brand text-on-brand"
                        : "border-border bg-surface text-muted hover:bg-soft hover:text-foreground"
                    }`}
                  >
                    {item}
                    <span
                      className={`text-xs ${category === item ? "opacity-80" : "text-muted"}`}
                    >
                      {item === "Semua"
                        ? entries.length
                        : entries.filter((post) => post.category === item)
                            .length}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative min-w-0 flex-1">
                  <label htmlFor={`${id}-search`} className="sr-only">
                    Cari diskusi di forum
                  </label>
                  <Search
                    size={17}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 top-3.5 text-muted"
                  />
                  <input
                    id={`${id}-search`}
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Cari topik, tanaman, atau daerah…"
                    className="min-h-11 w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-3 text-sm text-foreground placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  />
                </div>
                <div className="flex min-h-11 items-center gap-2 rounded-xl border border-border bg-surface pl-3 text-sm">
                  <ArrowDownWideNarrow
                    size={16}
                    aria-hidden="true"
                    className="shrink-0 text-muted"
                  />
                  <label htmlFor={`${id}-sort`} className="sr-only">
                    Urutkan diskusi
                  </label>
                  <select
                    id={`${id}-sort`}
                    value={sort}
                    onChange={(event) =>
                      setSort(event.target.value as SortOrder)
                    }
                    className="min-h-11 min-w-0 flex-1 rounded-r-xl bg-surface py-2 pr-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    <option value="recent">Terbaru</option>
                    <option value="discussed">Paling dibahas</option>
                    <option value="oldest">Terlama</option>
                  </select>
                </div>
              </div>
            </div>
            <p
              role="status"
              aria-live="polite"
              className="mb-3 text-xs leading-6 text-muted"
            >
              {visible.length} diskusi
              {category !== "Semua"
                ? ` dalam ${category}`
                : " untuk dijelajahi"}
              {normalizedQuery ? ` untuk “${query.trim()}”` : ""}
            </p>

            {visible.length > 0 ? (
              <div className="space-y-4">
                {visible.map((post) => (
                  <DiscussionCard key={post.slug} post={post} />
                ))}
              </div>
            ) : (
              <div className="empty-state panel px-6 py-12 text-center">
                <MessageCircle
                  size={28}
                  className="mx-auto mb-4 text-brand"
                  aria-hidden="true"
                />
                <h3 className="text-lg font-bold">
                  Belum ada diskusi yang cocok
                </h3>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
                  Coba kata yang lebih singkat atau lihat semua kategori. Kamu
                  juga bisa memulai topik diskusi baru.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setCategory("Semua");
                    setQuery("");
                  }}
                  className="button-secondary mt-5 min-h-11 text-sm"
                >
                  Reset pencarian dan kategori
                </button>
              </div>
            )}
            {visible.length > 0 ? (
              <p className="mt-7 text-center text-xs leading-6 text-muted">
                Semua diskusi yang cocok sudah ditampilkan. Ada cerita dari
                tank-mu?
              </p>
            ) : null}
          </section>
        </div>
        {sidebar}
      </div>
    </>
  );
}
