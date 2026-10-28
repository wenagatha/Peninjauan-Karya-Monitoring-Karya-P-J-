"use client";

import Image from "next/image";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import StatCard from "@/components/StatCard";
import ChartPendaftaran from "@/components/ChartPendaftaran";
import DonutStatus from "@/components/DonutStatus";
import TabelPeserta from "@/components/TabelPeserta";
import IkonMenu from "@/components/IkonMenu";
import { DATA_CONTOH as KARYA_CONTOH, type KaryaPeserta } from "@/components/DaftarKaryaPeserta";
import { PESERTA, type Peserta } from "@/lib/data";
import {
  getServerSnapshotStatusKarya,
  getSnapshotStatusKarya,
  subscribeStatusKarya,
} from "@/lib/status-karya";

// Hitung jumlah menurut filter: semua, hanya Cerita, hanya Komik
const panel = "overflow-hidden rounded-xl border-2 border-[#52645c] bg-white shadow-sm";

export default function PanitiaPage() {
  const snapshotStatus = useSyncExternalStore(
    subscribeStatusKarya,
    getSnapshotStatusKarya,
    getServerSnapshotStatusKarya,
  );
  const statusKarya = (karya: KaryaPeserta) =>
    snapshotStatus.status[karya.id] ?? karya.status;
  const hitung = (f: (p: Peserta) => boolean) => ({
    semua: PESERTA.filter(f).length,
    cerita: PESERTA.filter((p) => p.lomba === "Cerita" && f(p)).length,
    komik: PESERTA.filter((p) => p.lomba === "Komik" && f(p)).length,
  });
  const hitungKarya = (f: (k: KaryaPeserta) => boolean) => ({
    semua: KARYA_CONTOH.filter(f).length,
    cerita: KARYA_CONTOH.filter((k) => k.lomba === "Cerita" && f(k)).length,
    komik: KARYA_CONTOH.filter((k) => k.lomba === "Komik" && f(k)).length,
  });
  const totalDaftar = hitung(() => true);
  const totalKarya = hitungKarya(() => true);
  const menunggu = hitungKarya((k) => statusKarya(k) === "Menunggu");
  const ditinjau = hitungKarya((k) => statusKarya(k) === "Ditinjau");
  const diverifikasi = hitungKarya((k) => statusKarya(k) === "Diverifikasi");
  const ditolak = hitungKarya((k) => statusKarya(k) === "Ditolak");

  return (
    <div className="min-h-screen bg-[#f5f7f6] text-[#183b35] lg:grid lg:grid-cols-[240px_1fr]">
      {/* Sidebar (layar besar) */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-[#e3e8e5] bg-white p-5 lg:flex">
        <div className="flex items-center gap-3">
          <Image src="/assets/logo-kemenham.png" alt="Logo Kementerian Hukum dan HAM RI" width={36} height={36} className="size-9 object-contain" />
          <span className="text-sm font-semibold leading-tight">Kementerian HAM</span>
        </div>
        <nav className="mt-8 flex flex-col gap-2 text-sm" aria-label="Menu utama">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#929d98]">Monitoring & Meninjau</p>
          <Link href="/panitia" className="flex items-center gap-3 rounded-lg bg-[#eef3f0] px-3 py-2 font-semibold text-[#245c4e]" aria-current="page"><IkonMenu nama="dashboard" />Dashboard</Link>
          <Link href="/peserta" className="flex items-center gap-3 rounded-lg px-3 py-2 text-[#52645c] transition-colors hover:bg-[#f5f7f6] hover:text-[#245c4e]"><IkonMenu nama="peserta" />Daftar Peserta</Link>
          <Link href="/karya" className="flex items-center gap-3 rounded-lg px-3 py-2 text-[#52645c] transition-colors hover:bg-[#f5f7f6] hover:text-[#245c4e]"><IkonMenu nama="karya" />Daftar Karya Peserta</Link>
          <p className="mt-4 mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#929d98]">Pemenang</p>
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
        {/* Bar atas (layar kecil) */}
        <header className="flex items-center justify-between border-b border-[#e3e8e5] bg-white px-4 py-3 lg:hidden">
          <span className="flex items-center gap-2 text-sm font-semibold">
            <Image src="/assets/logo-kemenham.png" alt="" width={28} height={28} className="size-7 object-contain" />
            Lomba Hari HAM
          </span>
          <Link href="/login" className="text-sm font-semibold text-[#245c4e]">Keluar</Link>
        </header>
        <nav className="flex gap-2 overflow-x-auto border-b border-[#e3e8e5] bg-white px-4 pb-3 text-sm lg:hidden" aria-label="Menu utama">
          <Link href="/panitia" className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#eef3f0] px-3 py-2 font-semibold text-[#245c4e]" aria-current="page"><IkonMenu nama="dashboard" />Dashboard</Link>
          <Link href="/peserta" className="inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-[#52645c] hover:bg-[#f5f7f6] hover:text-[#245c4e]"><IkonMenu nama="peserta" />Daftar Peserta</Link>
          <Link href="/karya" className="inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-[#52645c] hover:bg-[#f5f7f6] hover:text-[#245c4e]"><IkonMenu nama="karya" />Daftar Karya</Link>
          <Link href="/kandidat" className="inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-[#52645c] hover:bg-[#f5f7f6] hover:text-[#245c4e]"><IkonMenu nama="kandidat" />Kandidat</Link>
          <Link href="/pemenang" className="inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-[#52645c] hover:bg-[#f5f7f6] hover:text-[#245c4e]"><IkonMenu nama="pemenang" />Pemenang</Link>
        </nav>

        <main className="mx-auto max-w-6xl space-y-5 p-4 sm:p-7">
          <div>
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <p className="mt-1 text-sm text-[#718079]">Pantau pendaftaran dan karya yang masuk. Data di halaman ini masih contoh.</p>
          </div>
          {snapshotStatus.error && (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">
              Status karya tidak dapat dimuat: {snapshotStatus.error}
            </p>
          )}

          {/* Ringkasan pendaftaran dan status karya */}
          <section aria-label="Ringkasan" className="grid grid-cols-2 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            <StatCard judul="Total daftar" data={totalDaftar} />
            <StatCard judul="Total karya" data={totalKarya} />
            <StatCard judul="Menunggu" data={menunggu} />
            <StatCard judul="Ditinjau" data={ditinjau} />
            <StatCard judul="Diverifikasi" data={diverifikasi} />
            <StatCard judul="Ditolak" data={ditolak} />
          </section>

          {/* Dua grafik sejajar */}
          <div className="grid gap-5 md:grid-cols-2">
            <section className={panel}>
              <div className="h-1.5 bg-gradient-to-r from-emerald-600 to-teal-400" />
              <div className="p-5">
                <h2 className="font-semibold">Peserta per lomba</h2>
                <p className="mb-5 text-sm text-[#718079]">Total peserta yang daftar Lomba Cerita dan Lomba Komik</p>
                <ChartPendaftaran cerita={totalDaftar.cerita} komik={totalDaftar.komik} />
              </div>
            </section>
            <section className={panel}>
              <div className="h-1.5 bg-gradient-to-r from-amber-400 to-orange-500" />
              <div className="p-5">
                <h2 className="font-semibold">Status karya</h2>
                <p className="mb-5 text-sm text-[#718079]">Status seluruh karya peserta</p>
                <DonutStatus
                  menunggu={menunggu.semua}
                  ditinjau={ditinjau.semua}
                  diverifikasi={diverifikasi.semua}
                  ditolak={ditolak.semua}
                />
              </div>
            </section>
          </div>

          <section className={panel}>
            <div className="h-1.5 bg-gradient-to-r from-blue-600 to-cyan-400" />
            <div className="p-5">
              <h2 className="mb-4 font-semibold">Daftar peserta</h2>
              <TabelPeserta peserta={PESERTA} />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}