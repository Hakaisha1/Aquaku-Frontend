import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Leaf, MapPin, NotebookPen } from "lucide-react";
import { forumPosts } from "@/lib/forum-data";

export function ForumSidebar() {
  const featured = forumPosts.find((post) => post.category === "Pamer tank");

  return (
    <aside aria-label="Tentang forum Aquaku" className="space-y-6">
      {featured?.image ? (
        <section className="panel overflow-hidden">
          <div className="border-b border-border px-5 py-4">
            <h2 className="flex items-center gap-2 text-sm font-bold">
              <Leaf size={16} className="text-brand" aria-hidden="true" />
              Dari sudut tank
            </h2>
          </div>
          <Link
            href={`/forum/${featured.slug}`}
            className="group block rounded-b-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
          >
            <div className="relative aspect-[4/3] bg-soft">
              <Image
                src="/images/aquascape-story.jpg"
                alt="Ilustrasi aquascape hijau dengan tanaman dan kayu"
                fill
                sizes="(max-width: 1023px) 90vw, 300px"
                className="object-cover"
              />
            </div>
            <div className="p-5">
              <p className="mb-2 text-xs text-muted">Cerita tank contoh</p>
              <h3 className="font-bold leading-relaxed group-hover:text-brand">
                Pelan-pelan, jadi rimbun.
              </h3>
              <p className="mt-1 text-sm leading-6 text-muted">
                Catatan bulan ketiga dari tank 60 cm di Tembalang.
              </p>
              <span className="mt-4 inline-flex min-h-8 items-center gap-2 text-sm font-semibold text-brand">
                Lihat cerita tank
                <ArrowUpRight size={16} aria-hidden="true" />
              </span>
            </div>
          </Link>
        </section>
      ) : null}

      <section className="px-1">
        <h2 className="flex items-center gap-2 text-sm font-bold">
          <MapPin size={16} className="text-brand" aria-hidden="true" />
          Satu kota, banyak cerita
        </h2>
        <p className="mt-3 text-sm leading-7 text-muted">
          Ruang ngobrol hobiis aquascape Semarang. Tanya hal dasar, ceritakan
          kendala, atau bagikan sudut hijau yang sedang kamu rawat.
        </p>
        <p className="mt-3 border-l-2 border-border pl-3 text-xs leading-6 text-muted">
          Ini forum demo. Profil, diskusi, dan data tank adalah contoh, bukan
          aktivitas anggota sungguhan.
        </p>
      </section>

      <section className="panel p-5">
        <h2 className="flex items-center gap-2 text-sm font-bold">
          <NotebookPen size={16} className="text-brand" aria-hidden="true" />
          Biar lebih mudah dibantu
        </h2>
        <ul className="mt-4 space-y-3 text-sm leading-6 text-muted">
          <li>Sertakan usia dan ukuran tank.</li>
          <li>Catat durasi lampu, CO₂, dan hasil tes air jika ada.</li>
          <li>Ceritakan perubahan terakhir, bukan hanya gejalanya.</li>
          <li>Balas dengan ramah. Kita sama-sama belajar.</li>
        </ul>
      </section>
    </aside>
  );
}
