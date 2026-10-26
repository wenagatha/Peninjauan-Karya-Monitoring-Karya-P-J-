export default function DonutStatus({
  menunggu,
  ditinjau,
  diverifikasi,
  ditolak,
}: {
  menunggu: number;
  ditinjau: number;
  diverifikasi: number;
  ditolak: number;
}) {
  const statuses = [
    { nama: "Menunggu", jumlah: menunggu, warna: "#f0c879" },
    { nama: "Ditinjau", jumlah: ditinjau, warna: "#60a5fa" },
    { nama: "Diverifikasi", jumlah: diverifikasi, warna: "#245c4e" },
    { nama: "Ditolak", jumlah: ditolak, warna: "#f43f5e" },
  ];
  const total = statuses.reduce((jumlah, status) => jumlah + status.jumlah, 0);
  const r = 42;
  const k = 2 * Math.PI * r;
  let offset = 0;
  const segments = statuses.map((status) => {
    const panjang = total ? (status.jumlah / total) * k : 0;
    const bagian = { ...status, panjang, offset };
    offset += panjang;
    return bagian;
  });

  return (
    <div className="flex flex-col items-center gap-5">
      <svg viewBox="0 0 120 120" className="size-40" role="img" aria-label={statuses.map(({ nama, jumlah }) => `${jumlah} ${nama.toLowerCase()}`).join(", ")}>
        <circle cx="60" cy="60" r={r} fill="none" stroke="#edf0ee" strokeWidth="16" />
        <g transform="rotate(-90 60 60)" fill="none" strokeWidth="16">
          {segments.map((segment) => (
            <circle
              key={segment.nama}
              cx="60"
              cy="60"
              r={r}
              stroke={segment.warna}
              strokeDasharray={`${segment.panjang} ${k - segment.panjang}`}
              strokeDashoffset={-segment.offset}
            />
          ))}
        </g>
        <text x="60" y="58" textAnchor="middle" className="fill-[#183b35] text-[22px] font-semibold">{total}</text>
        <text x="60" y="74" textAnchor="middle" className="fill-[#718079] text-[9px]">karya</text>
      </svg>

      <ul className="w-full space-y-2 text-sm">
        {statuses.map((status) => (
          <li key={status.nama} className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-[#40554c]">
              <span className="size-2.5 rounded-sm" style={{ backgroundColor: status.warna }} />
              {status.nama}
            </span>
            <span className="font-semibold">{status.jumlah}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
