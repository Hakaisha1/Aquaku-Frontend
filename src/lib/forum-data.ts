export const forumCategories = [
  "Perawatan",
  "Alga & air",
  "Pamer tank",
  "Pemula",
] as const;

export type ForumCategory = (typeof forumCategories)[number];

export type ForumPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: ForumCategory;
  author: string;
  initials: string;
  time: string;
  comments: number;
  image?: string;
  imageAlt?: string;
  location: string;
  publishedAt: string;
};

export type ForumComment = {
  id: string;
  author: string;
  initials: string;
  time: string;
  body: string;
  isLocal?: boolean;
  replies: ForumComment[];
};

export type ForumThread = {
  paragraphs: string[];
  tank: { label: string; value: string }[];
  waterParameters: { label: string; value: string }[];
  comments: ForumComment[];
};

export function countForumComments(comments: ForumComment[]): number {
  return comments.reduce(
    (total, comment) => total + 1 + countForumComments(comment.replies),
    0,
  );
}

// Preserve untouched branches so adding a child never mutates the demo fixtures.
export function appendForumComment(
  comments: ForumComment[],
  parentId: string | null,
  newComment: ForumComment,
): ForumComment[] {
  if (parentId === null) return [...comments, newComment];

  let changed = false;
  const next = comments.map((comment) => {
    if (comment.id === parentId) {
      changed = true;
      return { ...comment, replies: [...comment.replies, newComment] };
    }

    const replies = appendForumComment(comment.replies, parentId, newComment);
    if (replies !== comment.replies) {
      changed = true;
      return { ...comment, replies };
    }
    return comment;
  });

  return changed ? next : comments;
}

