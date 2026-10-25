import Image from "next/image";
import Link from "next/link";
import StatCard from "@/components/StatCard";
import ChartPendaftaran from "@/components/ChartPendaftaran";
import DonutStatus from "@/components/DonutStatus";
import TabelPeserta from "@/components/TabelPeserta";
import { PESERTA, type Peserta } from "@/lib/data";

// Hitung jumlah menurut filter: semua, hanya Cerita, hanya Komik
const hitung = (f: (p: Peserta) => boolean) => ({
  semua: PESERTA.filter(f).length,
  cerita: PESERTA.filter((p) => p.lomba === "Cerita" && f(p)).length,
  komik: PESERTA.filter((p) => p.lomba === "Komik" && f(p)).length,
});

const panel = "rounded-xl border border-[#e3e8e5] bg-white p-5";

export default function PanitiaPage() {
  const totalDaftar = hitung(() => true);
  const totalKarya = hitung((p) => p.status !== "Terdaftar"); // karya yang sudah dikirim
  const perluDitinjau = hitung((p) => p.status === "Karya terkirim");
  const diverifikasi = hitung((p) => p.status === "Diverifikasi");

  return (
    <div className="min-h-screen bg-[#f5f7f6] text-[#183b35] lg:grid lg:grid-cols-[240px_1fr]">
      {/* Sidebar (layar besar) */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-[#e3e8e5] bg-white p-5 lg:flex">
        <div className="flex items-center gap-3">
          <Image src="/assets/logo-kemenham.png" alt="Logo Kementerian Hukum dan HAM RI" width={36} height={36} className="size-9 object-contain" />
          <span className="text-sm font-semibold leading-tight">Lomba Hari HAM</span>
        </div>
        <nav className="mt-8 flex flex-col gap-2 text-sm" aria-label="Menu utama">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#929d98]">Menu</p>
          <span className="block rounded-lg bg-[#eef3f0] px-3 py-2 font-semibold text-[#245c4e]" aria-current="page">Dashboard</span>
          <span className="block rounded-lg bg-[#eef3f0] px-3 py-2 font-semibold text-[#245c4e]" aria-current="page">Daftar Peserta</span>
          <span className="block rounded-lg bg-[#eef3f0] px-3 py-2 font-semibold text-[#245c4e]" aria-current="page">Daftar Karya</span>
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

        <main className="mx-auto max-w-6xl space-y-5 p-4 sm:p-7">
          <div>
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <p className="mt-1 text-sm text-[#718079]">Pantau pendaftaran dan karya yang masuk. Data di halaman ini masih contoh.</p>
          </div>

          {/* 4 kartu ringkasan */}
          <section aria-label="Ringkasan" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard judul="Total daftar" data={totalDaftar} />
            <StatCard judul="Total karya" data={totalKarya} />
            <StatCard judul="Perlu ditinjau" data={perluDitinjau} />
            <StatCard judul="Sudah diverifikasi" data={diverifikasi} />
          </section>

          {/* Dua grafik sejajar */}
          <div className="grid gap-5 md:grid-cols-2">
            <section className={panel}>
              <h2 className="font-semibold">Peserta per lomba</h2>
              <p className="mb-5 text-sm text-[#718079]">Total peserta yang daftar Lomba Cerita dan Lomba Komik</p>
              <ChartPendaftaran cerita={totalDaftar.cerita} komik={totalDaftar.komik} />
            </section>
            <section className={panel}>
              <h2 className="font-semibold">Status karya</h2>
              <p className="mb-5 text-sm text-[#718079]">Perlu ditinjau dan sudah diverifikasi</p>
              <DonutStatus ditinjau={perluDitinjau.semua} verifikasi={diverifikasi.semua} />
            </section>
          </div>

          <section className={panel}>
            <h2 className="mb-4 font-semibold">Daftar peserta</h2>
            <TabelPeserta peserta={PESERTA} />
          </section>
        </main>
      </div>
    </div>
  );
}