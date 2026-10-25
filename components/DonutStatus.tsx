export default function DonutStatus({ ditinjau, verifikasi }: { ditinjau: number; verifikasi: number }) {
  const total = ditinjau + verifikasi;
  const r = 42;
  const k = 2 * Math.PI * r;
  const p1 = total ? (ditinjau / total) * k : 0;
  const p2 = total ? (verifikasi / total) * k : 0;

  return (
    <div className="flex flex-col items-center gap-5">
      <svg viewBox="0 0 120 120" className="size-40" role="img" aria-label={`${ditinjau} karya perlu ditinjau, ${verifikasi} karya sudah diverifikasi`}>
        <circle cx="60" cy="60" r={r} fill="none" stroke="#edf0ee" strokeWidth="16" />
        <g transform="rotate(-90 60 60)" fill="none" strokeWidth="16">
          <circle cx="60" cy="60" r={r} stroke="#f0c879" strokeDasharray={`${p1} ${k - p1}`} />
          <circle cx="60" cy="60" r={r} stroke="#245c4e" strokeDasharray={`${p2} ${k - p2}`} strokeDashoffset={-p1} />
        </g>
        <text x="60" y="58" textAnchor="middle" className="fill-[#183b35] text-[22px] font-semibold">{total}</text>
        <text x="60" y="74" textAnchor="middle" className="fill-[#718079] text-[9px]">karya</text>
      </svg>

      <ul className="w-full space-y-2 text-sm">
        <li className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-[#40554c]"><span className="size-2.5 rounded-sm bg-[#f0c879]" />Perlu ditinjau</span>
          <span className="font-semibold">{ditinjau}</span>
        </li>
        <li className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-[#40554c]"><span className="size-2.5 rounded-sm bg-[#245c4e]" />Sudah diverifikasi</span>
          <span className="font-semibold">{verifikasi}</span>
        </li>
      </ul>
    </div>
  );
}
