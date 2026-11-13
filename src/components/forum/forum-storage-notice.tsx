"use client";

import { useForumSession } from "./forum-provider";

export function ForumStorageNotice() {
  const { ready, persistent } = useForumSession();
  const memoryOnly = ready && !persistent;

  return (
    <p
      role="status"
      className="mb-5 rounded-xl border border-border bg-soft px-4 py-3 text-xs leading-6 text-muted"
    >
      <span className="font-semibold text-foreground">
        {memoryOnly ? "Penyimpanan browser tidak tersedia." : "Ruang demo lokal."}
      </span>{" "}
      {memoryOnly
        ? "Diskusi dan balasan masih bisa dicoba selama aplikasi terbuka, tetapi perubahan bisa hilang saat refresh atau tab ditutup. Tidak dikirim ke server."
        : "Diskusi dan balasanmu disimpan di browser ini, termasuk setelah refresh. Tidak dipublikasikan atau tersedia di perangkat lain. Jangan sertakan data pribadi."}
    </p>
  );
}
