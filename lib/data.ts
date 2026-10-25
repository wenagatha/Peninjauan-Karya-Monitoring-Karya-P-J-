export type Lomba = "Cerita" | "Komik";
export type Status = "Terdaftar" | "Karya terkirim" | "Diverifikasi" | "Perlu revisi" | "Ditolak";

export type Peserta = {
  id: number;
  nama: string;
  asal: string;
  lomba: Lomba;
  judul: string | null;
  daftar: string; // format YYYY-MM-DD
  status: Status;
};

export const BADGE: Record<Status, string> = {
  "Terdaftar": "bg-slate-100 text-slate-600",
  "Karya terkirim": "bg-sky-100 text-sky-700",
  "Diverifikasi": "bg-emerald-100 text-emerald-700",
  "Perlu revisi": "bg-amber-100 text-amber-700",
  "Ditolak": "bg-rose-100 text-rose-700",
};

const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
export function tanggal(iso: string, tahun = true) {
  const [y, m, d] = iso.split("-");
  return `${Number(d)} ${BULAN[Number(m) - 1]}${tahun ? " " + y : ""}`;
}

// Data contoh. Nanti diganti dengan data dari database.
export const PESERTA: Peserta[] = [
  { id: 1, nama: "Alya Putri", asal: "Universitas Indonesia", lomba: "Cerita", judul: "Suara dari Jakarta #1", daftar: "2026-10-03", status: "Karya terkirim" },
  { id: 2, nama: "Bima Saputra", asal: "SMAN 8 Jakarta", lomba: "Komik", judul: "Suara dari Jakarta #2", daftar: "2026-10-03", status: "Diverifikasi" },
  { id: 3, nama: "Citra Lestari", asal: "Universitas Indonesia", lomba: "Cerita", judul: null, daftar: "2026-10-04", status: "Terdaftar" },
  { id: 4, nama: "Dimas Pratama", asal: "SMAN 8 Jakarta", lomba: "Komik", judul: "Suara dari Jakarta #4", daftar: "2026-10-05", status: "Perlu revisi" },
  { id: 5, nama: "Elsa Maharani", asal: "Universitas Indonesia", lomba: "Cerita", judul: "Suara dari Jakarta #5", daftar: "2026-10-06", status: "Karya terkirim" },
  { id: 6, nama: "Fajar Nugroho", asal: "SMAN 8 Jakarta", lomba: "Komik", judul: "Suara dari Jakarta #6", daftar: "2026-10-06", status: "Diverifikasi" },
  { id: 7, nama: "Gita Wulandari", asal: "Universitas Negeri Jakarta", lomba: "Cerita", judul: "Suara dari Jakarta #7", daftar: "2026-10-08", status: "Diverifikasi" },
  { id: 8, nama: "Hendra Wijaya", asal: "Universitas Negeri Jakarta", lomba: "Cerita", judul: "Suara dari Jakarta #8", daftar: "2026-10-09", status: "Ditolak" },
  { id: 9, nama: "Intan Permata", asal: "SMAN 3 Jakarta", lomba: "Komik", judul: "Suara dari Jakarta #9", daftar: "2026-10-10", status: "Karya terkirim" },
  { id: 10, nama: "Joko Santoso", asal: "SMAN 3 Jakarta", lomba: "Komik", judul: null, daftar: "2026-10-12", status: "Terdaftar" },
];
