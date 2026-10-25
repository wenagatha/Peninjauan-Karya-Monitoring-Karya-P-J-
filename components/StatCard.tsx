"use client";
import { useState } from "react";

export type Hitung = { semua: number; cerita: number; komik: number };

const TAMPIL = [
  { kunci: "semua", akhiran: "" },
  { kunci: "cerita", akhiran: " Cerita" },
  { kunci: "komik", akhiran: " Komik" },
] as const;

const kartu = "rounded-xl border border-[#e3e8e5] bg-white p-5 text-left";

// data berupa angka = kartu biasa; data berupa Hitung = kartu yang bisa diklik untuk ganti tampilan
export default function StatCard({ judul, data }: { judul: string; data: Hitung | number }) {
  const [i, setI] = useState(0);

  if (typeof data === "number") {
    return (
      <div className={kartu}>
        <p className="text-sm text-[#718079]">{judul}</p>
        <p className="mt-3 text-3xl font-semibold">{data}</p>
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
      <p className="text-sm text-[#718079]">
        {judul}
        {t.akhiran}
      </p>
      <p className="mt-3 text-3xl font-semibold">{data[t.kunci]}</p>
      <span className="mt-3 flex items-center gap-1.5" aria-hidden="true">
        {TAMPIL.map((x, n) => (
          <span
            key={x.kunci}
            className={`h-1.5 rounded-full transition-all ${n === i ? "w-5 bg-[#245c4e]" : "w-1.5 bg-[#d5dcd8]"}`}
          />
        ))}
        <span className="ml-auto text-[11px] text-[#929d98]">klik untuk ganti</span>
      </span>
    </button>
  );
}
