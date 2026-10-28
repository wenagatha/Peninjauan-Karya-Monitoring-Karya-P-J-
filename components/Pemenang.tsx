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

// Halaman Pemenang (satu file). Taruh di app/pemenang/page.tsx.
// Nilai juri di bawah masih data contoh; nanti diganti dari database.

type Nilai = { tema: number; orisinalitas: number; kualitas: number };

type Peringkat = {
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

// Data contoh, kunci = id peserta di lib/data.ts. Nanti diganti dengan nilai asli dari juri.
// Ketiga kriteria (tema, orisinalitas, kualitas) juga contoh: sesuaikan dengan kriteria penilaian lomba.
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

// Karya yang masuk peringkat: sudah punya nilai juri dan statusnya bukan "Ditolak".
// Kalau hanya karya "Diverifikasi" yang boleh jadi pemenang, ubah syarat di bawah.
function hitungPeringkat(
  lomba: Lomba,
  statusTersimpan: Record<string, StatusKarya>,
): Peringkat[] {
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
  return layak.map((p) => ({
    ...p,
    peringkat: 1 + layak.filter((q) => q.total > p.total).length,
  }));
}

type Aktif = "dashboard" | "peserta" | "karya" | "pemenang";

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
        <Link href="/kandidat" className={biasaKelas}><IkonMenu nama="kandidat" />Kandidat Pemenang</Link>
        <Link href="/pemenang" className={aktif === "pemenang" ? aktifKelas : biasaKelas} aria-current={aktif === "pemenang" ? "page" : undefined}>
          <IkonMenu nama="pemenang" />
          Pemenang
        </Link>
        {aktif === "pemenang" && (
          <div className="ml-5 space-y-1 border-l-2 border-[#d9e3dd] pl-3">
            <Link href="/pemenang/cerita" className={kelasSubmenu("Cerita")} aria-current={kategori === "Cerita" ? "page" : undefined}>Cerita HAM</Link>
            <Link href="/pemenang/komik" className={kelasSubmenu("Komik")} aria-current={kategori === "Komik" ? "page" : undefined}>Komik Bergambar</Link>
          </div>
        )}
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
        {[...MENU.map((m) => ({ kunci: m.kunci, href: m.href, label: m.labelPendek })), { kunci: "kandidat" as Aktif, href: "/kandidat", label: "Kandidat" }, { kunci: "pemenang" as Aktif, href: "/pemenang", label: "Pemenang" }].map((m) => (
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
      {aktif === "pemenang" && (
        <nav className="flex gap-2 overflow-x-auto border-b border-[#e3e8e5] bg-white px-4 py-2 text-sm lg:hidden" aria-label="Kategori pemenang">
          <Link href="/pemenang/cerita" className={`shrink-0 rounded-lg px-3 py-2 ${kategori === "Cerita" ? "bg-[#eef3f0] font-semibold text-[#245c4e]" : "text-[#52645c] hover:bg-[#f5f7f6]"}`} aria-current={kategori === "Cerita" ? "page" : undefined}>Cerita HAM</Link>
          <Link href="/pemenang/komik" className={`shrink-0 rounded-lg px-3 py-2 ${kategori === "Komik" ? "bg-[#eef3f0] font-semibold text-[#245c4e]" : "text-[#52645c] hover:bg-[#f5f7f6]"}`} aria-current={kategori === "Komik" ? "page" : undefined}>Komik Bergambar</Link>
        </nav>
      )}
    </>
  );
}


const LOMBA: { nilai: Lomba; label: string }[] = [
  { nilai: "Cerita", label: "Lomba Cerita" },
  { nilai: "Komik", label: "Lomba Komik" },
];

const NAMA_LOMBA: Record<Lomba, string> = {
  Cerita: "Lomba Cerita",
  Komik: "Lomba Komik",
};

// Warna medali menurut peringkat 1, 2, 3
const MEDALI = [
  { garis: "#d99a50", latar: "#fbf1dc" },
  { garis: "#8a9a93", latar: "#eef1ef" },
  { garis: "#b8703a", latar: "#f8e9dc" },
];

const input = "h-10 rounded-lg border border-[#d9dfdc] bg-white px-3 text-sm text-[#183b35] outline-none placeholder:text-[#929d98] focus:border-[#245c4e] focus:ring-2 focus:ring-[#245c4e]/20";
const KELAS_PODIUM: Record<number, string> = {
  1: "order-2 sm:-translate-y-3 border-[#245c4e] border-t-4 border-t-[#245c4e] bg-white",
  2: "order-1 border-[#8a9a93] border-t-4 border-t-[#8a9a93] bg-white",
  3: "order-3 border-[#b8703a] border-t-4 border-t-[#b8703a] bg-white",
};

function PemenangRanking({ kategori }: { kategori?: Lomba }) {
  const [q, setQ] = useState("");
  const snapshotStatus = useSyncExternalStore(
    subscribeStatusKarya,
    getSnapshotStatusKarya,
    getServerSnapshotStatusKarya,
  );

  const semua = useMemo(
    () => (kategori ? hitungPeringkat(kategori, snapshotStatus.status) : []),
    [kategori, snapshotStatus.status],
  );
  const tiga = semua.slice(0, 3);
  const sisa = semua.slice(3, 10);

  const kata = q.trim().toLowerCase();
  const tampil = sisa
    .filter((p) => `${p.nama} ${p.asal} ${p.judul}`.toLowerCase().includes(kata));

  if (!kategori) {
    return (
      <section aria-label="Pilih kategori lomba" className="grid gap-4 md:grid-cols-2">
        {LOMBA.map((lomba) => (
          <Link
            key={lomba.nilai}
            href={lomba.nilai === "Cerita" ? "/pemenang/cerita" : "/pemenang/komik"}
            className="group overflow-hidden rounded-xl border-2 border-[#52645c] bg-white shadow-sm transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245c4e]"
          >
            <div aria-hidden="true" className="h-1.5 bg-gradient-to-r from-emerald-600 via-teal-400 to-amber-400" />
            <div className="flex items-center justify-between gap-4 p-5">
              <div>
                <h2 className="text-lg font-semibold group-hover:text-[#245c4e]">
                  {lomba.nilai === "Cerita" ? "Cerita HAM" : "Komik Bergambar"}
                </h2>
                <p className="mt-1 text-sm text-[#718079]">Lihat papan peringkat pemenang lomba</p>
              </div>
              <span className="shrink-0 rounded-full bg-[#eef3f0] px-3 py-1 text-sm font-semibold text-[#245c4e]">
                {hitungPeringkat(lomba.nilai, snapshotStatus.status).length} peserta
              </span>
            </div>
          </Link>
        ))}
      </section>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-[#52645c] bg-[#f5f7f6] p-4 text-[#183b35] shadow-sm sm:p-7">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#718079]">Papan peringkat</p>
          <h2 className="mt-1 text-xl font-bold sm:text-2xl">{kategori === "Cerita" ? "Cerita HAM" : "Komik Bergambar"}</h2>
        </div>
      </div>

      <section aria-labelledby="judul-tiga">
        {snapshotStatus.error && (
          <p className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">
            Status karya tidak dapat dimuat: {snapshotStatus.error}
          </p>
        )}
        <h2 id="judul-tiga" className="mb-5 text-center text-lg font-bold uppercase tracking-[0.16em] text-[#245c4e] sm:text-xl">
          Pemenang {kategori === "Cerita" ? "Cerita HAM" : "Komik Bergambar"}
        </h2>
        {tiga.length === 0 ? (
          <p className="rounded-xl border border-[#d9dfdc] bg-white p-8 text-center text-sm text-[#718079]">Belum ada karya yang dinilai di kategori ini.</p>
        ) : (
          <ol className="grid items-stretch gap-4 sm:grid-cols-3 sm:gap-3">
            {tiga.map((p) => {
              const medali = MEDALI[Math.min(p.peringkat, 3) - 1];
              return (
                  <li
                    key={p.id}
                    className={`relative flex min-h-48 flex-col overflow-hidden rounded-2xl border p-4 text-[#183b35] shadow-sm transition-transform sm:p-5 ${KELAS_PODIUM[p.peringkat]}`}
                  >
                    <div aria-hidden="true" className="pointer-events-none absolute -right-5 -top-7 select-none text-[120px] leading-none opacity-[0.06]">
                      🏆
                    </div>

                    {/* Atas: nama, lomba, asal sekolah + badge peringkat */}
                    <div className="relative flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-lg font-extrabold uppercase leading-tight sm:text-xl">{p.nama}</p>
                        <p className="mt-2 truncate text-xs font-semibold text-[#245c4e]">{NAMA_LOMBA[p.lomba]}</p>
                        <p className="truncate text-xs text-[#718079]">{p.asal}</p>
                      </div>
                      <span
                        className="grid size-10 shrink-0 place-items-center rounded-full border-2 text-base font-black shadow-md"
                        style={{ borderColor: medali.garis, backgroundColor: medali.latar, color: "#24312b" }}
                        role="img"
                        aria-label={`Peringkat ${p.peringkat}`}
                      >
                        {p.peringkat}
                      </span>
                    </div>

                    {/* Bawah: hanya tombol */}
                    <div className="relative mt-auto pt-5">
                      <Link
                        href={`/juri/peringkat-${p.id}?kategoriPemenang=${kategori}`}
                        className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-[#245c4e] px-3 text-xs font-bold text-white transition-colors hover:bg-[#1b493e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245c4e]"
                      >
                        Tinjau karya
                      </Link>
                    </div>
                  </li>
                );
            })}
          </ol>
        )}
      </section>

      <section className="mt-6 overflow-hidden rounded-xl border-2 border-[#52645c] bg-white shadow-sm">
        <div className="h-1.5 bg-gradient-to-r from-emerald-600 to-teal-400" />
        <div className="p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Peringkat 4-10</h2>
              <p className="mt-0.5 text-xs text-[#718079]">Peserta dengan peringkat berikutnya</p>
            </div>
            <input
              className={`${input} w-full sm:w-56`}
              placeholder="Cari nama, asal, atau judul"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Cari karya"
            />
          </div>

          <div className="space-y-2">
            {tampil.map((p) => (
              <article key={p.id} className="grid gap-4 rounded-xl border border-[#e3e8e5] bg-[#f5f7f6] p-3 sm:grid-cols-[minmax(170px,1fr)_auto] sm:items-center sm:px-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="grid size-10 shrink-0 place-items-center rounded-full border border-[#d9dfdc] bg-white text-xs font-bold text-[#245c4e]"
                    aria-label={`Peringkat ${p.peringkat}`}
                  >
                    {p.peringkat}<sup>th</sup>
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-bold">{p.nama}</p>
                    <p className="truncate text-xs font-semibold text-[#245c4e]">{NAMA_LOMBA[p.lomba]}</p>
                    <p className="truncate text-xs text-[#718079]">{p.asal}</p>
                  </div>
                </div>
                <div className="flex justify-end border-t border-[#e3e8e5] pt-2 sm:border-0 sm:pt-0">
                  <Link
                    href={`/juri/peringkat-${p.id}?kategoriPemenang=${kategori}`}
                    className="inline-flex h-8 shrink-0 items-center justify-center rounded-lg bg-[#245c4e] px-3 text-xs font-bold text-white transition-colors hover:bg-[#1b493e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245c4e]"
                  >
                    Tinjau karya
                  </Link>
                </div>
              </article>
            ))}
            {tampil.length === 0 && (
              <p className="py-8 text-center text-sm text-[#718079]">
                {sisa.length === 0 ? "Belum ada peserta di peringkat 4 sampai 10." : "Tidak ada karya yang cocok dengan pencarian."}
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default function PemenangPage({ kategori }: { kategori?: Lomba }) {
  const namaKategori = kategori === "Cerita" ? "Cerita HAM" : "Komik Bergambar";

  return (
    <div className="min-h-screen bg-[#f5f7f6] text-[#183b35] lg:grid lg:grid-cols-[240px_1fr]">
      <SidebarPanitia aktif="pemenang" kategori={kategori} />
      <div className="min-w-0">
        <BarAtasPanitia aktif="pemenang" kategori={kategori} />
        <main className="mx-auto max-w-6xl space-y-5 p-4 sm:p-7">
          {kategori && (
            <Link href="/pemenang" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#d9dfdc] bg-white px-4 text-sm font-semibold text-[#245c4e] shadow-sm transition-colors hover:bg-[#f5f7f6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245c4e] lg:hidden">
              <span aria-hidden="true">←</span>
              Kembali ke Pemenang
            </Link>
          )}
          <div>
            <h1 className="text-2xl font-semibold">{kategori ? `Pemenang ${namaKategori}` : "Pemenang"}</h1>
            <p className="mt-1 text-sm text-[#718079]">{kategori ? `Papan peringkat karya peserta lomba ${namaKategori} berdasarkan nilai juri.` : "Pilih kategori lomba untuk melihat papan peringkat pemenang."}</p>
          </div>
          <PemenangRanking kategori={kategori} />
        </main>
      </div>
    </div>
  );
}
