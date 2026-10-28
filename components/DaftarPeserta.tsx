"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import IkonMenu from "@/components/IkonMenu";
import {
  getServerSnapshotStatusKarya,
  getSnapshotStatusKarya,
  subscribeStatusKarya,
} from "@/lib/status-karya";

/* ---------- Tipe & konstanta ---------- */

export type Lomba = "Cerita" | "Komik";

export type StatusPeserta =
  | "Menunggu"
  | "Ditinjau"
  | "Diverifikasi"
  | "Ditolak";

export type Peserta = {
  id: string;
  nama: string;
  asal: string; // kampus / sekolah
  lomba: Lomba;
  judulKarya: string | null; // null = belum mengirim karya
  tanggalDaftar: string; // format ISO, contoh "2026-10-03"
  status: StatusPeserta;
};

const STATUS_STYLE: Record<StatusPeserta, string> = {
  Menunggu: "bg-amber-100 text-amber-800",
  Ditinjau: "bg-blue-100 text-blue-800",
  Diverifikasi: "bg-emerald-100 text-emerald-700",
  Ditolak: "bg-rose-100 text-rose-700",
};

/* ---------- Data contoh (ganti dengan data dari database / Google Form) ---------- */

export const DATA_CONTOH: Peserta[] = [
  { id: "1", nama: "Alya Putri", asal: "Universitas Indonesia", lomba: "Cerita", judulKarya: "Suara dari Jakarta #1", tanggalDaftar: "2026-10-03", status: "Menunggu" },
  { id: "2", nama: "Bima Saputra", asal: "SMAN 8 Jakarta", lomba: "Komik", judulKarya: "Suara dari Jakarta #2", tanggalDaftar: "2026-10-03", status: "Diverifikasi" },
  { id: "3", nama: "Citra Lestari", asal: "Universitas Indonesia", lomba: "Cerita", judulKarya: null, tanggalDaftar: "2026-10-04", status: "Menunggu" },
  { id: "4", nama: "Dimas Pratama", asal: "SMAN 8 Jakarta", lomba: "Komik", judulKarya: "Suara dari Jakarta #4", tanggalDaftar: "2026-10-05", status: "Ditinjau" },
  { id: "5", nama: "Elsa Maharani", asal: "Universitas Indonesia", lomba: "Cerita", judulKarya: "Suara dari Jakarta #5", tanggalDaftar: "2026-10-06", status: "Menunggu" },
  { id: "6", nama: "Fajar Nugroho", asal: "SMAN 8 Jakarta", lomba: "Komik", judulKarya: "Suara dari Jakarta #6", tanggalDaftar: "2026-10-06", status: "Diverifikasi" },
  { id: "7", nama: "Gita Wulandari", asal: "Universitas Negeri Jakarta", lomba: "Cerita", judulKarya: "Suara dari Jakarta #7", tanggalDaftar: "2026-10-08", status: "Diverifikasi" },
  { id: "8", nama: "Hendra Wijaya", asal: "Universitas Negeri Jakarta", lomba: "Cerita", judulKarya: "Suara dari Jakarta #8", tanggalDaftar: "2026-10-09", status: "Ditolak" },
  { id: "9", nama: "Intan Permata", asal: "SMAN 3 Jakarta", lomba: "Komik", judulKarya: "Suara dari Jakarta #9", tanggalDaftar: "2026-10-10", status: "Menunggu" },
  { id: "10", nama: "Joko Santoso", asal: "SMAN 3 Jakarta", lomba: "Komik", judulKarya: null, tanggalDaftar: "2026-10-12", status: "Menunggu" },
];

/* ---------- Helper ---------- */

// timeZone UTC supaya tanggal tidak bergeser antara server dan browser
const formatTanggal = (iso: string) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));

