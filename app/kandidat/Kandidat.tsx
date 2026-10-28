"use client";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import IkonMenu from "@/components/IkonMenu";
import { PESERTA, type Lomba } from "@/lib/data";
import {
  getServerSnapshotStatusKarya,
  getSnapshotStatusKarya,
  subscribeStatusKarya,
  type StatusKarya,
} from "@/lib/status-karya";

// Halaman Kandidat Pemenang (satu file). Taruh di app/kandidat/page.tsx.
// Nilai juri di bawah masih data contoh (sama dengan halaman Pemenang); nanti diganti dari database.

type Nilai = { tema: number; orisinalitas: number; kualitas: number };

type Kandidat = {
  id: number;
  nama: string;
  asal: string;
  lomba: Lomba;
  judul: string;
  tema: number;
  orisinalitas: number;
  kualitas: number;
  total: number; // rata-rata tiga nilai, satu angka desimal
  peringkat: number; // nilai akhir sama = peringkat sama
};

// Berapa karya teratas yang dianggap kandidat di tiap lomba.
const KUOTA_KANDIDAT = 10;

const NILAI_JURI: Record<number, Nilai> = {
  1: { tema: 88, orisinalitas: 84, kualitas: 90 },
  5: { tema: 92, orisinalitas: 90, kualitas: 87 },
  7: { tema: 85, orisinalitas: 91, kualitas: 89 },
  2: { tema: 90, orisinalitas: 86, kualitas: 88 },
  4: { tema: 82, orisinalitas: 88, kualitas: 85 },
  6: { tema: 91, orisinalitas: 89, kualitas: 92 },
  9: { tema: 80, orisinalitas: 83, kualitas: 78 },
};

const rataRata = (n: Nilai) =>
  Math.round(((n.tema + n.orisinalitas + n.kualitas) / 3) * 10) / 10;

function hitungKandidat(
  lomba: Lomba,
  statusTersimpan: Record<string, StatusKarya>,
): Kandidat[] {
  const layak = PESERTA.flatMap((p) => {
    const nilai = NILAI_JURI[p.id];
    const status = statusTersimpan[`peserta-${p.id}`] ?? p.status;
    if (!nilai || p.judul === null || p.lomba !== lomba || status === "Ditolak") return [];
    return [
      {
        id: p.id,
        nama: p.nama,
        asal: p.asal,
        lomba: p.lomba,
        judul: p.judul,
        ...nilai,
        total: rataRata(nilai),
      },
    ];
  });

  layak.sort((a, b) => b.total - a.total || a.nama.localeCompare(b.nama, "id"));
  return layak
    .map((p) => ({ ...p, peringkat: 1 + layak.filter((q) => q.total > p.total).length }))
    .slice(0, KUOTA_KANDIDAT);
}

type Aktif = "dashboard" | "peserta" | "karya" | "kandidat" | "pemenang";

const MENU: { kunci: Aktif; href: string; label: string; labelPendek: string }[] = [
  { kunci: "dashboard", href: "/panitia", label: "Dashboard", labelPendek: "Dashboard" },
  { kunci: "peserta", href: "/peserta", label: "Daftar Peserta", labelPendek: "Daftar Peserta" },
  { kunci: "karya", href: "/karya", label: "Daftar Karya Peserta", labelPendek: "Daftar Karya" },
];

const aktifKelas = "flex items-center gap-3 rounded-lg bg-[#eef3f0] px-3 py-2 font-semibold text-[#245c4e]";
const biasaKelas =
  "flex items-center gap-3 rounded-lg px-3 py-2 text-[#52645c] transition-colors hover:bg-[#f5f7f6] hover:text-[#245c4e]";

