"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import {
  DAFTAR_STATUS_KARYA,
  getServerSnapshotStatusKarya,
  getSnapshotStatusKarya,
  simpanStatusKarya,
  subscribeStatusKarya,
  type StatusKarya,
} from "@/lib/status-karya";

/* ---------- Tipe & konstanta ---------- */

export type Lomba = "Cerita" | "Komik";

export type Berkas = {
  label: string; // contoh: "Karya utama"
  url?: string; // kalau diisi, kartu berkas bisa diklik (buka di tab baru)
};

export type KaryaPeserta = {
  id: string;
  lomba: Lomba;
  namaPeserta: string;
  tipePeserta: "Individu" | "Kelompok";
  asal: string; // kampus / sekolah
  mendaftarPada: string; // ISO dengan zona waktu, contoh "2026-10-20T10:10:00+07:00"
  dikirimPada: string | null; // ISO, null kalau belum mengirim
  status: StatusKarya;
  berkas: Berkas[];
};

const BERKAS_DEMO: Berkas[] = [
  {
    label: "Buku Cerita HAM untuk Semua",
    url: "/demo-documents/buku-cerita-ham-untuk-semua.pdf",
  },
  {
    label: "KTM Alief Linggar Syamsudin",
    url: "/demo-documents/ktm-alief-linggar-syamsudin.pdf",
  },
  {
    label: "Surat Keaslian Karya Killian Kariem",
    url: "/demo-documents/surat-keaslian-karya-killian-kariem.pdf",
  },
];

const NAMA_LOMBA: Record<Lomba, string> = {
  Cerita: "Buku Cerita",
  Komik: "Serial Komik",
};

const STATUS_STYLE: Record<StatusKarya, string> = {
  Menunggu: "border-amber-400 bg-amber-50 text-amber-900",
  Ditinjau: "border-blue-300 bg-blue-50 text-blue-800",
  Diverifikasi: "border-emerald-300 bg-emerald-50 text-emerald-800",
  Ditolak: "border-rose-300 bg-rose-50 text-rose-700",
};

/* ---------- Data contoh (ganti dengan data dari database / Google Form) ---------- */

export const DATA_CONTOH: KaryaPeserta[] = [
  {
    id: "1",
    lomba: "Cerita",
    namaPeserta: "Alief Linggar Syamsudin",
    tipePeserta: "Kelompok",
    asal: "Universitas Gunadarma",
    mendaftarPada: "2026-10-20T10:10:00+07:00",
    dikirimPada: "2026-10-20T10:16:00+07:00",
    status: "Menunggu",
    berkas: [...BERKAS_DEMO],
  },
  {
    id: "2",
    lomba: "Komik",
    namaPeserta: "Bima Saputra",
    tipePeserta: "Individu",
    asal: "SMAN 8 Jakarta",
    mendaftarPada: "2026-10-03T09:30:00+07:00",
    dikirimPada: "2026-10-04T14:05:00+07:00",
    status: "Diverifikasi",
    berkas: [...BERKAS_DEMO],
  },
  {
    id: "3",
    lomba: "Cerita",
    namaPeserta: "Citra Lestari",
    tipePeserta: "Individu",
    asal: "Universitas Indonesia",
    mendaftarPada: "2026-10-04T16:45:00+07:00",
    dikirimPada: null,
    status: "Menunggu",
    berkas: [...BERKAS_DEMO],
  },
  {
    id: "4",
    lomba: "Komik",
    namaPeserta: "Dimas Pratama",
    tipePeserta: "Individu",
    asal: "SMAN 8 Jakarta",
    mendaftarPada: "2026-10-05T11:20:00+07:00",
    dikirimPada: "2026-10-07T08:50:00+07:00",
    status: "Ditinjau",
    berkas: [...BERKAS_DEMO],
  },
];

/* ---------- Helper ---------- */

// Zona waktu dipaku ke WIB supaya tampilan sama di server dan browser
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

