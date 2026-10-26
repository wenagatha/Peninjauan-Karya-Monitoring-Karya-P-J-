export type StatusKarya = "Menunggu" | "Ditinjau" | "Diverifikasi" | "Ditolak";

export const DAFTAR_STATUS_KARYA: StatusKarya[] = [
  "Menunggu",
  "Ditinjau",
  "Diverifikasi",
  "Ditolak",
];

export const KUNCI_STATUS_KARYA = "dashboard-lomba-status-karya";
const EVENT_STATUS_KARYA = "dashboard-lomba-status-karya-change";

export type SnapshotStatusKarya = {
  status: Record<string, StatusKarya>;
  error: string | null;
};

const SNAPSHOT_SERVER: SnapshotStatusKarya = { status: {}, error: null };
let snapshotRaw: string | null | undefined;
let snapshot: SnapshotStatusKarya = SNAPSHOT_SERVER;

export function isStatusKarya(value: unknown): value is StatusKarya {
  return typeof value === "string" && DAFTAR_STATUS_KARYA.includes(value as StatusKarya);
}

function parseStatusKarya(tersimpan: string | null): SnapshotStatusKarya {
  if (!tersimpan) return SNAPSHOT_SERVER;

  let hasil: unknown;
  try {
    hasil = JSON.parse(tersimpan);
  } catch {
    return { status: {}, error: "Data status karya tersimpan tidak dapat dibaca." };
  }

  if (typeof hasil !== "object" || hasil === null || Array.isArray(hasil)) {
    return { status: {}, error: "Format data status karya tersimpan tidak valid." };
  }

  const status: Record<string, StatusKarya> = {};
  for (const [id, nilai] of Object.entries(hasil)) {
    if (!isStatusKarya(nilai)) {
      return {
        status: {},
        error: "Data status karya tersimpan berisi status yang tidak dikenal.",
      };
    }
    status[id] = nilai;
  }

  return { status, error: null };
}

export function getSnapshotStatusKarya(): SnapshotStatusKarya {
  let tersimpan: string | null;
  try {
    tersimpan = window.localStorage.getItem(KUNCI_STATUS_KARYA);
  } catch {
    if (snapshot.error === "Penyimpanan status karya tidak dapat diakses.") return snapshot;
    snapshotRaw = undefined;
    snapshot = { status: {}, error: "Penyimpanan status karya tidak dapat diakses." };
    return snapshot;
  }

  if (tersimpan !== snapshotRaw) {
    snapshotRaw = tersimpan;
    snapshot = parseStatusKarya(tersimpan);
  }
  return snapshot;
}

export function getServerSnapshotStatusKarya() {
  return SNAPSHOT_SERVER;
}

export function subscribeStatusKarya(onChange: () => void) {
  window.addEventListener(EVENT_STATUS_KARYA, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT_STATUS_KARYA, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function simpanStatusKarya(status: Record<string, StatusKarya>) {
  window.localStorage.setItem(KUNCI_STATUS_KARYA, JSON.stringify(status));
  snapshotRaw = JSON.stringify(status);
  snapshot = { status, error: null };
  window.dispatchEvent(new Event(EVENT_STATUS_KARYA));
}
