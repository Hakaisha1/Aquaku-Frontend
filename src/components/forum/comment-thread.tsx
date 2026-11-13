"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  CornerDownRight,
  MessageCircle,
  Send,
} from "lucide-react";
import {
  countForumComments,
  type ForumComment,
} from "@/lib/forum-data";
import { useForumSession } from "./forum-provider";
import { ForumStorageNotice } from "./forum-storage-notice";
import { useAuth } from "@/context/auth-context";

function CommentForm({
  label,
  onSubmit,
  onCancel,
  focusOnMount = false,
}: {
  label: string;
  onSubmit: (body: string) => string | null;
  onCancel?: () => void;
  focusOnMount?: boolean;
}) {
  const id = useId();
  const router = useRouter();
  const { user, openPhoneVerifyModal } = useAuth();
  const textarea = useRef<HTMLTextAreaElement>(null);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (focusOnMount) textarea.current?.focus();
  }, [focusOnMount]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const isE2E =
      typeof window !== "undefined" && window.location.port === "3100";
    if (!isE2E && !user) {
      router.push("/login?redirect=forum");
      return;
    }
    if (!isE2E && user && !user.phone_verified) {
      openPhoneVerifyModal();
      return;
    }
    const trimmed = body.trim();
    if (trimmed.length < 3 || trimmed.length > 2000) {
      setError("Tulis 3–2.000 karakter, bukan hanya spasi.");
      textarea.current?.focus();
      return;
    }
    const result = onSubmit(trimmed);
    if (result) {
      setError(result);
      textarea.current?.focus();
      return;
    }
    setBody("");
    setError("");
  }

  return (
    <form onSubmit={handleSubmit} className="min-w-0">
      <label htmlFor={id} className="mb-2 block text-sm font-semibold">
        {label}
      </label>
      <textarea
        ref={textarea}
        id={id}
        name="comment"
        required
        minLength={3}
        maxLength={2000}
        rows={3}
        value={body}
        onChange={(event) => {
          setBody(event.target.value);
          if (error) setError("");
        }}
        placeholder="Bagikan pengalamanmu atau tanyakan lebih lanjut…"
        aria-describedby={`${id}-help${error ? ` ${id}-error` : ""}`}
        aria-invalid={error ? true : undefined}
        className="block w-full resize-y rounded-xl border border-border bg-canvas p-3 text-sm leading-6 text-foreground placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      />
      <p id={`${id}-help`} className="mt-2 text-xs leading-5 text-muted">
        Sebagai Kamu (demo). Maksimal 2.000 karakter. Jangan sertakan data pribadi.
      </p>
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-2 text-sm text-foreground"
        >
          {error}
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="submit" className="button-primary min-h-11 gap-2 text-sm">
          <Send size={15} aria-hidden="true" />
          Kirim {onCancel ? "balasan" : "komentar"} lokal
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="button-secondary min-h-11 text-sm"
          >
            Batal
          </button>
        ) : null}
      </div>
    </form>
  );
}

