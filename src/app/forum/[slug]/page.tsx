import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Droplets,
  MapPin,
  NotebookText,
} from "lucide-react";
import { CommentThread } from "@/components/forum/comment-thread";
import { LocalForumThread } from "@/components/forum/local-forum-thread";
import { BackendForumThread } from "@/components/forum/backend-forum-thread";
import { ForumCommentCount } from "@/components/forum/forum-comment-count";
import { isLocalForumSlug } from "@/lib/forum-session";
import { forumPosts, getForumPost, getForumThread } from "@/lib/forum-data";

type ThreadPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return forumPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: ThreadPageProps): Promise<Metadata> {
  const { slug } = await params;
  if (isLocalForumSlug(slug)) {
    return {
      title: "Diskusi lokal | Forum Aquaku",
      description: "Diskusi demo yang hanya tersimpan di browser pembuatnya, bukan diskusi publik.",
      robots: { index: false, follow: false },
    };
  }
  if (/^[a-fA-F0-9]{24}$/.test(slug)) {
    return {
      title: "Diskusi Komunitas | Forum Aquaku",
      description: "Diskusi seputar aquascape di Forum Aquaku Semarang.",
    };
  }
  const post = getForumPost(slug);
  if (!post) notFound();
  return { title: `${post.title} | Forum Aquaku`, description: post.excerpt };
}

export default async function ForumThreadPage({ params }: ThreadPageProps) {
  const { slug } = await params;
  if (isLocalForumSlug(slug)) return <LocalForumThread slug={slug} />;
  if (/^[a-fA-F0-9]{24}$/.test(slug)) return <BackendForumThread postId={slug} />;
  const post = getForumPost(slug);
  const thread = getForumThread(slug);
  if (!post || !thread) notFound();

  const related = forumPosts
    .filter((item) => item.slug !== slug)
    .sort(
      (a, b) =>
        Number(b.category === post.category) -
        Number(a.category === post.category),
    )
    .slice(0, 3);

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <Link
        href="/forum"
        className="mb-5 inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold text-muted hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <ArrowLeft size={17} aria-hidden="true" />
        Semua diskusi
      </Link>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_290px] xl:gap-10">
        <div className="min-w-0 space-y-6">
          <article className="panel overflow-hidden p-5 sm:p-7">
            <div className="mb-5 flex flex-wrap items-center gap-2 text-xs font-medium">
              <span className="rounded-full bg-soft px-3 py-1.5 text-brand">
                {post.category}
              </span>
              <span className="text-muted">Diskusi contoh</span>
            </div>
            <h1 className="text-2xl font-extrabold leading-tight tracking-[-0.035em] text-foreground sm:text-3xl lg:text-[2.15rem]">
              {post.title}
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted">
              <span
                aria-hidden="true"
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-soft text-xs font-bold text-brand"
              >
                {post.initials}
              </span>
              <span className="font-semibold text-foreground">
                {post.author}
              </span>
              <time dateTime={post.publishedAt}>{post.time}</time>
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={13} aria-hidden="true" />
                {post.location}
              </span>
            </div>

            {post.image ? (
              <figure className="mt-6">
                <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-soft">
                  <Image
                    src={post.image}
                    alt={
                      post.imageAlt ??
                      "Ilustrasi tank aquascape untuk diskusi demo"
                    }
                    fill
                    sizes="(max-width: 1023px) 90vw, 760px"
                    loading="eager"
                    className="object-cover"
                  />
                </div>
                <figcaption className="mt-2 text-xs leading-5 text-muted">
                  Foto ilustrasi untuk diskusi demo, bukan dokumentasi tank
                  anggota.
                </figcaption>
              </figure>
            ) : null}

            <div className="mt-6 max-w-prose space-y-5 text-[15px] leading-8 text-foreground">
              {thread.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <div className="mt-7 border-t border-border pt-4 text-xs leading-6 text-muted">
              Seluruh profil dan percakapan di sini adalah contoh. Kamu bisa
              mencoba komentar lokal di bawah tanpa masuk atau membuat akun.
            </div>
          </article>

          <CommentThread
            key={post.slug}
            slug={post.slug}
            postAuthor={post.author}
          />
        </div>

        <aside aria-label="Konteks diskusi" className="space-y-6">
          <section className="panel p-5">
            <h2 className="flex items-center gap-2 text-sm font-bold">
              <NotebookText
                size={17}
                className="text-brand"
                aria-hidden="true"
              />
              Catatan tank
            </h2>
            <dl className="mt-4 space-y-4">
              {thread.tank.map((item) => (
                <div key={item.label}>
                  <dt className="text-xs text-muted">{item.label}</dt>
                  <dd className="mt-1 text-sm font-semibold leading-6">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
          <section className="panel p-5">
            <h2 className="flex items-center gap-2 text-sm font-bold">
              <Droplets size={17} className="text-brand" aria-hidden="true" />
              Catatan air
            </h2>
            <dl className="mt-4 grid grid-cols-2 gap-2.5">
              {thread.waterParameters.map((item) => (
                <div key={item.label} className="rounded-xl bg-soft p-3">
                  <dt className="text-xs text-muted">{item.label}</dt>
                  <dd className="mt-1.5 text-base font-bold tracking-tight">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-xs leading-6 text-muted">
              Data contoh dari penulis, bukan target universal. Kebutuhan setiap
              tanaman dan fauna bisa berbeda.
            </p>
          </section>
          <section className="px-1">
            <h2 className="text-sm font-bold">Obrolan lainnya</h2>
            <ul className="mt-2 divide-y divide-border">
              {related.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/forum/${item.slug}`}
                    className="group flex items-start gap-3 rounded-lg py-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    <div>
                      <p className="text-xs text-muted">{item.category}</p>
                      <h3 className="mt-1.5 text-sm font-semibold leading-6 group-hover:text-brand">
                        {item.title}
                      </h3>
                      <p className="mt-1.5 text-xs text-muted">
                        <ForumCommentCount post={item} />
                      </p>
                    </div>
                    <ArrowUpRight
                      size={15}
                      className="mt-1 shrink-0 text-muted group-hover:text-brand"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