function SidebarPanitia({ aktif, kategori }: { aktif: Aktif; kategori?: Lomba }) {
  const kelasSubmenu = (pilihan: Lomba) =>
    `block rounded-lg px-3 py-2 text-sm transition-colors ${
      kategori === pilihan
        ? "bg-[#eef3f0] font-semibold text-[#245c4e]"
        : "text-[#52645c] hover:bg-[#f5f7f6] hover:text-[#245c4e]"
    }`;

  return (
    <aside className="sticky top-0 hidden h-screen flex-col border-r border-[#e3e8e5] bg-white p-5 lg:flex">
      <div className="flex items-center gap-3">
        <Image src="/assets/logo-kemenham.png" alt="Logo Kementerian Hukum dan HAM RI" width={36} height={36} className="size-9 object-contain" />
        <span className="text-sm font-semibold leading-tight">Kementerian HAM</span>
      </div>
      <nav className="mt-8 flex flex-col gap-2 text-sm" aria-label="Menu utama">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#929d98]">Monitoring & Meninjau</p>
        {MENU.map((m) => (
          <Link key={m.kunci} href={m.href} className={aktif === m.kunci ? aktifKelas : biasaKelas} aria-current={aktif === m.kunci ? "page" : undefined}>
            <IkonMenu nama={m.kunci} />
            {m.label}
          </Link>
        ))}
        <p className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-wider text-[#929d98]">Pemenang</p>
        <Link
          href="/kandidat"
          className={aktif === "kandidat" ? aktifKelas : biasaKelas}
          aria-current={aktif === "kandidat" ? "page" : undefined}
        >
          <IkonMenu nama="kandidat" />
          Kandidat Pemenang
        </Link>
        {aktif === "kandidat" && (
          <div className="ml-5 space-y-1 border-l-2 border-[#d9e3dd] pl-3">
            <Link href="/kandidat/cerita" className={kelasSubmenu("Cerita")} aria-current={kategori === "Cerita" ? "page" : undefined}>Cerita HAM</Link>
            <Link href="/kandidat/komik" className={kelasSubmenu("Komik")} aria-current={kategori === "Komik" ? "page" : undefined}>Komik Bergambar</Link>
          </div>
        )}
        <Link
          href="/pemenang"
          className={aktif === "pemenang" ? aktifKelas : biasaKelas}
          aria-current={aktif === "pemenang" ? "page" : undefined}
        >
          <IkonMenu nama="pemenang" />
          Pemenang
        </Link>
      </nav>
      <div className="mt-auto">
        <p className="text-sm font-semibold">Panitia (contoh)</p>
        <p className="text-xs text-[#718079]">Admin Kemenham</p>
        <Link href="/login" className="mt-3 block rounded-lg border border-[#d9dfdc] py-2 text-center text-sm font-semibold hover:bg-[#f5f7f6]">Keluar</Link>
      </div>
    </aside>
  );
}

// Bar atas + menu untuk layar kecil
function BarAtasPanitia({ aktif, kategori }: { aktif: Aktif; kategori?: Lomba }) {
  const semuaMenu = [
    ...MENU.map((m) => ({ kunci: m.kunci, href: m.href, label: m.labelPendek })),
    { kunci: "kandidat" as Aktif, href: "/kandidat", label: "Kandidat" },
    { kunci: "pemenang" as Aktif, href: "/pemenang", label: "Pemenang" },
  ];
  return (
    <>
      <header className="flex items-center justify-between border-b border-[#e3e8e5] bg-white px-4 py-3 lg:hidden">
        <span className="flex items-center gap-2 text-sm font-semibold">
          <Image src="/assets/logo-kemenham.png" alt="" width={28} height={28} className="size-7 object-contain" />
          Lomba Hari HAM
        </span>
        <Link href="/login" className="text-sm font-semibold text-[#245c4e]">Keluar</Link>
      </header>
      <nav className="flex gap-2 overflow-x-auto border-b border-[#e3e8e5] bg-white px-4 pb-3 text-sm lg:hidden" aria-label="Menu utama">
        {semuaMenu.map((m) => (
          <Link
            key={m.kunci}
            href={m.href}
            className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 ${aktif === m.kunci ? "bg-[#eef3f0] font-semibold text-[#245c4e]" : "text-[#52645c] hover:bg-[#f5f7f6] hover:text-[#245c4e]"}`}
            aria-current={aktif === m.kunci ? "page" : undefined}
          >
            <IkonMenu nama={m.kunci} />
            {m.label}
          </Link>
        ))}
      </nav>
      {aktif === "kandidat" && (
        <nav className="flex gap-2 overflow-x-auto border-b border-[#e3e8e5] bg-white px-4 py-2 text-sm lg:hidden" aria-label="Kategori kandidat">
          <Link href="/kandidat/cerita" className={`shrink-0 rounded-lg px-3 py-2 ${kategori === "Cerita" ? "bg-[#eef3f0] font-semibold text-[#245c4e]" : "text-[#52645c] hover:bg-[#f5f7f6]"}`} aria-current={kategori === "Cerita" ? "page" : undefined}>Cerita HAM</Link>
          <Link href="/kandidat/komik" className={`shrink-0 rounded-lg px-3 py-2 ${kategori === "Komik" ? "bg-[#eef3f0] font-semibold text-[#245c4e]" : "text-[#52645c] hover:bg-[#f5f7f6]"}`} aria-current={kategori === "Komik" ? "page" : undefined}>Komik Bergambar</Link>
        </nav>
      )}
    </>
  );
}

const LOMBA: { nilai: Lomba; label: string }[] = [
  { nilai: "Cerita", label: "Lomba Cerita" },
  { nilai: "Komik", label: "Lomba Komik" },
];

// Gaya baris peringkat 1, 2, 3: lencana dan sorotan gradasi di sisi kiri
const TOP3 = [
  { garis: "#d99a50", latar: "#fbf1dc" },
  { garis: "#8a9a93", latar: "#eef1ef" },
  { garis: "#b8703a", latar: "#f8e9dc" },
];

const input =
  "h-10 rounded-lg border border-[#d9dfdc] bg-white px-3 text-sm text-[#183b35] outline-none placeholder:text-[#929d98] focus:border-[#245c4e] focus:ring-2 focus:ring-[#245c4e]/20";

const inisial = (nama: string) =>
  nama
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();

// Ilustrasi piala bergaya garis, mengikuti referensi
function IlustrasiPiala() {
  return (
    <svg viewBox="0 0 220 130" className="h-28 w-auto sm:h-32" aria-hidden="true" fill="none">
      {/* percikan */}
      <g stroke="#52645c" strokeWidth="1.6" strokeLinecap="round" opacity="0.7">
        <path d="M110 6v14" />
        <path d="M62 18l9 11" />
        <path d="M158 18l-9 11" />
        <path d="M30 52l13 4" />
        <path d="M190 52l-13 4" />
      </g>
      {/* gagang */}
      <path d="M60 58c-16 0-22 8-22 18 0 12 12 20 28 20" stroke="#52645c" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M160 58c16 0 22 8 22 18 0 12-12 20-28 20" stroke="#52645c" strokeWidth="2.2" strokeLinecap="round" />
      {/* cawan */}
      <path d="M56 46h108v22c0 26-24 44-54 44s-54-18-54-44V46z" fill="#fbf1dc" stroke="#52645c" strokeWidth="2.2" strokeLinejoin="round" />
      <ellipse cx="110" cy="46" rx="54" ry="8" fill="#f8e9dc" stroke="#52645c" strokeWidth="2.2" />
      {/* kilau */}
      <path d="M78 66c2 14 10 24 22 29" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
      {/* alas */}
      <rect x="86" y="112" width="48" height="8" rx="2" fill="#fff" stroke="#52645c" strokeWidth="2.2" />
    </svg>
  );
}

function BarisKandidat({ p }: { p: Kandidat }) {
  const top = p.peringkat <= 3 ? TOP3[p.peringkat - 1] : null;
  return (
    <li
      className="grid items-center gap-3 rounded-xl border border-[#e3e8e5] bg-white p-3 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:gap-4 sm:px-4"
      style={top ? { background: `linear-gradient(90deg, ${top.latar} 0%, #ffffff 65%)`, borderColor: top.garis + "55" } : undefined}
    >
      <div className="flex items-center gap-3 sm:contents">
        {/* Peringkat */}
        <span
          className="grid size-9 shrink-0 place-items-center rounded-full border-2 text-sm font-black text-[#24312b]"
          style={top ? { borderColor: top.garis, backgroundColor: top.latar } : { borderColor: "#d9dfdc", backgroundColor: "#fff", color: "#52645c" }}
          role="img"
          aria-label={`Peringkat ${p.peringkat}`}
        >
          {p.peringkat}
        </span>

        {/* Peserta */}
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#eef3f0] text-xs font-bold text-[#245c4e]" aria-hidden="true">
            {inisial(p.nama)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-bold">{p.nama}</p>
            <p className="truncate text-xs text-[#718079]">{p.asal}</p>
          </div>
        </div>
      </div>

      <Link
        href={`/juri/peringkat-${p.id}?kategoriKandidat=${p.lomba}`}
        className="inline-flex h-9 items-center justify-center rounded-lg bg-[#245c4e] px-4 text-xs font-bold text-white transition-colors hover:bg-[#1b493e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245c4e]"
      >
        Tinjau karya
      </Link>
    </li>
  );
}

function DaftarKandidat({ kategori }: { kategori?: Lomba }) {
  const [q, setQ] = useState("");
  const snapshotStatus = useSyncExternalStore(
    subscribeStatusKarya,
    getSnapshotStatusKarya,
    getServerSnapshotStatusKarya,
  );

  const semua = useMemo(
    () => (kategori ? hitungKandidat(kategori, snapshotStatus.status) : []),
    [kategori, snapshotStatus.status],
  );
  const kata = q.trim().toLowerCase();
  const tampil = semua.filter((p) => `${p.nama} ${p.asal} ${p.judul}`.toLowerCase().includes(kata));

  return (
    <div className="space-y-5">
      {kategori && (
        <Link
          href="/kandidat"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#d9dfdc] bg-white px-4 text-sm font-semibold text-[#245c4e] shadow-sm transition-colors hover:bg-[#f5f7f6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245c4e] lg:hidden"
        >
          <span aria-hidden="true">←</span>
          Kembali ke Kandidat Pemenang
        </Link>
      )}
      {/* Banner */}
      <section className="flex flex-col items-center gap-3 rounded-2xl border border-[#e3e8e5] bg-white px-4 py-6 text-center shadow-sm sm:py-8">
        <IlustrasiPiala />
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">Kandidat Pemenang</h1>
          <p className="mx-auto mt-1 max-w-md text-sm text-[#718079]">
            Karya dengan nilai juri tertinggi. Tinjau tiap karya sebelum ditetapkan sebagai pemenang.
          </p>
        </div>
      </section>

      {!kategori ? (
        <section aria-label="Pilih kategori lomba" className="grid gap-4 md:grid-cols-2">
          {LOMBA.map((lomba) => (
            <Link
              key={lomba.nilai}
              href={lomba.nilai === "Cerita" ? "/kandidat/cerita" : "/kandidat/komik"}
              className="group overflow-hidden rounded-xl border-2 border-[#52645c] bg-white shadow-sm transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245c4e]"
            >
              <div aria-hidden="true" className="h-1.5 bg-gradient-to-r from-emerald-600 via-teal-400 to-amber-400" />
              <div className="flex items-center justify-between gap-4 p-5">
                <div>
                  <h2 className="text-lg font-semibold group-hover:text-[#245c4e]">
                    {lomba.nilai === "Cerita" ? "Cerita HAM" : "Komik Bergambar"}
                  </h2>
                  <p className="mt-1 text-sm text-[#718079]">Lihat dan tinjau kandidat pemenang</p>
                </div>
                <span className="shrink-0 rounded-full bg-[#eef3f0] px-3 py-1 text-sm font-semibold text-[#245c4e]">
                    {hitungKandidat(lomba.nilai, snapshotStatus.status).length} kandidat
                </span>
              </div>
            </Link>
          ))}
        </section>
      ) : (
      <section className="rounded-2xl border border-[#e3e8e5] bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">
              Kandidat {kategori === "Cerita" ? "Cerita HAM" : "Komik Bergambar"}
            </h2>
            <p className="mt-1 text-sm text-[#718079]">Kandidat diurutkan dari nilai tertinggi.</p>
          </div>
          <input
            className={`${input} w-full sm:w-64`}
            placeholder="Cari nama, asal, atau judul"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Cari kandidat"
          />
        </div>

        <p className="mb-3 text-xs text-[#718079]">
          {semua.length} kandidat, diurutkan dari nilai tertinggi
        </p>
        {snapshotStatus.error && (
          <p className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">
            Status karya tidak dapat dimuat: {snapshotStatus.error}
          </p>
        )}

        {tampil.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[#d9dfdc] py-10 text-center text-sm text-[#718079]">
            {semua.length === 0 ? "Belum ada karya yang dinilai di kategori ini." : "Tidak ada kandidat yang cocok dengan pencarian."}
          </p>
        ) : (
          <ol className="space-y-2">
            {tampil.map((p) => (
              <BarisKandidat key={p.id} p={p} />
            ))}
          </ol>
        )}
      </section>
      )}
    </div>
  );
}

export default function KandidatPage({ kategori }: { kategori?: Lomba }) {
  return (
    <div className="min-h-screen bg-[#f5f7f6] text-[#183b35] lg:grid lg:grid-cols-[240px_1fr]">
      <SidebarPanitia aktif="kandidat" kategori={kategori} />
      <div className="min-w-0">
        <BarAtasPanitia aktif="kandidat" kategori={kategori} />
        <main className="mx-auto max-w-6xl p-4 sm:p-7">
          <DaftarKandidat kategori={kategori} />
        </main>
      </div>
    </div>
  );
}
