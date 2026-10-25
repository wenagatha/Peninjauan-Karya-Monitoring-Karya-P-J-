"use client";
import { useState } from "react";
import { BADGE, tanggal, type Peserta } from "@/lib/data";

const input = "h-10 rounded-lg border border-[#d9dfdc] bg-white px-3 text-sm outline-none focus:border-[#2c7767]";

export default function TabelPeserta({ peserta }: { peserta: Peserta[] }) {
  const [q, setQ] = useState("");
  const [lomba, setLomba] = useState("");

  const tampil = peserta.filter(
    (p) =>
      (!lomba || p.lomba === lomba) &&
      `${p.nama} ${p.asal} ${p.judul ?? ""}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-3">
        <input className={`${input} min-w-0 flex-1`} placeholder="Cari nama, asal, atau judul" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Cari peserta" />
        <select className={input} value={lomba} onChange={(e) => setLomba(e.target.value)} aria-label="Filter lomba">
          <option value="">Semua lomba</option>
          <option value="Cerita">Lomba Cerita</option>
          <option value="Komik">Lomba Komik</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-[#e3e8e5] text-xs uppercase tracking-wide text-[#718079]">
              <th className="py-2.5 pr-3 font-semibold">Peserta</th>
              <th className="py-2.5 pr-3 font-semibold">Lomba</th>
              <th className="py-2.5 pr-3 font-semibold">Judul karya</th>
              <th className="py-2.5 pr-3 font-semibold">Daftar</th>
              <th className="py-2.5 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {tampil.map((p) => (
              <tr key={p.id} className="border-b border-[#f0f3f1] last:border-0">
                <td className="py-3 pr-3">
                  <p className="font-semibold">{p.nama}</p>
                  <p className="text-xs text-[#718079]">{p.asal}</p>
                </td>
                <td className="py-3 pr-3">{p.lomba}</td>
                <td className="py-3 pr-3">{p.judul ?? <span className="text-[#929d98]">Belum mengirim</span>}</td>
                <td className="whitespace-nowrap py-3 pr-3 text-[#40554c]">{tanggal(p.daftar)}</td>
                <td className="py-3">
                  <span className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${BADGE[p.status]}`}>{p.status}</span>
                </td>
              </tr>
            ))}
            {tampil.length === 0 && (
              <tr><td colSpan={5} className="py-8 text-center text-[#718079]">Tidak ada peserta yang cocok.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
