export const categories = [
  {
    slug: "tanaman",
    name: "Tanaman air",
    short: "Tanaman",
    description: "Dari trimmingan sampai rimpang",
  },
  {
    slug: "fauna",
    name: "Ikan & udang",
    short: "Fauna",
    description: "Penghuni kecil untuk tank kamu",
  },
  {
    slug: "hardscape",
    name: "Hardscape",
    short: "Hardscape",
    description: "Batu dan kayu pembentuk cerita",
  },
  {
    slug: "peralatan",
    name: "Peralatan",
    short: "Peralatan",
    description: "Perlengkapan yang masih layak pakai",
  },
  {
    slug: "substrat",
    name: "Substrat & pupuk",
    short: "Substrat",
    description: "Fondasi untuk tanaman sehat",
  },
] as const;

export type CategorySlug = (typeof categories)[number]["slug"];
export type Product = {
  slug: string;
  name: string;
  category: CategorySlug;
  price: number;
  unit: string;
  image: string;
  imagePosition?: string;
  gallery: string[];
  condition: string;
  seller: string;
  sellerInitials: string;
  sellerTier: "Personal" | "Toko";
  verified: boolean;
  district: string;
  delivery: "COD & kurir instan" | "COD / meetup";
  description: string;
  specs: { label: string; value: string }[];
  tags: string[];
  posted: string;
};