const formatWaktu = (iso: string) => {
  const d = new Date(iso);
  return `${fmtTanggal.format(d)} pukul ${fmtJam.format(d)}`;
};

function StatusEditor({
  status,
  namaPeserta,
  onChange,
}: {
  status: StatusKarya;
  namaPeserta: string;
  onChange: (status: StatusKarya) => void;
}) {
  return (
    <label className="flex shrink-0 flex-col gap-1">
      <span className="sr-only">Ubah status {namaPeserta}</span>
      <select
        value={status}
        onChange={(event) => onChange(event.target.value as StatusKarya)}
        className={`rounded-full border px-3 py-1.5 text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#245c4e]/40 ${STATUS_STYLE[status]}`}
        aria-label={`Status karya ${namaPeserta}`}
      >
        {DAFTAR_STATUS_KARYA.map((pilihan) => (
          <option key={pilihan} value={pilihan}>{pilihan}</option>
        ))}
      </select>
    </label>
  );
}

function BerkasItem({ berkas }: { berkas: Berkas }) {
  const isi = (
    <>
      <span className="text-sm font-semibold">{berkas.label}</span>
      <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-rose-800">
        PDF
      </span>
    </>
  );
  const kelas =
    "flex items-center justify-between gap-3 rounded-xl border border-[#56675e] bg-white px-4 py-3";

  return berkas.url ? (
    <a
      href={berkas.url}
      target="_blank"
      rel="noreferrer"
      className={`${kelas} transition-colors hover:border-[#245c4e] hover:bg-[#f5f9f6] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#245c4e]/30`}
    >
      {isi}
    </a>
  ) : (
    <div className={kelas}>{isi}</div>
  );
}

