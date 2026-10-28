"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { DATA_CONTOH, type KaryaPeserta } from "@/components/DaftarKaryaPeserta";
import TinjauanKarya from "@/components/TinjauanKarya";
import { PESERTA } from "@/lib/data";

function KontenTinjauanJuri() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const kategoriKandidat = searchParams.get("kategoriKandidat");
  const kembaliKeKandidat =
    kategoriKandidat === "Cerita" || kategoriKandidat === "Komik"
      ? kategoriKandidat
      : undefined;
  const kategoriPemenang = searchParams.get("kategoriPemenang");
  const kembaliKePemenang =
    kategoriPemenang === "Cerita" || kategoriPemenang === "Komik"
      ? kategoriPemenang
      : undefined;
  const hrefKembali = kembaliKeKandidat
    ? kembaliKeKandidat === "Cerita"
      ? "/kandidat/cerita"
      : "/kandidat/komik"
    : kembaliKePemenang
      ? kembaliKePemenang === "Cerita"
        ? "/pemenang/cerita"
        : "/pemenang/komik"
      : "/karya";
  const labelKembali = kembaliKeKandidat
    ? kembaliKeKandidat === "Cerita"
      ? "Kandidat Cerita HAM"
      : "Kandidat Komik Bergambar"
    : kembaliKePemenang
      ? kembaliKePemenang === "Cerita"
        ? "Pemenang Cerita HAM"
        : "Pemenang Komik Bergambar"
      : "Daftar Karya";
  let karya: KaryaPeserta | undefined;

  if (id.startsWith("peringkat-")) {
    const pesertaId = Number(id.slice("peringkat-".length));
    const peserta = Number.isSafeInteger(pesertaId)
      ? PESERTA.find((item) => item.id === pesertaId && item.judul !== null)
      : undefined;
    const dataKaryaPeserta = peserta
      ? DATA_CONTOH.find((item) => item.id === `peserta-${peserta.id}`)
      : undefined;
    const contohBerkas = peserta
      ? DATA_CONTOH.find((item) => item.lomba === peserta.lomba)
      : undefined;

    if (peserta && contohBerkas) {
      karya = {
        id: `peserta-${peserta.id}`,
        lomba: peserta.lomba,
        namaPeserta: peserta.nama,
        tipePeserta: dataKaryaPeserta?.tipePeserta ?? "Individu",
        asal: peserta.asal,
        mendaftarPada:
          dataKaryaPeserta?.mendaftarPada ?? `${peserta.daftar}T00:00:00+07:00`,
        dikirimPada: dataKaryaPeserta?.dikirimPada ?? null,
        status: peserta.status,
        berkas: dataKaryaPeserta?.berkas ?? contohBerkas.berkas,
      };
    }
  } else {
    karya = DATA_CONTOH.find((item) => item.id === id);
  }

  if (!karya) {
    return (
      <main className="mx-auto max-w-xl space-y-4 p-8 text-center">
        <h1 className="text-xl font-semibold text-[#183b35]">Karya tidak ditemukan</h1>
        <p className="text-sm text-[#718079]">Data karya yang dipilih tidak tersedia.</p>
        <Link href={hrefKembali} className="inline-flex rounded-lg bg-[#245c4e] px-4 py-2 text-sm font-semibold text-white">
          Kembali ke {labelKembali}
        </Link>
      </main>
    );
  }

  return (
    <TinjauanKarya
      karya={karya}
      kembaliKeKandidat={kembaliKeKandidat}
      kembaliKePemenang={kembaliKePemenang}
    />
  );
}

export default function HalamanTinjauanJuri() {
  return (
    <Suspense fallback={<p className="p-8 text-center text-sm text-[#718079]">Memuat karya...</p>}>
      <KontenTinjauanJuri />
    </Suspense>
  );
}