// All names, conversations, readings, and relative times are fictional demo data.
export const forumThreads: Record<string, ForumThread> = {
  "trimming-rotala-tank-60-cm": {
    paragraphs: [
      "Rotala di tank 60 cm saya mulai menutup jalur renang. Bagian atas masih merah, tetapi daun bawah mulai rontok karena tertutup. Tank ada di ruang tamu rumah di Banyumanik, jadi siang hari juga dapat cahaya dari jendela.",
      "Selama ini saya hanya memotong pucuk lalu menanamnya lagi di sela batang lama. Sekarang rumpunnya terasa terlalu padat. Lebih baik pangkas bertahap atau cabut batang tua dan tanam ulang pucuk yang sehat?",
      "Ada ember dan selang kecil untuk menyedot potongan daun. Saya ingin tetap menyisakan tempat sembunyi untuk ember tetra, jadi kalau bisa tidak bongkar semuanya sekaligus. Teman-teman biasanya mulai dari bagian mana?",
    ],
    tank: [
      { label: "Ukuran", value: "60 × 30 × 36 cm" },
      { label: "Usia tank", value: "4 bulan" },
      { label: "Lampu", value: "7 jam per hari" },
      { label: "CO₂", value: "Injeksi saat lampu menyala" },
    ],
    waterParameters: [
      { label: "pH", value: "6,8" },
      { label: "Suhu", value: "28 °C" },
      { label: "KH", value: "4 dKH" },
      { label: "Nitrat", value: "10 mg/L" },
    ],
    comments: [
      {
        id: "rotala-1",
        author: "Dimas Prasetyo",
        initials: "DP",
        time: "1 jam lalu",
        body: "Saya biasanya mulai dari sepertiga rumpun dulu. Sisakan batang yang bawahnya masih sehat, lalu beri jarak saat menanam pucuk. Di tank saya di Tembalang, rumpun terlalu rapat bikin bagian bawah cepat botak.",
        replies: [
          {
            id: "rotala-1-1",
            author: "Raka Aditya",
            initials: "RA",
            time: "50 menit lalu",
            body: "Kalau batang bawah sudah hampir tidak ada daunnya, masih layak disisakan, Mas? Takut malah membusuk di dalam rumpun.",
            replies: [
              {
                id: "rotala-1-1-1",
                author: "Dimas Prasetyo",
                initials: "DP",
                time: "35 menit lalu",
                body: "Pilih yang batangnya masih kokoh. Yang lembek saya keluarkan perlahan sambil sifon di dekat pangkal. Pucuk sehat bisa ditanam terpisah dulu; tidak harus selesai dalam satu sesi.",
                replies: [],
              },
            ],
          },
          {
            id: "rotala-1-2",
            author: "Nadia Putri",
            initials: "NP",
            time: "25 menit lalu",
            body: "Setuju bertahap. Matikan filter sebentar saat memotong supaya serpihan tidak menyebar, lalu ingat nyalakan lagi setelah beres.",
            replies: [],
          },
        ],
      },
      {
        id: "rotala-2",
        author: "Bayu Santoso",
        initials: "BS",
        time: "40 menit lalu",
        body: "Coba dokumentasikan sebelum dan seminggu sesudah trimming. Jangan sekaligus mengubah pupuk dan durasi lampu supaya kelihatan respons tanamannya dari apa.",
        replies: [],
      },
    ],
  },
  "alga-rambut-setelah-ganti-lampu": {
    paragraphs: [
      "Dua minggu setelah ganti lampu, ada alga rambut di ujung moss dan dekat outflow. Sebelumnya tank di rumah Pedurungan ini relatif bersih. Lampu baru masih saya nyalakan 8 jam, sama seperti lampu lama, tetapi terlihat jauh lebih terang.",
      "Pakan tidak berubah dan air diganti sekitar 30% tiap minggu. Saya belum pakai CO₂, hanya filter gantung dan pupuk cair sesuai label. Foto ilustrasi di diskusi ini bukan foto diagnosis dari tank asli.",
      "Saya berencana ambil alga manual dulu. Untuk penyesuaian lampu, sebaiknya turunkan intensitas atau potong durasinya? Ingin mulai dari satu perubahan yang bisa dipantau, bukan langsung menambah obat atau fauna.",
    ],
    tank: [
      { label: "Ukuran", value: "45 × 30 × 30 cm" },
      { label: "Usia tank", value: "5 bulan" },
      { label: "Lampu", value: "8 jam per hari, baru diganti" },
      { label: "CO₂", value: "Tanpa injeksi" },
    ],
    waterParameters: [
      { label: "pH", value: "7,2" },
      { label: "Suhu", value: "29 °C" },
      { label: "KH", value: "5 dKH" },
      { label: "Nitrat", value: "20 mg/L" },
    ],
    comments: [
      {
        id: "alga-1",
        author: "Nadia Putri",
        initials: "NP",
        time: "3 jam lalu",
        body: "Karena perubahan terakhir lampu, saya akan mulai dari situ. Kalau ada dimmer, turunkan intensitas bertahap dan catat responsnya. Angkat alga manual, lalu evaluasi pertumbuhan baru, bukan hanya alga lama.",
        replies: [
          {
            id: "alga-1-1",
            author: "Fajar Wibowo",
            initials: "FW",
            time: "2 jam lalu",
            body: "Ada dimmer bawaan, belum pernah saya pakai. Saya coba turunkan dulu dan foto titik moss yang sama tiap beberapa hari. Terima kasih!",
            replies: [],
          },
        ],
      },
      {
        id: "alga-2",
        author: "Sari Lestari",
        initials: "SL",
        time: "1 jam lalu",
        body: "Jangan tambah udang hanya untuk mengejar alga, ya. Pastikan kebutuhan udangnya cocok dan tank stabil dulu. Periksa juga apakah jendela memberi tambahan sinar langsung.",
        replies: [],
      },
    ],
  },
  "tank-60-cm-tembalang-bulan-ketiga": {
    paragraphs: [
      "Berbagi progres tank 60 cm di sudut ruang kerja saya di Tembalang. Konsepnya sederhana: jalur pasir kecil di tengah, kayu bercabang, dan tanaman batang di belakang. Sekarang masuk bulan ketiga, mulai lebih enak dilihat setelah masa diatom awal.",
      "Tanamannya didominasi Rotala, Cryptocoryne, dan Anubias yang diikat ke kayu. Saya sengaja menyisakan ruang kosong di depan supaya perawatan tidak terasa seperti membongkar hutan setiap akhir pekan.",
      "Tantangan terbesarnya justru menjaga suhu saat siang Semarang sedang panas. Kipas membantu, tetapi penguapan jadi lebih cepat. Ada yang punya pengalaman menata tanaman depan agar tetap lega tanpa terlihat terlalu kosong? Foto yang ditampilkan merupakan ilustrasi untuk demo ini.",
    ],
    tank: [
      { label: "Ukuran", value: "60 × 30 × 36 cm" },
      { label: "Usia tank", value: "3 bulan" },
      { label: "Lampu", value: "6 jam per hari" },
      { label: "CO₂", value: "Injeksi dengan timer" },
    ],
    waterParameters: [
      { label: "pH", value: "6,9" },
      { label: "Suhu", value: "27 °C" },
      { label: "KH", value: "3 dKH" },
      { label: "Nitrat", value: "10 mg/L" },
    ],
    comments: [
      {
        id: "showcase-1",
        author: "Raka Aditya",
        initials: "RA",
        time: "5 jam lalu",
        body: "Ruang kosongnya justru bikin kayunya terbaca. Mungkin coba sedikit Cryptocoryne parva di tepi jalur, tidak perlu menutup semua pasir.",
        replies: [
          {
            id: "showcase-1-1",
            author: "Nadia Putri",
            initials: "NP",
            time: "4 jam lalu",
            body: "Terima kasih! Saya suka ide membatasi tanaman di tepi saja. Lebih gampang juga waktu sifon pasir.",
            replies: [],
          },
        ],
      },
      {
        id: "showcase-2",
        author: "Dimas Prasetyo",
        initials: "DP",
        time: "3 jam lalu",
        body: "Untuk air yang menguap, saya isi ulang sedikit-sedikit dengan air rendah mineral yang sudah sesuai untuk tank, bukan menganggapnya sebagai pengganti jadwal ganti air. Di Tembalang penguapannya memang terasa kalau pakai kipas.",
        replies: [],
      },
      {
        id: "showcase-3",
        author: "Intan Maharani",
        initials: "IM",
        time: "2 jam lalu",
        body: "Suka jalur pasir yang tidak simetris. Penasaran progresnya setelah tanaman belakang dipangkas lagi. Bagikan pembaruannya nanti, ya.",
        replies: [],
      },
    ],
  },
  "tank-pertama-air-pdam-semarang": {
    paragraphs: [
      "Halo, saya baru mau mulai tank 30 cm di kos daerah Ngaliyan. Rencananya tanaman mudah dulu dan belum mau memasukkan ikan. Sumber air dari PDAM, ditampung di ember bersih yang khusus untuk akuarium.",
      "Sering dengar air cukup diendapkan semalam, tetapi saya belum tahu disinfektan apa yang dipakai di jaringan rumah saya. Apakah tetap perlu dechlorinator? Lalu kapan aman mulai menambah fauna?",
      "Filter sudah jalan 4 hari. Angka di samping adalah contoh catatan awal, bukan tanda bahwa tank sudah siap. Saya belum punya hasil tes amonia dan nitrit, jadi ingin tahu urutan pemeriksaan yang perlu diprioritaskan sebelum membeli ikan.",
    ],
    tank: [
      { label: "Ukuran", value: "30 × 30 × 30 cm" },
      { label: "Usia tank", value: "4 hari, proses cycling" },
      { label: "Lampu", value: "6 jam per hari" },
      { label: "Fauna", value: "Belum ada" },
    ],
    waterParameters: [
      { label: "pH", value: "7,4" },
      { label: "Suhu", value: "28 °C" },
      { label: "Amonia", value: "Belum diukur" },
      { label: "Nitrit", value: "Belum diukur" },
    ],
    comments: [
      {
        id: "beginner-1",
        author: "Bayu Santoso",
        initials: "BS",
        time: "20 jam lalu",
        body: "Mengendapkan air saja tidak selalu menangani kloramin. Cek info pengolahan air setempat dan pilih conditioner yang memang menangani disinfektan yang digunakan, mengikuti dosis label. Hindari ember bekas sabun.",
        replies: [
          {
            id: "beginner-1-1",
            author: "Intan Maharani",
            initials: "IM",
            time: "19 jam lalu",
            body: "Berarti empat hari filter menyala belum bisa jadi patokan, ya? Saya tunda dulu beli ikan dan cari tes amonia serta nitrit.",
            replies: [
              {
                id: "beginner-1-1-1",
                author: "Bayu Santoso",
                initials: "BS",
                time: "18 jam lalu",
                body: "Betul, patokannya proses biologis dan hasil tes yang konsisten, bukan hitungan hari saja. Cycling perlu sumber amonia yang terkontrol; sebaiknya pelajari metode fishless cycling sebelum mulai.",
                replies: [],
              },
            ],
          },
        ],
      },
      {
        id: "beginner-2",
        author: "Sari Lestari",
        initials: "SL",
        time: "16 jam lalu",
        body: "Langkah menunda fauna sudah bagus. Catat hasil tes, tanggal ganti air, dan perlakuan airnya supaya nanti lebih mudah dibantu kalau ada yang berubah.",
        replies: [],
      },
    ],
  },
  "anubias-rimpang-di-atas-kayu": {
    paragraphs: [
      "Saya sedang menambah Anubias kecil ke tank low-tech di Gajahmungkur. Akarnya sudah menempel sebagian di kayu, tetapi rimpangnya masih terlihat dari depan. Apakah aman diselipkan ke soil supaya lebih rapi?",
      "Posisinya di bawah bayangan tanaman batang, dengan aliran pelan. Daun lama sehat, hanya ingin merapikan tampilannya. Tank tanpa CO₂ dan perawatan sederhana karena saya sering pulang malam.",
      "Kalau ada cara mengikat yang tidak terlalu kelihatan dan tidak menekan rimpang, boleh berbagi. Saya lebih memilih menunggu akar menempel daripada mengambil risiko tanaman membusuk.",
    ],
    tank: [
      { label: "Ukuran", value: "40 × 25 × 30 cm" },
      { label: "Usia tank", value: "7 bulan" },
      { label: "Lampu", value: "6 jam per hari" },
      { label: "CO₂", value: "Tanpa injeksi" },
    ],
    waterParameters: [
      { label: "pH", value: "7,1" },
      { label: "Suhu", value: "28 °C" },
      { label: "KH", value: "4 dKH" },
      { label: "Nitrat", value: "10 mg/L" },
    ],
    comments: [
      {
        id: "anubias-1",
        author: "Nadia Putri",
        initials: "NP",
        time: "1 hari lalu",
        body: "Biarkan rimpang di atas substrat, ya. Akar boleh masuk ke sela kayu atau soil, tetapi rimpang jangan dikubur. Saya biasanya ikat longgar dengan benang tipis sampai akarnya memegang kayu.",
        replies: [
          {
            id: "anubias-1-1",
            author: "Sari Lestari",
            initials: "SL",
            time: "1 hari lalu",
            body: "Siap, saya pindahkan ke sisi kayu yang tidak terlalu terlihat saja. Ternyata tidak perlu menutup semua bagian tanaman supaya terlihat rapi.",
            replies: [],
          },
        ],
      },
    ],
  },
};