function KartuKarya({
  karya,
  status,
  onChangeStatus,
}: {
  karya: KaryaPeserta;
  status: StatusKarya;
  onChangeStatus: (status: StatusKarya) => void;
}) {
  const [sedangMengunduh, setSedangMengunduh] = useState(false);
  const [pesanUnduhan, setPesanUnduhan] = useState("");

  const unduhBerkasPeserta = async () => {
    if (karya.berkas.length === 0) {
      setPesanUnduhan("Belum ada berkas PDF untuk diunduh.");
      return;
    }

    const berkasTanpaUrl = karya.berkas.filter((berkas) => !berkas.url);
    if (berkasTanpaUrl.length > 0) {
      setPesanUnduhan(
        `${berkasTanpaUrl.length} berkas belum memiliki tautan PDF. Lengkapi tautannya sebelum mengunduh ZIP.`,
      );
      return;
    }

    const berkasDenganUrl = karya.berkas.filter(
      (berkas): berkas is Berkas & { url: string } =>
        typeof berkas.url === "string" && berkas.url.length > 0,
    );

    setSedangMengunduh(true);
    setPesanUnduhan("");

    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();

      for (const berkas of berkasDenganUrl) {
        const response = await fetch(berkas.url);
        if (!response.ok) {
          throw new Error(`Gagal mengunduh ${berkas.label}.`);
        }

        const namaBerkas = berkas.label
          .normalize("NFKD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-zA-Z0-9_-]+/g, "-")
          .replace(/^-+|-+$/g, "") || "berkas";
        zip.file(`${namaBerkas}.pdf`, await response.blob());
      }

      const arsip = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(arsip);
      const tautan = document.createElement("a");
      tautan.href = url;
      tautan.download = `berkas-${karya.namaPeserta}`
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9_-]+/g, "-")
        .replace(/^-+|-+$/g, "") + ".zip";
      document.body.appendChild(tautan);
      tautan.click();
      tautan.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setPesanUnduhan(`${berkasDenganUrl.length} berkas berhasil diunduh dalam ZIP.`);
    } catch (error) {
      setPesanUnduhan(
        error instanceof Error
          ? `ZIP gagal dibuat: ${error.message}`
          : "ZIP gagal dibuat karena terjadi kesalahan yang tidak diketahui.",
      );
    } finally {
      setSedangMengunduh(false);
    }
  };

  return (
    <article className="overflow-hidden rounded-xl border-2 border-[#52645c] bg-white shadow-sm">
      <div aria-hidden="true" className="h-1.5 bg-gradient-to-r from-emerald-600 via-teal-400 to-amber-400" />
      <div className="p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-3 border-b border-[#eef1ef] pb-4 sm:flex-row sm:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#718079]">{NAMA_LOMBA[karya.lomba]}</p>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <StatusEditor
              status={status}
              namaPeserta={karya.namaPeserta}
              onChange={onChangeStatus}
            />
            <Link
              href={`/juri/${karya.id}`}
              className="inline-flex h-9 items-center justify-center rounded-lg bg-[#245c4e] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#1b493e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245c4e]"
            >
              Tinjau
            </Link>
          </div>
        </div>

        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-3">
          <p>
            <span className="block text-xs text-[#718079]">Peserta</span>
            <span className="mt-1 block font-medium">{karya.namaPeserta}</span>
            <span className="text-xs text-[#718079]">{karya.tipePeserta}</span>
          </p>
          <p>
            <span className="block text-xs text-[#718079]">Asal</span>
            <span className="mt-1 block font-medium">{karya.asal}</span>
          </p>
          <p>
            <span className="block text-xs text-[#718079]">Tanggal mendaftar</span>
            <span className="mt-1 block font-medium">{formatWaktu(karya.mendaftarPada)}</span>
          </p>
        </div>

        {karya.dikirimPada && (
          <div className="mt-4 rounded-lg border-l-4 border-emerald-500 bg-emerald-50 px-4 py-3 text-sm">
            <span className="text-[#718079]">Dikirim pada </span>
            <span className="font-medium">{formatWaktu(karya.dikirimPada)}</span>
          </div>
        )}

        {karya.berkas.length > 0 && (
          <div className="mt-5">
            <h3 className="mb-3 text-sm font-semibold text-[#183b35]">
              Berkas peserta
            </h3>
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {karya.berkas.map((b) => (
                <li key={b.label}>
                  <BerkasItem berkas={b} />
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-5 flex flex-col items-start gap-2 border-t border-[#eef1ef] pt-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={unduhBerkasPeserta}
            disabled={sedangMengunduh}
            className="inline-flex h-10 items-center gap-2 rounded-lg border-2 border-[#52645c] bg-white px-4 text-sm font-semibold text-[#183b35] transition-colors hover:bg-[#f0f7f3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245c4e] disabled:cursor-wait disabled:opacity-60"
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="size-4">
              <path d="M10 2.5v9m0 0 3.5-3.5M10 11.5 6.5 8M3.5 13.5v3h13v-3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {sedangMengunduh ? "Menyiapkan ZIP..." : "Unduh berkas peserta (.zip)"}
          </button>
          {pesanUnduhan && (
            <p className="text-sm text-[#52645c]" role="status" aria-live="polite">
              {pesanUnduhan}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

/* ---------- Komponen utama ---------- */

type Props = {
  karya?: KaryaPeserta[];
};

export default function DaftarKaryaPeserta({ karya = DATA_CONTOH }: Props) {
  const [kata, setKata] = useState("");
  const [lomba, setLomba] = useState<"Semua" | Lomba>("Semua");
  const [status, setStatus] = useState<"Semua" | StatusKarya>("Semua");
  const snapshotStatus = useSyncExternalStore(
    subscribeStatusKarya,
    getSnapshotStatusKarya,
    getServerSnapshotStatusKarya,
  );
  const [pesanSimpan, setPesanSimpan] = useState("");

  const ubahStatus = (id: string, statusBaru: StatusKarya) => {
    const statusTerkini = { ...snapshotStatus.status, [id]: statusBaru };
    try {
      simpanStatusKarya(statusTerkini);
      setPesanSimpan("");
    } catch (error) {
      setPesanSimpan(
        error instanceof Error ? error.message : "Status karya gagal disimpan.",
      );
    }
  };

  const hasil = useMemo(() => {
    const q = kata.trim().toLowerCase();
    return karya.filter((k) => {
      if (lomba !== "Semua" && k.lomba !== lomba) return false;
      const statusSaatIni = snapshotStatus.status[k.id] ?? k.status;
      if (status !== "Semua" && statusSaatIni !== status) return false;
      if (!q) return true;
      return (
        k.namaPeserta.toLowerCase().includes(q) ||
        k.asal.toLowerCase().includes(q)
      );
    });
  }, [karya, kata, lomba, status, snapshotStatus.status]);

  const jumlahStatus = (target: StatusKarya) =>
    karya.filter((k) => (snapshotStatus.status[k.id] ?? k.status) === target).length;

  const inputKelas =
    "h-11 rounded-lg border border-[#d9e0dc] bg-white px-4 text-sm focus:border-[#245c4e] focus:outline-none focus:ring-2 focus:ring-[#245c4e]/20";

  return (
    <div className="min-h-screen bg-[#f5f7f6] text-[#183b35] lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-[#e3e8e5] bg-white p-5 lg:flex">
        <div className="flex items-center gap-3">
          <Image src="/assets/logo-kemenham.png" alt="Logo Kementerian Hukum dan HAM RI" width={36} height={36} className="size-9 object-contain" />
          <span className="text-sm font-semibold leading-tight">Kementrian HAM</span>
        </div>
        <nav className="mt-8 flex flex-col gap-2 text-sm" aria-label="Menu utama">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#929d98]">Monitoring &amp; Meninjau</p>
          <Link href="/panitia" className="rounded-lg px-3 py-2 text-[#52645c] transition-colors hover:bg-[#f5f7f6] hover:text-[#245c4e]">Dashboard</Link>
          <Link href="/peserta" className="rounded-lg px-3 py-2 text-[#52645c] transition-colors hover:bg-[#f5f7f6] hover:text-[#245c4e]">Daftar Peserta</Link>
          <Link href="/karya" className="rounded-lg bg-[#eef3f0] px-3 py-2 font-semibold text-[#245c4e]" aria-current="page">Daftar Karya Peserta</Link>
          <p className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-wider text-[#929d98]">Pemenang</p>
          <span className="rounded-lg px-3 py-2 text-[#52645c]">Kandidat Pemenang</span>
          <span className="rounded-lg px-3 py-2 text-[#52645c]">Pemenang</span>
          <span className="rounded-lg px-3 py-2 text-[#52645c]">TOP 3</span>
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
          <Link href="/panitia" className="shrink-0 rounded-lg px-3 py-2 text-[#52645c] hover:bg-[#f5f7f6] hover:text-[#245c4e]">Dashboard</Link>
          <Link href="/peserta" className="shrink-0 rounded-lg px-3 py-2 text-[#52645c] hover:bg-[#f5f7f6] hover:text-[#245c4e]">Daftar Peserta</Link>
          <Link href="/karya" className="shrink-0 rounded-lg bg-[#eef3f0] px-3 py-2 font-semibold text-[#245c4e]" aria-current="page">Daftar Karya</Link>
        </nav>

        <main className="mx-auto max-w-6xl space-y-5 p-4 sm:p-7">
          <header>
            <p className="text-sm font-medium text-[#718079]">Monitoring &amp; Meninjau</p>
            <h1 className="mt-1 text-2xl font-semibold">Daftar Karya Peserta</h1>
            <p className="mt-1 text-sm text-[#718079]">Pantau karya, berkas, dan status peninjauan peserta.</p>
            <p className="mt-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Berkas yang sama ditampilkan untuk semua peserta sebagai data demo; dokumen ini bukan unggahan asli masing-masing peserta.
            </p>
          </header>

          <section aria-label="Ringkasan karya" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <article className="rounded-xl border-2 border-[#52645c] border-t-4 border-t-emerald-600 bg-white p-5 shadow-sm">
              <p className="text-sm text-[#718079]">Total data karya</p>
              <p className="mt-2 text-2xl font-semibold">{karya.length}</p>
            </article>
            <article className="rounded-xl border-2 border-[#52645c] border-t-4 border-t-blue-500 bg-white p-5 shadow-sm">
              <p className="text-sm text-[#718079]">Menunggu</p>
              <p className="mt-2 text-2xl font-semibold">{jumlahStatus("Menunggu")}</p>
            </article>
            <article className="rounded-xl border-2 border-[#52645c] border-t-4 border-t-amber-500 bg-white p-5 shadow-sm">
              <p className="text-sm text-[#718079]">Ditinjau</p>
              <p className="mt-2 text-2xl font-semibold">{jumlahStatus("Ditinjau")}</p>
            </article>
            <article className="rounded-xl border-2 border-[#52645c] border-t-4 border-t-emerald-600 bg-white p-5 shadow-sm">
              <p className="text-sm text-[#718079]">Diverifikasi</p>
              <p className="mt-2 text-2xl font-semibold">{jumlahStatus("Diverifikasi")}</p>
            </article>
            <article className="rounded-xl border-2 border-[#52645c] border-t-4 border-t-rose-500 bg-white p-5 shadow-sm">
              <p className="text-sm text-[#718079]">Ditolak</p>
              <p className="mt-2 text-2xl font-semibold">{jumlahStatus("Ditolak")}</p>
            </article>
          </section>

          <section className="overflow-hidden rounded-xl border-2 border-[#52645c] bg-white shadow-sm">
            <div aria-hidden="true" className="h-1.5 bg-gradient-to-r from-violet-600 via-fuchsia-400 to-amber-400" />
            <div className="border-b border-[#eef1ef] p-5">
              <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-end">
                <div>
                  <h2 className="font-semibold">Data karya peserta</h2>
                  <p className="mt-1 text-sm text-[#718079]">Cari peserta atau saring berdasarkan lomba dan status.</p>
                </div>
                <p className="text-sm text-[#718079]" aria-live="polite">{hasil.length} data ditemukan</p>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_auto_auto]">
                <div>
                  <label htmlFor="cari-karya" className="sr-only">Cari karya</label>
                  <input
                    id="cari-karya"
                    type="search"
                    value={kata}
                    onChange={(e) => setKata(e.target.value)}
                    placeholder="Cari nama atau asal peserta"
                    className={`${inputKelas} w-full placeholder:text-[#929d98]`}
                  />
                </div>
                <div>
                  <label htmlFor="filter-lomba-karya" className="sr-only">Filter lomba</label>
                  <select
                    id="filter-lomba-karya"
                    value={lomba}
                    onChange={(e) => setLomba(e.target.value as "Semua" | Lomba)}
                    className={`${inputKelas} w-full`}
                  >
                    <option value="Semua">Semua lomba</option>
                    <option value="Cerita">Buku Cerita</option>
                    <option value="Komik">Serial Komik</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="filter-status-karya" className="sr-only">Filter status</label>
                  <select
                    id="filter-status-karya"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as "Semua" | StatusKarya)}
                    className={`${inputKelas} w-full`}
                  >
                    <option value="Semua">Semua status</option>
                    {DAFTAR_STATUS_KARYA.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4 p-4 sm:p-5">
              {hasil.map((k) => (
                <KartuKarya
                  key={k.id}
                  karya={k}
                  status={snapshotStatus.status[k.id] ?? k.status}
                  onChangeStatus={(nextStatus) => ubahStatus(k.id, nextStatus)}
                />
              ))}
              {hasil.length === 0 && (
                <p className="py-12 text-center text-sm text-[#6b7873]">
                  Tidak ada karya yang cocok. Coba ubah kata kunci atau pilih &ldquo;Semua lomba&rdquo; dan &ldquo;Semua status&rdquo;.
                </p>
              )}
              {(pesanSimpan || snapshotStatus.error) && (
                <p className="text-sm text-rose-700" role="alert">
                  {pesanSimpan || snapshotStatus.error}
                </p>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
