"use client";

import Image from "next/image";
import Link from "next/link";
import IkonMenu from "@/components/IkonMenu";
import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  DAFTAR_STATUS_KARYA,
  getServerSnapshotStatusKarya,
  getSnapshotStatusKarya,
  simpanStatusKarya,
  subscribeStatusKarya,
  type StatusKarya,
} from "@/lib/status-karya";
import type { KaryaPeserta } from "@/components/DaftarKaryaPeserta";

const STATUS_STYLE: Record<StatusKarya, string> = {
  Menunggu: "border-amber-400 bg-amber-50 text-amber-900",
  Ditinjau: "border-blue-300 bg-blue-50 text-blue-800",
  Diverifikasi: "border-emerald-300 bg-emerald-50 text-emerald-800",
  Ditolak: "border-rose-300 bg-rose-50 text-rose-700",
};

const fmtTanggal = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});
const fmtJam = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Jakarta",
});

function formatWaktu(iso: string) {
  const tanggal = new Date(iso);
  return `${fmtTanggal.format(tanggal)} pukul ${fmtJam.format(tanggal)}`;
}

export default function TinjauanKarya({ karya }: { karya: KaryaPeserta }) {
  const router = useRouter();
  const snapshotStatus = useSyncExternalStore(
    subscribeStatusKarya,
    getSnapshotStatusKarya,
    getServerSnapshotStatusKarya,
  );
  const [pilihanStatus, setPilihanStatus] = useState<StatusKarya | null>(null);
  const status = pilihanStatus ?? snapshotStatus.status[karya.id] ?? karya.status;
  const [pesan, setPesan] = useState("");

  const simpanKeputusan = () => {
    try {
      if (snapshotStatus.error) throw new Error(snapshotStatus.error);
      simpanStatusKarya({ ...snapshotStatus.status, [karya.id]: status });
      setPesan("Keputusan berhasil disimpan.");
      router.push("/karya");
    } catch (error) {
      setPesan(
        error instanceof Error ? error.message : "Keputusan gagal disimpan.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7f6] text-[#183b35] lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-[#e3e8e5] bg-white p-5 lg:flex">
        <div className="flex items-center gap-3">
          <Image
            src="/assets/logo-kemenham.png"
            alt="Logo Kementerian Hukum dan HAM RI"
            width={36}
            height={36}
            className="size-9 object-contain"
          />
          <span className="text-sm font-semibold leading-tight">Kementrian HAM</span>
        </div>
        <nav className="mt-8 flex flex-col gap-2 text-sm" aria-label="Menu utama">
          <Link href="/panitia" className="flex items-center gap-3 rounded-lg px-3 py-2 text-[#52645c] hover:bg-[#f5f7f6]"><IkonMenu nama="dashboard" />Dashboard</Link>
          <Link href="/peserta" className="flex items-center gap-3 rounded-lg px-3 py-2 text-[#52645c] hover:bg-[#f5f7f6]"><IkonMenu nama="peserta" />Daftar Peserta</Link>
          <Link href="/karya" className="flex items-center gap-3 rounded-lg bg-[#eef3f0] px-3 py-2 font-semibold text-[#245c4e]" aria-current="page"><IkonMenu nama="karya" />Daftar Karya Peserta</Link>
          <p className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-wider text-[#929d98]">Pemenang</p>
          <Link href="/kandidat" className="flex items-center gap-3 rounded-lg px-3 py-2 text-[#52645c] hover:bg-[#f5f7f6]"><IkonMenu nama="kandidat" />Kandidat Pemenang</Link>
          <Link href="/pemenang" className="flex items-center gap-3 rounded-lg px-3 py-2 text-[#52645c] hover:bg-[#f5f7f6]"><IkonMenu nama="pemenang" />Pemenang</Link>
        </nav>
        <div className="mt-auto">
          <p className="text-sm font-semibold">Juri</p>
          <p className="text-xs text-[#718079]">Tinjauan karya peserta</p>
        </div>
      </aside>

      <main className="mx-auto w-full max-w-4xl space-y-5 p-4 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/karya" className="inline-flex items-center gap-2 text-sm font-semibold text-[#245c4e] hover:underline">
            <span aria-hidden="true">←</span>
            Kembali ke Daftar Karya
          </Link>
          <Link href="/kandidat" className="inline-flex items-center gap-2 rounded-lg border border-[#d9dfdc] bg-white px-3 py-2 text-sm font-semibold text-[#245c4e] hover:bg-[#f5f7f6]">
            <IkonMenu nama="kandidat" />
            Kandidat
          </Link>
        </div>

        <header>
          <p className="text-sm font-medium text-[#718079]">Tinjauan Juri</p>
          <h1 className="mt-1 text-2xl font-semibold">{karya.namaPeserta}</h1>
          <p className="mt-1 text-sm text-[#718079]">{karya.lomba === "Cerita" ? "Buku Cerita" : "Serial Komik"}</p>
        </header>

        <section className="overflow-hidden rounded-xl border-2 border-[#52645c] bg-white shadow-sm">
          <div aria-hidden="true" className="h-1.5 bg-gradient-to-r from-emerald-600 via-teal-400 to-amber-400" />
          <div className="space-y-6 p-5 sm:p-7">
            <div className="grid gap-5 border-b border-[#e3e8e5] pb-6 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-[#718079]">Peserta</p>
                <p className="mt-1 font-semibold">{karya.namaPeserta}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[#718079]">Asal sekolah / kampus</p>
                <p className="mt-1 font-semibold">{karya.asal}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[#718079]">Tanggal mendaftar</p>
                <p className="mt-1 font-semibold">{formatWaktu(karya.mendaftarPada)}</p>
              </div>
              {karya.dikirimPada && (
                <div>
                  <p className="text-xs font-medium text-[#718079]">Tanggal karya dikirim</p>
                  <p className="mt-1 font-semibold">{formatWaktu(karya.dikirimPada)}</p>
                </div>
              )}
            </div>

            {karya.berkas.length > 0 && (
              <section aria-labelledby="berkas-tinjauan">
                <div className="mb-3">
                  <h2 id="berkas-tinjauan" className="font-semibold">Berkas untuk ditinjau</h2>
                  <p className="mt-1 text-sm text-amber-800">
                    Dokumen yang ditampilkan adalah berkas demo yang sama untuk semua peserta.
                  </p>
                </div>
                <div className="space-y-3">
                  {karya.berkas.map((berkas) => (
                    <details key={berkas.label} className="overflow-hidden rounded-lg border border-[#cbd5d0] bg-white">
                      <summary className="cursor-pointer px-4 py-3 text-sm font-semibold hover:bg-[#f5f9f6]">
                        {berkas.label}
                      </summary>
                      {berkas.url && (
                        <div className="border-t border-[#e3e8e5] p-3">
                          <p className="mb-2 text-right">
                            <a
                              href={berkas.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm font-semibold text-[#245c4e] underline"
                            >
                              Buka PDF di tab baru
                            </a>
                          </p>
                          <iframe
                            src={berkas.url}
                            title={`Pratinjau PDF: ${berkas.label}`}
                            loading="lazy"
                            className="h-[min(70vh,680px)] w-full rounded-md border border-[#e3e8e5]"
                          />
                        </div>
                      )}
                    </details>
                  ))}
                </div>
              </section>
            )}

            <div className="max-w-md space-y-3">
              <div>
                <h2 className="font-semibold">Keputusan juri</h2>
                <p className="mt-1 text-sm text-[#718079]">Pilih status hasil tinjauan untuk karya ini.</p>
              </div>
              <label htmlFor="status-keputusan" className="sr-only">Status keputusan</label>
              <select
                id="status-keputusan"
                value={status}
                onChange={(event) => setPilihanStatus(event.target.value as StatusKarya)}
                className={`h-11 w-full rounded-lg border px-4 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#245c4e]/40 ${STATUS_STYLE[status]}`}
              >
                {DAFTAR_STATUS_KARYA.map((pilihan) => (
                  <option key={pilihan} value={pilihan}>{pilihan}</option>
                ))}
              </select>
              {(pesan || snapshotStatus.error) && (
                <p className="text-sm text-rose-700" role={snapshotStatus.error ? "alert" : "status"}>
                  {snapshotStatus.error || pesan}
                </p>
              )}
              <button
                type="button"
                onClick={simpanKeputusan}
                className="inline-flex h-11 items-center justify-center rounded-lg bg-[#245c4e] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#1b493e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245c4e]"
              >
                Simpan keputusan
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
