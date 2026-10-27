"use client";
import { useState } from "react";

export type Hitung = { semua: number; cerita: number; komik: number };

const TAMPIL = [
  { kunci: "semua", akhiran: "" },
  { kunci: "cerita", akhiran: " Cerita" },
  { kunci: "komik", akhiran: " Komik" },
] as const;

const kartu = "rounded-xl border-2 border-[#52645c] border-t-4 border-t-emerald-600 bg-white p-3 text-left shadow-sm sm:p-5";

// data berupa angka = kartu biasa; data berupa Hitung = kartu yang bisa diklik untuk ganti tampilan
export default function StatCard({ judul, data }: { judul: string; data: Hitung | number }) {
  const [i, setI] = useState(0);

  if (typeof data === "number") {
    return (
      <div className={kartu}>
        <p className="text-xs text-[#718079] sm:text-sm">{judul}</p>
        <p className="mt-2 text-2xl font-semibold sm:mt-3 sm:text-3xl">{data}</p>
      </div>
    );
  }

  const t = TAMPIL[i];
  return (
    <button
      type="button"
      onClick={() => setI((i + 1) % TAMPIL.length)}
      aria-label={`${judul}${t.akhiran}: ${data[t.kunci]}. Klik untuk ganti tampilan.`}
      className={`${kartu} w-full transition hover:border-[#245c4e]/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245c4e]`}
    >
      <p className="text-xs text-[#718079] sm:text-sm">
        {judul}
        {t.akhiran}
      </p>
      <p className="mt-2 text-2xl font-semibold sm:mt-3 sm:text-3xl">{data[t.kunci]}</p>
      <span className="mt-2 flex items-center gap-1.5 sm:mt-3" aria-hidden="true">
        {TAMPIL.map((x, n) => (
          <span
            key={x.kunci}
            className={`h-1.5 rounded-full transition-all ${n === i ? "w-5 bg-[#245c4e]" : "w-1.5 bg-[#d5dcd8]"}`}
          />
        ))}
        <span className="ml-auto whitespace-nowrap text-[10px] text-[#929d98] sm:text-[11px]">klik untuk ganti</span>
      </span>
    </button>
  );
}