// Fictional fixtures: prices, sellers and verification labels are demo content.
export const products: Product[] = [
  {
    slug: "anubias-nana-petite",
    name: "Anubias nana petite — rimpang sehat",
    category: "tanaman",
    price: 25000,
    unit: "rimpang",
    image: "/images/plant-anubias.svg",
    gallery: [
      "/images/plant-anubias.svg",
      "/images/aquascape-detail.jpg",
      "/images/aquascape-story.jpg",
    ],
    condition: "Bibit / rimpang",
    seller: "Rimbun Aquatic",
    sellerInitials: "RA",
    sellerTier: "Toko",
    verified: true,
    district: "Banyumanik",
    delivery: "COD & kurir instan",
    posted: "2 jam lalu",
    description:
      "Rimpang Anubias nana petite untuk mengisi sela batu atau kayu di tank kamu. Cocok untuk setup low-tech dengan cahaya rendah sampai sedang. Ikat atau tempelkan rimpang pada hardscape; jangan ditanam seluruhnya ke dalam substrat.\n\nContoh listing berisi satu rimpang dengan 5–7 daun. Kondisi aktual, jumlah daun, dan waktu pengambilan perlu dikonfirmasi kepada penjual sebelum transaksi.",
    specs: [
      { label: "Bentuk", value: "Rimpang, 5–7 daun" },
      { label: "Perawatan", value: "Mudah / low-tech" },
      { label: "Kebutuhan cahaya", value: "Rendah–sedang" },
      { label: "Kondisi tumbuh", value: "Submersed" },
    ],
    tags: ["Submersed", "Siap kirim", "COD Semarang"],
  },
  {
    slug: "rotala-rotundifolia-trimming",
    name: "Rotala rotundifolia — hasil trimming",
    category: "tanaman",
    price: 15000,
    unit: "ikat / 10 batang",
    image: "/images/plant-rotala.svg",
    gallery: ["/images/plant-rotala.svg", "/images/aquascape-story.jpg"],
    condition: "Trimmingan",
    seller: "Kebun Kecil Raka",
    sellerInitials: "KR",
    sellerTier: "Personal",
    verified: false,
    district: "Tembalang",
    delivery: "COD / meetup",
    posted: "3 jam lalu",
    description:
      "Trimmingan dari tank pribadi, terdiri dari sepuluh pucuk sehat sepanjang sekitar 10–15 cm. Tanam dengan sedikit jarak supaya bagian bawah tetap mendapatkan cahaya.\n\nIni adalah data contoh. Warna tanaman dipengaruhi cahaya dan nutrisi; diskusikan kebutuhan setup kamu sebelum membeli.",
    specs: [
      { label: "Isi", value: "10 batang" },
      { label: "Panjang", value: "±10–15 cm" },
      { label: "Cahaya", value: "Sedang–tinggi" },
      { label: "CO₂", value: "Disarankan" },
    ],
    tags: ["Trimmingan", "Submersed", "Bisa barter"],
  },
  {
    slug: "udang-yellow-sakura",
    name: "Udang yellow sakura — paket 5 ekor",
    category: "fauna",
    price: 35000,
    unit: "paket",
    image: "/images/shrimp.jpg",
    gallery: ["/images/shrimp.jpg", "/images/planted-tank.jpg"],
    condition: "Hasil ternak",
    seller: "Udang Halaman",
    sellerInitials: "UH",
    sellerTier: "Personal",
    verified: false,
    district: "Pedurungan",
    delivery: "COD / meetup",
    posted: "4 jam lalu",
    description:
      "Paket contoh lima ekor Neocaridina yellow sakura dari ternak rumahan. Pastikan tank sudah stabil dan lakukan aklimatisasi perlahan. Jangan mencampur langsung dengan penghuni yang agresif.\n\nPengambilan langsung lebih disarankan untuk mengurangi waktu perjalanan. Konfirmasi ukuran, rasio kelamin, dan kondisi udang kepada penjual.",
    specs: [
      { label: "Jumlah", value: "5 ekor" },
      { label: "Ukuran", value: "±1–1,5 cm" },
      { label: "Air", value: "Air tawar" },
      { label: "Pengambilan", value: "COD / meetup" },
    ],
    tags: ["Fauna hidup", "COD Semarang", "Harga pas"],
  },
  {
    slug: "filter-hang-on-300",
    name: "Hang-on filter 300 L/jam, siap pakai",
    category: "peralatan",
    price: 65000,
    unit: "unit",
    image: "/images/filter.svg",
    gallery: [
      "/images/filter.svg",
      "/images/filter-side.svg",
      "/images/filter-parts.svg",
    ],
    condition: "Second (Good)",
    seller: "Dimas Prasetyo",
    sellerInitials: "DP",
    sellerTier: "Personal",
    verified: false,
    district: "Semarang Barat",
    delivery: "COD & kurir instan",
    posted: "5 jam lalu",
    description:
      "Filter gantung bekas pemakaian enam bulan untuk tank kecil. Pada contoh listing ini, pompa berfungsi normal dengan gores tipis di bodi dan tanpa dus. Media lama tidak disertakan.\n\nMinta video tes menyala dan cek kebocoran saat COD. Tiga ilustrasi produk disertakan untuk memperlihatkan rancangan galeri; listing sungguhan harus menggunakan foto kondisi aktual.",
    specs: [
      { label: "Debit nominal", value: "300 L/jam" },
      { label: "Pemakaian", value: "6 bulan (contoh)" },
      { label: "Kelengkapan", value: "Pompa, intake, spons" },
      { label: "Minus", value: "Gores tipis; tanpa dus" },
    ],
    tags: ["Second (Good)", "Bisa nego", "COD Semarang"],
  },
  {
    slug: "kayu-rasamala-mini",
    name: "Kayu rasamala mini untuk nano tank",
    category: "hardscape",
    price: 45000,
    unit: "buah",
    image: "/images/driftwood.svg",
    gallery: ["/images/driftwood.svg", "/images/aquascape-detail.jpg"],
    condition: "New",
    seller: "Rimbun Aquatic",
    sellerInitials: "RA",
    sellerTier: "Toko",
    verified: true,
    district: "Banyumanik",
    delivery: "COD & kurir instan",
    posted: "6 jam lalu",
    description:
      "Kayu bercabang untuk titik fokus nano tank. Rendam dan bersihkan terlebih dahulu sebelum memasukkannya ke akuarium. Tannin dari kayu dapat memberi warna pada air.\n\nUkuran dan bentuk adalah ilustrasi untuk demo. Minta foto kayu yang benar-benar akan dikirim karena tiap potong memiliki bentuk berbeda.",
    specs: [
      { label: "Panjang", value: "±20 cm" },
      { label: "Material", value: "Kayu rasamala" },
      { label: "Untuk tank", value: "30–45 cm" },
      { label: "Persiapan", value: "Rendam terlebih dahulu" },
    ],
    tags: ["New", "Siap kirim", "COD Semarang"],
  },
  {
    slug: "aquasoil-1-liter",
    name: "Aquasoil nutrisi — kemasan 1 liter",
    category: "substrat",
    price: 28000,
    unit: "kemasan",
    image: "/images/aquasoil.svg",
    gallery: ["/images/aquasoil.svg", "/images/planted-tank.jpg"],
    condition: "New",
    seller: "Taman Air Studio",
    sellerInitials: "TA",
    sellerTier: "Toko",
    verified: true,
    district: "Candisari",
    delivery: "COD & kurir instan",
    posted: "7 jam lalu",
    description:
      "Substrat aktif contoh untuk membantu menopang akar tanaman. Kemasan satu liter cocok untuk mencoba layout kecil atau menambah bagian belakang substrat.\n\nIkuti panduan cycling dan penggantian air produk yang sebenarnya. Merek, komposisi, dan ketersediaan perlu dikonfirmasi kepada penjual.",
    specs: [
      { label: "Isi", value: "1 liter" },
      { label: "Butiran", value: "Normal" },
      { label: "Kemasan", value: "Repack tertutup" },
      { label: "Pemakaian", value: "Substrat tanaman" },
    ],
    tags: ["New", "Siap kirim", "Harga pas"],
  },
  {
    slug: "java-moss-porsi-kecil",
    name: "Java moss rimbun — porsi cup kecil",
    category: "tanaman",
    price: 12000,
    unit: "cup",
    image: "/images/plant-moss.svg",
    gallery: ["/images/plant-moss.svg", "/images/aquascape-hero.jpg"],
    condition: "Trimmingan",
    seller: "Kebun Kecil Raka",
    sellerInitials: "KR",
    sellerTier: "Personal",
    verified: false,
    district: "Tembalang",
    delivery: "COD / meetup",
    posted: "8 jam lalu",
    description:
      "Moss dari pemangkasan tank pribadi untuk ditempelkan pada kayu atau batu. Sebarkan tipis supaya lapisan bawah tetap mendapat sirkulasi.\n\nCocok untuk berlatih merawat moss di tank low-tech. Foto tank merupakan inspirasi, bukan ukuran porsi yang akan diterima.",
    specs: [
      { label: "Porsi", value: "Cup kecil" },
      { label: "Cahaya", value: "Rendah–sedang" },
      { label: "CO₂", value: "Opsional" },
      { label: "Kondisi", value: "Submersed" },
    ],
    tags: ["Trimmingan", "Low-tech", "Bisa barter"],
  },
  {
    slug: "lampu-led-nano-30",
    name: "Lampu LED nano 30 cm, kondisi mulus",
    category: "peralatan",
    price: 95000,
    unit: "unit",
    image: "/images/lamp.svg",
    gallery: [
      "/images/lamp.svg",
      "/images/lamp-side.svg",
      "/images/lamp-parts.svg",
    ],
    condition: "Like New",
    seller: "Nadia Putri",
    sellerInitials: "NP",
    sellerTier: "Personal",
    verified: false,
    district: "Ngaliyan",
    delivery: "COD & kurir instan",
    posted: "10 jam lalu",
    description:
      "Lampu nano bekas pemakaian singkat dengan dudukan dan adaptor. Contoh kondisi: semua LED menyala, bodi bersih, tidak ada retak, lengkap dus.\n\nIlustrasi digunakan selama tahap desain. Periksa kecocokan panjang dudukan, spesifikasi listrik, dan video kondisi aktual sebelum membeli.",
    specs: [
      { label: "Panjang", value: "30 cm" },
      { label: "Daya nominal", value: "10 W (contoh)" },
      { label: "Kelengkapan", value: "Dudukan, adaptor, dus" },
      { label: "Minus", value: "Tidak ada pada contoh" },
    ],
    tags: ["Like New", "Lengkap dus", "COD Semarang"],
  },
];

export function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function filterProducts(filters: {
  query?: string;
  category?: string;
  condition?: string;
  delivery?: string;
  sort?: string;
  saved?: string[];
}) {
  const query = (filters.query ?? "").trim().toLocaleLowerCase("id-ID");
  const result = products.filter((product) => {
    const haystack = [
      product.name,
      product.seller,
      product.district,
      product.condition,
      ...product.tags,
    ]
      .join(" ")
      .toLocaleLowerCase("id-ID");
    return (
      (!query || haystack.includes(query)) &&
      (!filters.category || product.category === filters.category) &&
      (!filters.condition || product.condition === filters.condition) &&
      (!filters.delivery ||
        (filters.delivery === "instant"
          ? product.delivery.includes("instan")
          : product.delivery.includes("COD"))) &&
      (!filters.saved || filters.saved.includes(product.slug))
    );
  });
  if (filters.sort === "price-asc") result.sort((a, b) => a.price - b.price);
  if (filters.sort === "price-desc") result.sort((a, b) => b.price - a.price);
  return result;
}