export const forumPosts: ForumPost[] = [
  {
    slug: "trimming-rotala-tank-60-cm",
    title: "Rotala mulai menutup jalur renang. Trimming dari mana dulu?",
    excerpt:
      "Pucuk masih merah, tapi daun bawah mulai rontok. Lebih baik pangkas bertahap atau tanam ulang? Cerita dari tank 60 cm di Banyumanik.",
    category: "Perawatan",
    author: "Raka Aditya",
    initials: "RA",
    time: "2 jam lalu",
    publishedAt: "2026-11-04T08:15:00+07:00",
    location: "Banyumanik, Semarang",
    comments: countForumComments(
      forumThreads["trimming-rotala-tank-60-cm"].comments,
    ),
    image: "/images/aquascape-detail.jpg",
    imageAlt: "Ilustrasi rumpun tanaman hijau untuk diskusi trimming aquascape",
  },
  {
    slug: "alga-rambut-setelah-ganti-lampu",
    title: "Alga rambut setelah ganti lampu: mulai evaluasi dari mana?",
    excerpt:
      "Lampu baru lebih terang, durasi masih 8 jam. Ingin memperbaiki keseimbangan tank tanpa buru-buru menambah obat atau fauna.",
    category: "Alga & air",
    author: "Fajar Wibowo",
    initials: "FW",
    time: "4 jam lalu",
    publishedAt: "2026-11-04T06:15:00+07:00",
    location: "Pedurungan, Semarang",
    comments: countForumComments(
      forumThreads["alga-rambut-setelah-ganti-lampu"].comments,
    ),
  },
  {
    slug: "tank-60-cm-tembalang-bulan-ketiga",
    title: "Sudut hijau 60 cm di Tembalang, masuk bulan ketiga",
    excerpt:
      "Jalur pasir kecil, kayu bercabang, dan ruang untuk tumbuh. Berbagi progres tank serta cerita menjaga suhu saat siang Semarang.",
    category: "Pamer tank",
    author: "Nadia Putri",
    initials: "NP",
    time: "6 jam lalu",
    publishedAt: "2026-11-04T04:15:00+07:00",
    location: "Tembalang, Semarang",
    comments: countForumComments(
      forumThreads["tank-60-cm-tembalang-bulan-ketiga"].comments,
    ),
    image: "/images/aquascape-hero.jpg",
    imageAlt: "Ilustrasi aquascape rimbun dengan kayu dan jalur pasir terbuka",
  },
  {
    slug: "tank-pertama-air-pdam-semarang",
    title: "Tank pertama di kos: air PDAM cukup diendapkan saja?",
    excerpt:
      "Baru mulai di Ngaliyan, belum memasukkan ikan. Mencari urutan persiapan air dan cycling yang masuk akal untuk pemula.",
    category: "Pemula",
    author: "Intan Maharani",
    initials: "IM",
    time: "1 hari lalu",
    publishedAt: "2026-11-03T10:15:00+07:00",
    location: "Ngaliyan, Semarang",
    comments: countForumComments(
      forumThreads["tank-pertama-air-pdam-semarang"].comments,
    ),
  },
  {
    slug: "anubias-rimpang-di-atas-kayu",
    title: "Anubias di kayu: rimpangnya perlu ditutup atau dibiarkan?",
    excerpt:
      "Ingin merapikan tank low-tech di Gajahmungkur tanpa mengubur bagian yang seharusnya tetap terbuka.",
    category: "Perawatan",
    author: "Sari Lestari",
    initials: "SL",
    time: "2 hari lalu",
    publishedAt: "2026-11-02T10:15:00+07:00",
    location: "Gajahmungkur, Semarang",
    comments: countForumComments(
      forumThreads["anubias-rimpang-di-atas-kayu"].comments,
    ),
    image: "/images/aquascape-story.jpg",
    imageAlt: "Ilustrasi tanaman aquascape yang tumbuh di sekitar kayu",
  },
];

