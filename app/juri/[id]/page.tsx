"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DATA_CONTOH } from "@/components/DaftarKaryaPeserta";
import TinjauanKarya from "@/components/TinjauanKarya";

function KontenTinjauanJuri() {
  const { id } = useParams<{ id: string }>();
  const karya = DATA_CONTOH.find((item) => item.id === id);

  if (!karya) {
    return (
      <main className="mx-auto max-w-xl space-y-4 p-8 text-center">
        <h1 className="text-xl font-semibold text-[#183b35]">Karya tidak ditemukan</h1>
        <p className="text-sm text-[#718079]">Data karya yang dipilih tidak tersedia.</p>
        <Link href="/karya" className="inline-flex rounded-lg bg-[#245c4e] px-4 py-2 text-sm font-semibold text-white">
          Kembali ke Daftar Karya
        </Link>
      </main>
    );
  }

  return <TinjauanKarya karya={karya} />;
}

export default function HalamanTinjauanJuri() {
  return (
    <Suspense fallback={<p className="p-8 text-center text-sm text-[#718079]">Memuat karya...</p>}>
      <KontenTinjauanJuri />
    </Suspense>
  );
}
