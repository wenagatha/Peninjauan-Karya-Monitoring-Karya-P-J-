export default function ChartPendaftaran({ cerita, komik }: { cerita: number; komik: number }) {
  const maks = Math.max(1, cerita, komik);
  const batang = [
    { nama: "Lomba Cerita", n: cerita, warna: "#245c4e" },
    { nama: "Lomba Komik", n: komik, warna: "#e9a36f" },
  ];

  return (
    <div role="img" aria-label={`Pendaftar Lomba Cerita ${cerita}, Lomba Komik ${komik}`}>
      <div className="flex justify-center gap-10">
        {batang.map((b) => (
          <div key={b.nama} className="w-24 text-center">
            <div className="flex h-40 flex-col items-center justify-end border-b border-[#e3e8e5]">
              <span className="mb-1 text-lg font-semibold">{b.n}</span>
              <span className="w-full rounded-t-lg" style={{ height: `${(b.n / maks) * 75}%`, background: b.warna }} />
            </div>
            <p className="mt-2 text-xs text-[#718079]">{b.nama}</p>
          </div>
        ))}
      </div>
      <p className="mt-5 text-center text-sm text-[#718079]">Total {cerita + komik} peserta</p>
    </div>
  );
}