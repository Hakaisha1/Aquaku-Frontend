"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, MessageCircle } from "lucide-react";
import type { ForumPost } from "@/lib/forum-data";
import { isLocalForumSlug } from "@/lib/forum-session";
import { useForumSession } from "./forum-provider";

export function DiscussionCard({
  post,
  compact = false,
}: {
  post: ForumPost;
  compact?: boolean;
}) {
  const showcase = post.category === "Pamer tank";
  const { getCommentCount } = useForumSession();
  const comments = getCommentCount(post);

  return (
    <article className="panel min-w-0 overflow-hidden p-5 sm:p-6">
      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted">
        <span className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden="true"
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-soft text-[11px] font-bold text-brand"
          >
            {post.initials}
          </span>
          <span className="font-medium text-foreground">{post.author}</span>
        </span>
        <span>{post.time}</span>
        <span className="rounded-full bg-soft px-2.5 py-1 font-medium text-brand sm:ml-auto">
          {post.category}
        </span>
      </div>

      <Link
        href={`/forum/${post.slug}`}
        className={`group block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand ${
          !compact && post.image && !showcase
            ? "sm:grid sm:grid-cols-[minmax(0,1fr)_136px] sm:gap-5"
            : ""
        }`}
      >
        <div className="min-w-0">
          <h3
            className={`font-bold leading-snug tracking-[-0.025em] text-foreground group-hover:text-brand ${
              compact ? "text-base wrap-anywhere" : "text-lg wrap-anywhere sm:text-xl"
            }`}
          >
            {post.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted wrap-anywhere">
            {post.excerpt}
          </p>
        </div>
        {!compact && post.image ? (
          <div
            className={`relative mt-4 overflow-hidden rounded-xl bg-soft ${
              showcase
                ? "aspect-[2/1] w-full"
                : "aspect-[2/1] sm:mt-0 sm:aspect-[4/3] sm:self-center"
            }`}
          >
            <Image
              src={post.image}
              alt={
                post.imageAlt ?? "Ilustrasi tank aquascape untuk diskusi demo"
              }
              fill
              sizes={
                showcase
                  ? "(max-width: 1023px) 90vw, 760px"
                  : "(max-width: 639px) 90vw, 136px"
              }
              className="object-cover"
            />
          </div>
        ) : null}
      </Link>

      {isLocalForumSlug(post.slug) ? (
        <p className="mt-3 text-xs leading-5 text-brand">
          Diskusi lokal · Hanya tersedia di browser ini
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs text-muted">
        <Link
          href={`/forum/${post.slug}#comments`}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg font-semibold text-foreground hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          aria-label={`${comments} komentar: ${post.title}`}
        >
          <MessageCircle size={16} aria-hidden="true" />
          {comments} komentar
        </Link>
        {!compact ? (
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={13} aria-hidden="true" />
            {post.location}
          </span>
        ) : null}
      </div>
    </article>
  );
}