function StatusBadge({ status }: { status: StatusPeserta }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLE[status]}`}
    >
      {status}
    </span>
  );
}

/* ---------- Komponen utama ---------- */

type Props = {
  kategori?: Lomba;
  peserta?: Peserta[];
  // Opsional: dipanggil saat baris diklik, misalnya untuk pindah ke halaman detail
  onPilih?: (peserta: Peserta) => void;
};

const NAMA_KATEGORI: Record<Lomba, string> = {
  Cerita: "Cerita HAM",
  Komik: "Komik Bergambar",
};

export default function DaftarPeserta({
  kategori,
  peserta = DATA_CONTOH,
  onPilih,
}: Props) {
  const [kata, setKata] = useState("");
  const snapshotStatus = useSyncExternalStore(
    subscribeStatusKarya,
    getSnapshotStatusKarya,
    getServerSnapshotStatusKarya,
  );
  const jumlahCerita = peserta.filter((p) => p.lomba === "Cerita").length;
  const jumlahKomik = peserta.filter((p) => p.lomba === "Komik").length;
  const pesertaKategori = useMemo(
    () => (kategori ? peserta.filter((p) => p.lomba === kategori) : []),
    [peserta, kategori],
  );

  const hasil = useMemo(() => {
    const q = kata.trim().toLowerCase();
    return pesertaKategori.filter((p) => {
      if (!q) return true;
      return p.nama.toLowerCase().includes(q) || p.asal.toLowerCase().includes(q);
    });
  }, [pesertaKategori, kata]);

  const klikBaris = onPilih ? (p: Peserta) => onPilih(p) : undefined;
  const kelasSubmenu = (pilihan: Lomba) =>
    `block rounded-lg px-3 py-2 text-sm transition-colors ${
      kategori === pilihan
        ? "bg-[#eef3f0] font-semibold text-[#245c4e]"
        : "text-[#52645c] hover:bg-[#f5f7f6] hover:text-[#245c4e]"
    }`;

  return (
    <div className="min-h-screen bg-[#f5f7f6] text-[#183b35] lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-[#e3e8e5] bg-white p-5 lg:flex">
        <div className="flex items-center gap-3">
          <Image src="/assets/logo-kemenham.png" alt="Logo Kementerian Hukum dan HAM RI" width={36} height={36} className="size-9 object-contain" />
          <span className="text-sm font-semibold leading-tight">Kementrian HAM</span>
        </div>
        <nav className="mt-8 flex flex-col gap-2 text-sm" aria-label="Menu utama">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#929d98]">Monitoring &amp; Meninjau</p>
          <Link href="/panitia" className="flex items-center gap-3 rounded-lg px-3 py-2 text-[#52645c] transition-colors hover:bg-[#f5f7f6] hover:text-[#245c4e]"><IkonMenu nama="dashboard" />Dashboard</Link>
          <Link href="/peserta" className="flex items-center gap-3 rounded-lg bg-[#eef3f0] px-3 py-2 font-semibold text-[#245c4e]" aria-current={!kategori ? "page" : undefined}><IkonMenu nama="peserta" />Daftar Peserta</Link>
          <div className="ml-5 space-y-1 border-l-2 border-[#d9e3dd] pl-3">
            <Link href="/peserta/cerita" className={kelasSubmenu("Cerita")} aria-current={kategori === "Cerita" ? "page" : undefined}>Cerita HAM</Link>
            <Link href="/peserta/komik" className={kelasSubmenu("Komik")} aria-current={kategori === "Komik" ? "page" : undefined}>Komik Bergambar</Link>
          </div>
          <Link href="/karya" className="flex items-center gap-3 rounded-lg px-3 py-2 text-[#52645c] transition-colors hover:bg-[#f5f7f6] hover:text-[#245c4e]"><IkonMenu nama="karya" />Daftar Karya Peserta</Link>
          <p className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-wider text-[#929d98]">Pemenang</p>
          <Link href="/kandidat" className="flex items-center gap-3 rounded-lg px-3 py-2 text-[#52645c] transition-colors hover:bg-[#f5f7f6] hover:text-[#245c4e]"><IkonMenu nama="kandidat" />Kandidat Pemenang</Link>
          <Link href="/pemenang" className="flex items-center gap-3 rounded-lg px-3 py-2 text-[#52645c] transition-colors hover:bg-[#f5f7f6] hover:text-[#245c4e]"><IkonMenu nama="pemenang" />Pemenang</Link>
        </nav>
        <div className="mt-auto">
          <p className="text-sm font-semibold">Panitia (contoh)</p>
          <p className="text-xs text-[#718079]">Admin Kemenham</p>
          <Link href="/login" className="mt-3 block rounded-lg border border-[#d9dfdc] py-2 text-center text-sm font-semibold hover:bg-[#f5f7f6]">Keluar</Link>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="flex items-center justify-between border-b border-[#e3e8e5] bg-white px-4 py-3 lg:hidden">
          <span className="flex items-center gap-2 text-sm font-semibold">
            <Image src="/assets/logo-kemenham.png" alt="" width={28} height={28} className="size-7 object-contain" />
            Lomba Hari HAM
          </span>
          <Link href="/login" className="text-sm font-semibold text-[#245c4e]">Keluar</Link>
        </header>
        <nav className="flex gap-2 overflow-x-auto border-b border-[#e3e8e5] bg-white px-4 pb-3 text-sm lg:hidden" aria-label="Menu utama">
          <Link href="/panitia" className="inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-[#52645c] hover:bg-[#f5f7f6] hover:text-[#245c4e]"><IkonMenu nama="dashboard" />Dashboard</Link>
          <Link href="/peserta" className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#eef3f0] px-3 py-2 font-semibold text-[#245c4e]" aria-current={!kategori ? "page" : undefined}><IkonMenu nama="peserta" />Daftar Peserta</Link>
          <Link href="/karya" className="inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-[#52645c] hover:bg-[#f5f7f6] hover:text-[#245c4e]"><IkonMenu nama="karya" />Daftar Karya</Link>
          <Link href="/kandidat" className="inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-[#52645c] hover:bg-[#f5f7f6] hover:text-[#245c4e]"><IkonMenu nama="kandidat" />Kandidat</Link>
          <Link href="/pemenang" className="inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-[#52645c] hover:bg-[#f5f7f6] hover:text-[#245c4e]"><IkonMenu nama="pemenang" />Pemenang</Link>
        </nav>
        <nav className="flex gap-2 overflow-x-auto border-b border-[#e3e8e5] bg-white px-4 py-2 text-sm lg:hidden" aria-label="Kategori peserta">
          <Link href="/peserta/cerita" className={`shrink-0 rounded-lg px-3 py-2 ${kategori === "Cerita" ? "bg-[#eef3f0] font-semibold text-[#245c4e]" : "text-[#52645c] hover:bg-[#f5f7f6]"}`} aria-current={kategori === "Cerita" ? "page" : undefined}>Cerita HAM</Link>
          <Link href="/peserta/komik" className={`shrink-0 rounded-lg px-3 py-2 ${kategori === "Komik" ? "bg-[#eef3f0] font-semibold text-[#245c4e]" : "text-[#52645c] hover:bg-[#f5f7f6]"}`} aria-current={kategori === "Komik" ? "page" : undefined}>Komik Bergambar</Link>
        </nav>

        <main className="mx-auto max-w-6xl space-y-5 p-4 sm:p-7">
          <header>
            <p className="text-sm font-medium text-[#718079]">Monitoring &amp; Meninjau</p>
            <h1 className="mt-1 text-2xl font-semibold">
              {kategori ? `Daftar Peserta ${NAMA_KATEGORI[kategori]}` : "Daftar Peserta"}
            </h1>
            <p className="mt-1 text-sm text-[#718079]">
              {kategori
                ? `Kelola peserta yang terdaftar pada lomba ${NAMA_KATEGORI[kategori]}.`
                : "Pilih kategori lomba untuk melihat daftar peserta."}
            </p>
          </header>
          {snapshotStatus.error && (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">
              Status karya tidak dapat dimuat: {snapshotStatus.error}
            </p>
          )}

          {!kategori ? (
            <section aria-label="Pilih kategori lomba" className="grid gap-4 md:grid-cols-2">
              {(["Cerita", "Komik"] as const).map((pilihan) => (
                <Link
                  key={pilihan}
                  href={pilihan === "Cerita" ? "/peserta/cerita" : "/peserta/komik"}
                  className="group overflow-hidden rounded-xl border-2 border-[#52645c] bg-white shadow-sm transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245c4e]"
                >
                  <div aria-hidden="true" className="h-1.5 bg-gradient-to-r from-emerald-600 via-teal-400 to-amber-400" />
                  <div className="flex items-center justify-between gap-4 p-5">
                    <div>
                      <h2 className="text-lg font-semibold group-hover:text-[#245c4e]">{NAMA_KATEGORI[pilihan]}</h2>
                      <p className="mt-1 text-sm text-[#718079]">Lihat daftar peserta lomba</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-[#eef3f0] px-3 py-1 text-sm font-semibold text-[#245c4e]">
                      {pilihan === "Cerita" ? jumlahCerita : jumlahKomik} peserta
                    </span>
                  </div>
                </Link>
              ))}
            </section>
          ) : (
          <>
          <section aria-label={`Ringkasan peserta ${NAMA_KATEGORI[kategori]}`} className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <article className="rounded-xl border-2 border-[#52645c] border-t-4 border-t-emerald-600 bg-white p-5 shadow-sm">
              <p className="text-sm text-[#718079]">Total peserta</p>
              <p className="mt-2 text-2xl font-semibold">{pesertaKategori.length}</p>
            </article>
            <article className="rounded-xl border-2 border-[#52645c] border-t-4 border-t-blue-500 bg-white p-5 shadow-sm">
              <p className="text-sm text-[#718079]">Sudah mengirim karya</p>
              <p className="mt-2 text-2xl font-semibold">{pesertaKategori.filter((p) => p.judulKarya !== null).length}</p>
            </article>
            <article className="rounded-xl border-2 border-[#52645c] border-t-4 border-t-violet-500 bg-white p-5 shadow-sm">
              <p className="text-sm text-[#718079]">Belum mengirim karya</p>
              <p className="mt-2 text-2xl font-semibold">{pesertaKategori.filter((p) => p.judulKarya === null).length}</p>
            </article>
          </section>

          <section className="overflow-hidden rounded-xl border-2 border-[#52645c] bg-white shadow-sm">
            <div aria-hidden="true" className="h-1.5 bg-gradient-to-r from-blue-600 via-cyan-400 to-emerald-500" />
            <div className="border-b border-[#eef1ef] p-5">
              <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-end">
                <div>
                  <h2 className="font-semibold">Data peserta {NAMA_KATEGORI[kategori]}</h2>
                  <p className="mt-1 text-sm text-[#718079]">Cari peserta berdasarkan nama atau asal.</p>
                </div>
                <p className="text-sm text-[#718079]" aria-live="polite">{hasil.length} peserta ditemukan</p>
              </div>
              <div className="mt-4">
                <div className="flex-1">
                  <label htmlFor="cari-peserta" className="sr-only">Cari peserta</label>
                  <input
                    id="cari-peserta"
                    type="search"
                    value={kata}
                    onChange={(e) => setKata(e.target.value)}
                    placeholder="Cari nama atau asal peserta"
                    className="h-11 w-full rounded-lg border border-[#d9e0dc] bg-white px-4 text-sm placeholder:text-[#929d98] focus:border-[#245c4e] focus:outline-none focus:ring-2 focus:ring-[#245c4e]/20"
                  />
                </div>
              </div>
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-[#f8faf9]">
                  <tr className="border-b border-[#e3e9e5] text-[11px] font-semibold uppercase tracking-wider text-[#7a8681]">
                    <th scope="col" className="px-5 py-3">Peserta</th>
                    <th scope="col" className="py-3 pr-4">Lomba</th>
                    <th scope="col" className="py-3 pr-4">Daftar</th>
                    <th scope="col" className="py-3 pr-5">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {hasil.map((p) => (
                    <tr
                      key={p.id}
                      onClick={klikBaris ? () => klikBaris(p) : undefined}
                      className={`border-b border-[#eef1ef] last:border-0 ${
                        klikBaris ? "cursor-pointer hover:bg-[#f6f9f7]" : ""
                      }`}
                    >
                      <td className="px-5 py-4">
                        <div className="font-semibold">{p.nama}</div>
                        <div className="text-xs text-[#6b7873]">{p.asal}</div>
                      </td>
                      <td className="py-4 pr-4">{p.lomba}</td>
                      <td className="whitespace-nowrap py-4 pr-4">{formatTanggal(p.tanggalDaftar)}</td>
                      <td className="py-4 pr-5"><StatusBadge status={snapshotStatus.status[`peserta-${p.id}`] ?? p.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-[#eef1ef] px-5 md:hidden">
              {hasil.map((p) => (
                <li
                  key={p.id}
                  onClick={klikBaris ? () => klikBaris(p) : undefined}
                  className={`flex flex-col gap-2 py-4 ${klikBaris ? "cursor-pointer" : ""}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold">{p.nama}</div>
                      <div className="text-xs text-[#6b7873]">{p.asal}</div>
                    </div>
                    <StatusBadge status={snapshotStatus.status[`peserta-${p.id}`] ?? p.status} />
                  </div>
                  <div className="text-xs text-[#6b7873]">{p.lomba} · Daftar {formatTanggal(p.tanggalDaftar)}</div>
                </li>
              ))}
            </ul>

            {hasil.length === 0 && (
              <p className="px-5 py-12 text-center text-sm text-[#6b7873]">
                Tidak ada peserta yang cocok. Coba ubah kata kunci.
              </p>
            )}
          </section>
          </>
          )}
        </main>
      </div>
    </div>
  );
}
