"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import IkonMenu from "@/components/IkonMenu";
import { PESERTA, type Lomba } from "@/lib/data";

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
function hitungPeringkat(lomba: Lomba): Peringkat[] {
  const layak = PESERTA.flatMap((p) => {
    const nilai = NILAI_JURI[p.id];
    if (!nilai || p.judul === null || p.lomba !== lomba || p.status === "Ditolak") return [];
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

function SidebarPanitia({ aktif }: { aktif: Aktif }) {
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
        <span className={biasaKelas}><IkonMenu nama="kandidat" />Kandidat Pemenang</span>
        <Link href="/pemenang" className={aktif === "pemenang" ? aktifKelas : biasaKelas} aria-current={aktif === "pemenang" ? "page" : undefined}>
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
function BarAtasPanitia({ aktif }: { aktif: Aktif }) {
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
        {[...MENU.map((m) => ({ kunci: m.kunci, href: m.href, label: m.labelPendek })), { kunci: "pemenang" as Aktif, href: "/pemenang", label: "Pemenang" }].map((m) => (
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
    </>
  );
}


const LOMBA: { nilai: Lomba; label: string }[] = [
  { nilai: "Cerita", label: "Lomba Cerita" },
  { nilai: "Komik", label: "Lomba Komik" },
];

// Warna medali menurut peringkat 1, 2, 3
const MEDALI = [
  { garis: "#d99a50", latar: "#fbf1dc" },
  { garis: "#8a9a93", latar: "#eef1ef" },
  { garis: "#b8703a", latar: "#f8e9dc" },
];

const panel = "overflow-hidden rounded-xl border-2 border-[#52645c] bg-white shadow-sm";
const input = "h-10 rounded-lg border border-[#d9dfdc] bg-white px-3 text-sm outline-none focus:border-[#2c7767]";

const inisial = (nama: string) =>
  nama.split(" ").slice(0, 2).map((k) => k[0]).join("").toUpperCase();

function PemenangRanking({ data }: { data: Record<Lomba, Peringkat[]> }) {
  const [lomba, setLomba] = useState<Lomba>("Cerita");
  const [q, setQ] = useState("");

  const semua = data[lomba];
  const tiga = semua.slice(0, 3);
  const sisa = semua.slice(3, 10);

  const kata = q.trim().toLowerCase();
  const tampil = sisa
    .filter((p) => `${p.nama} ${p.asal} ${p.judul}`.toLowerCase().includes(kata));

  return (
    <div className="space-y-5">
      <div role="group" aria-label="Pilih lomba" className="inline-flex rounded-lg border border-[#d9dfdc] bg-white p-1 text-sm">
        {LOMBA.map((l) => (
          <button
            key={l.nilai}
            type="button"
            aria-pressed={lomba === l.nilai}
            onClick={() => setLomba(l.nilai)}
            className={`rounded-md px-4 py-1.5 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245c4e] ${lomba === l.nilai ? "bg-[#245c4e] text-white" : "text-[#52645c] hover:bg-[#f5f7f6]"}`}
          >
            {l.label}
          </button>
        ))}
      </div>

      <section aria-labelledby="judul-tiga">
        <h2 id="judul-tiga" className="sr-only">Tiga peringkat teratas {lomba}</h2>
        {tiga.length === 0 ? (
          <p className={`${panel} p-6 text-center text-sm text-[#718079]`}>Belum ada karya yang dinilai di lomba ini.</p>
        ) : (
          <ol className="grid gap-4 sm:grid-cols-3">
            {tiga.map((p) => {
              const medali = MEDALI[Math.min(p.peringkat, 3) - 1];
              return (
                <li key={p.id} className={panel}>
                  <div className="flex items-start gap-3 p-4">
                    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#eef3f0] text-sm font-semibold text-[#245c4e]" aria-hidden="true">
                      {inisial(p.nama)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{p.nama}</p>
                      <p className="truncate text-xs text-[#718079]">{p.asal}</p>
                    </div>
                    <span
                      className="grid size-9 shrink-0 place-items-center rounded-full border-2 text-sm font-bold"
                      style={{ borderColor: medali.garis, backgroundColor: medali.latar }}
                      role="img"
                      aria-label={`Peringkat ${p.peringkat}`}
                    >
                      {p.peringkat}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <section className={panel}>
        <div className="h-1.5 bg-gradient-to-r from-emerald-600 to-teal-400" />
        <div className="p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Peringkat 4-10</h2>
            <input
              className={`${input} w-full sm:w-56`}
              placeholder="Cari nama, asal, atau judul"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Cari karya"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[360px] text-left text-sm">
              <caption className="sr-only">Peringkat karya {lomba} berdasarkan nilai juri</caption>
              <thead>
                <tr className="border-b border-[#e3e8e5] text-xs text-[#718079]">
                  <th scope="col" className="w-24 py-2.5 pr-3 font-semibold">Peringkat</th>
                  <th scope="col" className="py-2.5 pr-3 font-semibold">Peserta</th>
                </tr>
              </thead>
              <tbody>
                {tampil.map((p) => (
                  <tr key={p.id} className="border-b border-[#f0f3f1] last:border-0">
                    <td className="py-3 pr-3 font-semibold tabular-nums">{p.peringkat}</td>
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-3">
                        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#eef3f0] text-xs font-semibold text-[#245c4e]" aria-hidden="true">
                          {inisial(p.nama)}
                        </span>
                        <div>
                          <p className="font-semibold">{p.nama}</p>
                          <p className="text-xs text-[#718079]">{p.asal}</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
                {tampil.length === 0 && (
                  <tr>
                    <td colSpan={2} className="py-8 text-center text-[#718079]">
                      {sisa.length === 0 ? "Belum ada peserta di peringkat 4 sampai 10." : "Tidak ada karya yang cocok dengan pencarian."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

const DATA_PERINGKAT: Record<Lomba, Peringkat[]> = {
  Cerita: hitungPeringkat("Cerita"),
  Komik: hitungPeringkat("Komik"),
};

export default function PemenangPage() {
  return (
    <div className="min-h-screen bg-[#f5f7f6] text-[#183b35] lg:grid lg:grid-cols-[240px_1fr]">
      <SidebarPanitia aktif="pemenang" />
      <div className="min-w-0">
        <BarAtasPanitia aktif="pemenang" />
        <main className="mx-auto max-w-6xl space-y-5 p-4 sm:p-7">
          <div>
            <h1 className="text-2xl font-semibold">Pemenang</h1>
            <p className="mt-1 text-sm text-[#718079]">Peringkat karya berdasarkan nilai juri, per lomba. Data di halaman ini masih contoh.</p>
          </div>
          <PemenangRanking data={DATA_PERINGKAT} />
        </main>
      </div>
    </div>
  );
}
