"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Flag,
  Loader2,
  MapPin,
  MessageCircle,
  Send,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { api, ApiError } from "@/lib/api";
import type {
  BackendForumComment,
  BackendForumPost,
  ForumReportReason,
} from "@/types/api";

export function BackendForumThread({ postId }: { postId: string }) {
  const router = useRouter();
  const { user, openAuthModal, openPhoneVerifyModal } = useAuth();

  const [post, setPost] = useState<BackendForumPost | null>(null);
  const [comments, setComments] = useState<BackendForumComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New comment state
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  // Report modal state
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState<ForumReportReason>("spam");
  const [reportDetails, setReportDetails] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportMsg, setReportMsg] = useState<string | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);

  // Delete state
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [postData, commentsData] = await Promise.all([
          api.getForumPost(postId),
          api.getForumComments(postId, { limit: 50 }).catch(() => ({
            items: [],
            pagination: { page: 1, limit: 50, total: 0, pages: 0 },
          })),
        ]);
        if (mounted) {
          setPost(postData);
          setComments(commentsData.items || []);
        }
      } catch (err: unknown) {
        if (mounted) {
          if (err instanceof ApiError && err.status === 404) {
            setError("Diskusi tidak ditemukan atau telah dihapus.");
          } else {
            setError("Gagal memuat diskusi forum dari server.");
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      mounted = false;
    };
  }, [postId]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    if (!user) {
      openAuthModal("login");
      return;
    }

    if (!user.phone_verified) {
      openPhoneVerifyModal();
      return;
    }

    setSubmittingComment(true);
    setCommentError(null);
    try {
      const newComment = await api.addForumComment(postId, commentText.trim());
      setComments((prev) => [...prev, newComment]);
      setCommentText("");
      if (post) {
        setPost({ ...post, comments_count: (post.comments_count || 0) + 1 });
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setCommentError(err.message);
      } else {
        setCommentError("Gagal mengirim komentar. Coba lagi.");
      }
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Hapus komentar ini?")) return;
    try {
      await api.deleteForumComment(postId, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      if (post) {
        setPost({ ...post, comments_count: Math.max(0, (post.comments_count || 1) - 1) });
      }
    } catch (err: unknown) {
      alert("Gagal menghapus komentar.");
    }
  };

  const handleDeletePost = async () => {
    if (!confirm("Yakin ingin menghapus diskusi ini secara permanen?")) return;
    setDeleting(true);
    try {
      await api.deleteForumPost(postId);
      router.push("/forum");
    } catch (err: unknown) {
      alert("Gagal menghapus diskusi.");
      setDeleting(false);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal("login");
      return;
    }
    if (!user.phone_verified) {
      openPhoneVerifyModal();
      return;
    }

    setSubmittingReport(true);
    setReportError(null);
    try {
      await api.reportForumPost(postId, reportReason, reportDetails.trim() || undefined);
      setReportMsg("Laporan berhasil dikirim dan akan ditinjau oleh tim moderasi.");
      setTimeout(() => {
        setReportOpen(false);
        setReportMsg(null);
      }, 2000);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setReportError(err.message);
      } else {
        setReportError("Gagal mengirim laporan.");
      }
    } finally {
      setSubmittingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex min-h-72 w-full max-w-[1200px] flex-col items-center justify-center gap-3">
        <Loader2 size={28} className="animate-spin text-brand" />
        <p className="text-sm font-semibold text-muted">Memuat diskusi forum…</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="mx-auto w-full max-w-[1200px] py-12">
        <div className="empty-state">
          <AlertCircle size={32} className="text-muted" />
          <h2 className="mt-3 text-lg font-bold">Diskusi Tidak Ditemukan</h2>
          <p className="mt-1 text-sm text-muted">{error || "Diskusi ini mungkin sudah dihapus."}</p>
          <Link href="/forum" className="button-primary mt-5">
            Kembali ke Forum
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user && post.author && user.id === post.author.id;
  const authorName = post.author?.display_name || "Anggota Komunitas";
  const authorInitials = authorName.slice(0, 2).toUpperCase();

  const formattedDate = new Date(post.created_at).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <Link
        href="/forum"
        className="mb-5 inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold text-muted hover:text-brand"
      >
        <ArrowLeft size={17} aria-hidden="true" />
        Semua diskusi
      </Link>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px] xl:gap-10">
        <div className="min-w-0 space-y-6">
          {/* Main Post Article */}
          <article className="panel overflow-hidden p-5 sm:p-7">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-full bg-soft px-3 py-1 text-xs font-semibold text-brand">
                {post.category?.name || "Umum"}
              </span>

              <div className="flex items-center gap-2">
                {isOwner && (
                  <button
                    type="button"
                    onClick={handleDeletePost}
                    disabled={deleting}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-500/10 dark:text-red-400"
                    title="Hapus diskusi ini"
                  >
                    <Trash2 size={14} />
                    <span>Hapus</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setReportOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-muted hover:text-red-600 dark:hover:text-red-400"
                  title="Laporkan diskusi ini"
                >
                  <Flag size={14} />
                  <span>Laporkan</span>
                </button>
              </div>
            </div>

            <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-foreground sm:text-3xl">
              {post.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border pb-5 text-xs text-muted">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-on-brand">
                {authorInitials}
              </span>
              <span className="font-semibold text-foreground">{authorName}</span>
              <span className="inline-flex items-center gap-1">
                <Clock size={13} />
                {formattedDate}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin size={13} />
                Semarang
              </span>
            </div>

            {/* Photos if any */}
            {post.photos && post.photos.length > 0 && (
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {post.photos.map((photo, i) => (
                  <div
                    key={photo.id || i}
                    className="relative aspect-video overflow-hidden rounded-xl bg-soft"
                  >
                    <Image
                      src={photo.url}
                      alt={`Foto diskusi ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Post Body */}
            <div className="mt-6 space-y-4 text-sm leading-7 text-foreground/90 whitespace-pre-wrap">
              {post.body}
            </div>
          </article>

          {/* Comments Section */}
          <section id="comments" className="panel p-5 sm:p-7">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <MessageCircle size={20} className="text-brand" />
              <span>Komentar ({comments.length})</span>
            </h2>

            {/* Comment Form / Locked Auth Banner */}
            {!user ? (
              <div className="mt-5 rounded-2xl border border-dashed border-border bg-soft/60 p-5 text-center">
                <div className="mx-auto flex size-10 items-center justify-center rounded-xl bg-surface text-brand shadow-sm">
                  <MessageCircle size={18} />
                </div>
                <h3 className="mt-2 text-sm font-bold text-foreground">
                  Masuk untuk Berkomentar
                </h3>
                <p className="mx-auto mt-1 max-w-md text-xs text-muted">
                  Kamu harus memiliki akun dan nomor WhatsApp terverifikasi untuk menulis komentar atau berpartisipasi dalam diskusi ini.
                </p>
                <Link
                  href="/login?redirect=forum"
                  className="button-primary mt-3.5 inline-flex min-h-10 text-xs font-bold"
                >
                  Masuk ke Akun
                </Link>
              </div>
            ) : !user.phone_verified ? (
              <div className="mt-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-center">
                <h3 className="text-sm font-bold text-amber-800 dark:text-amber-400">
                  Verifikasi Nomor WhatsApp Diperlukan
                </h3>
                <p className="mx-auto mt-1 max-w-md text-xs text-muted">
                  Nomor WhatsApp kamu belum terverifikasi. Selesaikan verifikasi OTP untuk mengaktifkan fitur komentar.
                </p>
                <button
                  type="button"
                  onClick={() => openPhoneVerifyModal()}
                  className="button-primary mt-3.5 inline-flex min-h-10 text-xs font-bold"
                >
                  Verifikasi WhatsApp Sekarang
                </button>
              </div>
            ) : (
              <form onSubmit={handleCommentSubmit} className="mt-5 space-y-3">
                {commentError && (
                  <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{commentError}</span>
                  </div>
                )}

                <div>
                  <label htmlFor="comment-box" className="sr-only">
                    Tulis komentar kamu
                  </label>
                  <textarea
                    id="comment-box"
                    rows={3}
                    required
                    placeholder="Bagikan pengalaman atau solusi seputar diskusi ini…"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    disabled={submittingComment}
                    className="field resize-y py-2.5"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingComment || !commentText.trim()}
                    className="button-primary min-h-10 text-xs font-bold"
                  >
                    <Send size={14} />
                    {submittingComment ? "Mengirim…" : "Kirim Komentar"}
                  </button>
                </div>
              </form>
            )}

            {/* Comments List */}
            <div className="mt-6 divide-y divide-border">
              {comments.length === 0 ? (
                <p className="py-6 text-center text-xs text-muted">
                  Belum ada komentar. Jadilah orang pertama yang menanggapi!
                </p>
              ) : (
                comments.map((comment) => {
                  const cAuthor = comment.author?.display_name || "Anggota";
                  const cInitials = cAuthor.slice(0, 2).toUpperCase();
                  const isCommentOwner = user && comment.author && user.id === comment.author.id;
                  const cTime = new Date(comment.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div key={comment.id} className="py-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-soft text-[10px] font-bold text-brand">
                            {cInitials}
                          </span>
                          <span className="text-xs font-semibold text-foreground">
                            {cAuthor}
                          </span>
                          <span className="text-[11px] text-muted">{cTime}</span>
                        </div>

                        {isCommentOwner && (
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-muted hover:text-red-600 dark:hover:text-red-400"
                            title="Hapus komentar"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                      <p className="mt-2 text-xs leading-6 text-foreground/90 whitespace-pre-wrap pl-9">
                        {comment.body}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          <div className="panel p-5">
            <h3 className="text-sm font-bold text-foreground">Tentang Forum Aquaku</h3>
            <p className="mt-2 text-xs leading-5 text-muted">
              Tempat bertukar tips, foto setup, dan solusi aquascape bersama sesama hobiis di Semarang. Tetap santun dan saling dukung.
            </p>
          </div>
        </aside>
      </div>

      {/* Report Modal */}
      {reportOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="modal-backdrop-animate fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setReportOpen(false);
          }}
        >
          <div className="modal-panel-animate w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl">
            <h3 className="text-base font-bold">Laporkan Diskusi Ini</h3>
            <p className="mt-1 text-xs text-muted">
              Bantu kami menjaga forum tetap aman dan nyaman untuk semua anggota komunitas.
            </p>

            {reportMsg ? (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-brand/30 bg-soft p-3 text-xs font-semibold text-brand">
                <CheckCircle2 size={16} />
                <span>{reportMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="mt-4 space-y-3.5">
                {reportError && (
                  <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-600">
                    <AlertCircle size={15} />
                    <span>{reportError}</span>
                  </div>
                )}

                <div>
                  <label htmlFor="forum-report-reason" className="mb-1 block text-xs font-semibold text-muted">
                    Alasan Pelaporan
                  </label>
                  <select
                    id="forum-report-reason"
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value as ForumReportReason)}
                    className="field"
                  >
                    <option value="spam">Spam / Iklan Terlarang</option>
                    <option value="harassment">Pelecehan / Kata Kasar</option>
                    <option value="inappropriate">Konten Tidak Pantas</option>
                    <option value="misinformation">Informasi Menyesatkan</option>
                    <option value="other">Alasan Lainnya</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="forum-report-details" className="mb-1 block text-xs font-semibold text-muted">
                    Keterangan Tambahan (Opsional)
                  </label>
                  <textarea
                    id="forum-report-details"
                    rows={3}
                    maxLength={1000}
                    placeholder="Jelaskan alasan laporan kamu…"
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    className="field resize-y"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportOpen(false)}
                    className="button-secondary min-h-10 text-xs"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReport}
                    className="button-primary min-h-10 text-xs font-bold"
                  >
                    {submittingReport ? "Mengirim…" : "Kirim Laporan"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