export function getForumPost(slug: string): ForumPost | undefined {
  return forumPosts.find((post) => post.slug === slug);
}

export function getForumThread(slug: string): ForumThread | undefined {
  if (!getForumPost(slug)) return undefined;
  return forumThreads[slug];
}

import type { BackendForumPost } from "@/types/api";

export function backendPostToForumPost(bp: BackendForumPost): ForumPost {
  const authorName = bp.author?.display_name || "Anggota Komunitas";
  const initials = authorName.slice(0, 2).toUpperCase();
  const photoUrl = bp.photos?.[0]?.url;

  let timeStr = "Baru saja";
  try {
    const d = new Date(bp.created_at);
    const diffHours = Math.round((Date.now() - d.getTime()) / (1000 * 60 * 60));
    if (diffHours >= 24) {
      timeStr = `${Math.floor(diffHours / 24)} hari lalu`;
    } else if (diffHours > 0) {
      timeStr = `${diffHours} jam lalu`;
    }
  } catch {
    // fallback
  }

  // Ensure category matches ForumCategory union or fallback to Perawatan
  let categoryName: ForumCategory = "Perawatan";
  if (bp.category?.name && forumCategories.includes(bp.category.name as ForumCategory)) {
    categoryName = bp.category.name as ForumCategory;
  }

  return {
    slug: bp.id,
    title: bp.title,
    excerpt: bp.body.length > 170 ? `${bp.body.slice(0, 170)}…` : bp.body,
    category: categoryName,
    author: authorName,
    initials,
    time: timeStr,
    comments: bp.comments_count || 0,
    image: photoUrl,
    location: "Semarang",
    publishedAt: bp.created_at,
  };
}
