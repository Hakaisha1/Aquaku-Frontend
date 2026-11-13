"use client";

import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { useForumSession } from "./forum-provider";
import { CommentThread } from "./comment-thread";

export function LocalForumThread({ slug }: { slug: string }) {
  const { posts, ready } = useForumSession();
  const post = posts.find((item) => item.slug === slug);

  return (
    <div className="mx-auto w-full max-w-[900px]">
      <Link
        href="/forum"
        className="mb-5 inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold text-muted hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <ArrowLeft size={17} aria-hidden="true" />
        Semua diskusi
      </Link>

      {!ready ? (
        <section className="panel p-5 sm:p-7" aria-busy="true">
          <h1 className="page-title">Memuat diskusi lokal…</h1>
          <p role="status" className="page-description">
            Memeriksa diskusi yang tersimpan di browser ini.
          </p>
        </section>
      ) : !post ? (
        <section className="panel p-5 sm:p-7">
          <h1 className="page-title">Diskusi lokal tidak ditemukan.</h1>
          <p className="page-description">
            Tautan ini hanya bisa dibuka di browser yang menyimpan diskusinya.
            Data mungkin sudah dihapus atau penyimpanan browser tidak tersedia.
            Diskusi demo tidak disimpan di server.
          </p>
          <Link href="/forum" className="button-primary mt-5">
            Kembali ke forum
          </Link>
        </section>
      ) : (
        <div className="space-y-6">
          <article className="panel min-w-0 p-5 sm:p-7">
            <div className="mb-5 flex flex-wrap items-center gap-2 text-xs font-medium">
              <span className="rounded-full bg-soft px-3 py-1.5 text-brand">
                {post.category}
              </span>
              <span className="text-muted">Diskusi lokal · Tidak dipublikasikan</span>
            </div>
            <h1 className="wrap-anywhere text-2xl font-extrabold leading-tight tracking-[-0.035em] text-foreground sm:text-3xl">
              {post.title}
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted">
              <span
                aria-hidden="true"
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-soft text-xs font-bold text-brand"
              >
                {post.initials}
              </span>
              <span className="font-semibold text-foreground">{post.author}</span>
              <time dateTime={post.publishedAt}>{post.time}</time>
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={13} aria-hidden="true" />
                {post.location}
              </span>
            </div>
            <p className="mt-6 max-w-prose whitespace-pre-wrap wrap-anywhere text-[15px] leading-8 text-foreground">
              {post.body}
            </p>
            <p className="mt-7 border-t border-border pt-4 text-xs leading-6 text-muted">
              Ini tautan lokal, bukan tautan publik untuk dibagikan. Orang lain
              tidak dapat membaca diskusi ini dari perangkat mereka.
            </p>
          </article>
          <CommentThread key={slug} slug={slug} postAuthor={post.author} />
        </div>
      )}
    </div>
  );
}