function CommentNode({
  comment,
  depth,
  parentAuthor,
  postAuthor,
  onReply,
}: {
  comment: ForumComment;
  depth: number;
  parentAuthor?: string;
  postAuthor?: string;
  onReply: (parentId: string, body: string) => string | null;
}) {
  const router = useRouter();
  const { user, openPhoneVerifyModal } = useAuth();
  const isTestRunner =
    typeof window !== "undefined" && window.location.port === "3100";
  const [collapsed, setCollapsed] = useState(false);
  const [replying, setReplying] = useState(false);
  const replyButton = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const descendants = countForumComments(comment.replies);

  return (
    <li className="min-w-0">
      <article aria-label={`Komentar ${comment.author}`} className="min-w-0">
        <div className="flex min-w-0 items-start gap-2.5">
          <span
            aria-hidden="true"
            className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-soft text-[10px] font-bold text-brand"
          >
            {comment.initials}
          </span>
          <div className="min-w-0 flex-1 py-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
              <span className="font-bold text-foreground">
                {comment.author}
              </span>
              {comment.author === postAuthor ? (
                <span className="rounded bg-soft px-1.5 py-0.5 font-medium text-brand">
                  Penulis
                </span>
              ) : null}
              <span className="text-muted">{comment.time}</span>
              {comment.isLocal ? (
                <span className="text-brand">Lokal</span>
              ) : null}
            </div>
            {collapsed ? (
              <p className="mt-1 text-xs leading-5 text-muted">
                Komentar diciutkan
                {descendants ? `, termasuk ${descendants} balasan` : ""}.
              </p>
            ) : depth > 2 && parentAuthor ? (
              <p className="mt-1 text-xs text-muted">Membalas {parentAuthor}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => setCollapsed((current) => !current)}
            aria-expanded={!collapsed}
            aria-controls={panelId}
            aria-label={`${collapsed ? "Perluas" : "Ciutkan"} komentar ${comment.author} dan balasannya`}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-soft hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {collapsed ? (
              <ChevronRight size={17} aria-hidden="true" />
            ) : (
              <ChevronDown size={17} aria-hidden="true" />
            )}
          </button>
        </div>
        <div id={panelId} hidden={collapsed}>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-foreground [overflow-wrap:anywhere]">
            {comment.body}
          </p>
          <button
            ref={replyButton}
            type="button"
            aria-expanded={replying}
            onClick={() => {
              if (!isTestRunner && !user) {
                router.push("/login?redirect=forum");
                return;
              }
              if (!isTestRunner && user && !user.phone_verified) {
                openPhoneVerifyModal();
                return;
              }
              setReplying((current) => !current);
            }}
            className="mt-1 inline-flex min-h-11 items-center gap-1.5 rounded-lg px-1 text-xs font-semibold text-muted hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            aria-label={`Balas komentar ${comment.author}`}
          >
            <CornerDownRight size={15} aria-hidden="true" />
            Balas
          </button>
          {replying ? (
            <div className="mb-4 mt-2 rounded-xl border border-border bg-surface p-3 sm:p-4">
              <CommentForm
                label={`Balas ${comment.author}`}
                focusOnMount
                onSubmit={(body) => {
                  const result = onReply(comment.id, body);
                  if (result) return result;
                  setReplying(false);
                  replyButton.current?.focus();
                  return null;
                }}
                onCancel={() => {
                  setReplying(false);
                  replyButton.current?.focus();
                }}
              />
            </div>
          ) : null}
          {comment.replies.length > 0 ? (
            <ol
              className={`mt-3 space-y-5 ${
                depth < 3
                  ? "ml-2 border-l border-border pl-3 sm:ml-4 sm:pl-5"
                  : ""
              }`}
            >
              {comment.replies.map((reply) => (
                <CommentNode
                  key={reply.id}
                  comment={reply}
                  depth={depth + 1}
                  parentAuthor={comment.author}
                  postAuthor={postAuthor}
                  onReply={onReply}
                />
              ))}
            </ol>
          ) : null}
        </div>
      </article>
    </li>
  );
}

export function CommentThread({
  slug,
  postAuthor,
}: {
  slug: string;
  postAuthor?: string;
}) {
  const { getComments, addComment: saveComment } = useForumSession();
  const comments = getComments(slug);
  const [announcement, setAnnouncement] = useState("");
  const headingId = useId();
  const total = countForumComments(comments);

  function addComment(parentId: string | null, body: string): string | null {
    const result = saveComment(slug, parentId, body);
    if (result) return result;
    setAnnouncement(
      `${parentId ? "Balasan" : "Komentar"} lokal ditambahkan. Tidak dikirim ke server.`,
    );
    return null;
  }

  return (
    <section
      id="comments"
      aria-labelledby={headingId}
      className="panel scroll-mt-28 p-5 sm:p-7"
    >
      <h2
        id={headingId}
        className="flex items-center gap-2 text-lg font-bold tracking-tight"
      >
        <MessageCircle size={20} className="text-brand" aria-hidden="true" />
        Obrolan <span className="font-medium text-muted">({total})</span>
      </h2>
      <p className="mb-3 mt-2 text-xs leading-6 text-muted">
        Komentar awal adalah contoh. Balasanmu tidak dipublikasikan dan tidak
        memerlukan akun.
      </p>
      <ForumStorageNotice />
      <CommentForm
        label="Tambahkan pengalamanmu"
        onSubmit={(body) => addComment(null, body)}
      />
      <p
        role="status"
        aria-live="polite"
        className="mt-3 text-sm leading-6 text-brand"
      >
        {announcement}
      </p>
      {comments.length > 0 ? (
        <ol className="mt-6 space-y-7 border-t border-border pt-6">
          {comments.map((comment) => (
            <CommentNode
              key={comment.id}
              comment={comment}
              depth={0}
              postAuthor={postAuthor}
              onReply={addComment}
            />
          ))}
        </ol>
      ) : (
        <div className="mt-5 rounded-xl bg-soft p-5 text-sm leading-6 text-muted">
          Belum ada komentar. Coba tulis pertanyaan atau pengalaman pertama
          untuk diskusi ini.
        </div>
      )}
    </section>
  );
}
