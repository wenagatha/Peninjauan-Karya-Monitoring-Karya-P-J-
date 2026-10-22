"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const fieldClassName =
  "mt-2 h-12 w-full rounded-lg border border-[#d9dfdc] bg-white px-4 text-sm text-[#183b35] outline-none transition placeholder:text-[#929d98] focus:border-[#2c7767] focus:ring-4 focus:ring-[#2c7767]/10";

export default function AuthForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sandi, setSandi] = useState("");
  const [lihat, setLihat] = useState(false);
  const [error, setError] = useState("");

  function kirim(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (sandi.length < 8) return setError("Kata sandi minimal 8 karakter.");
    // Nanti: supabase.auth.signInWithPassword(...) lalu baca role dari tabel profiles.
    // Sementara: email yang memuat "juri" masuk sebagai juri, selain itu panitia.
    router.push(email.toLowerCase().includes("juri") ? "/juri" : "/panitia");
  }

  return (
    <main className="auth-page min-h-screen px-4 py-5 sm:px-7 sm:py-7">
      <div className="auth-shell mx-auto grid w-full max-w-[1180px] overflow-hidden rounded-[18px] bg-white shadow-[0_24px_80px_rgba(28,54,46,0.12)] lg:min-h-[min(860px,calc(100svh-56px))] lg:grid-cols-[1.02fr_0.98fr]">
        <aside className="auth-art relative flex min-h-[220px] flex-col justify-between overflow-hidden px-7 py-6 text-white sm:min-h-[270px] sm:px-10 sm:py-8 lg:min-h-0 lg:px-12 lg:py-10">
          <div className="relative z-10 flex items-center gap-3">
            <Image
              src="/assets/logo-kemenham.png"
              alt="Logo Kementerian Hukum dan HAM RI"
              width={40}
              height={40}
              className="size-10 shrink-0 object-contain"
              loading="eager"
            />
            <span className="text-sm font-semibold tracking-wide text-white/95">
              Kementerian Hukum dan HAM RI
            </span>
          </div>

          <div className="auth-art-copy relative z-10 mb-auto mt-10 max-w-[600px] py-0">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-[#f0c879]">
              Ruang kolaborasi
            </p>
            <h2 className="max-w-[470px] text-[30px] font-semibold leading-tight sm:text-[44px] lg:text-[52px]">
              Monitoring Lomba, Penilaian, dan Karya Peserta.
            </h2>
            <p className="mt-5 max-w-[480px] text-base leading-7 text-white/75 lg:text-lg">
              Halaman ini hanya dapat diakses oleh panitia dan juri
            </p>
          </div>

          <div className="auth-illustration pointer-events-none absolute bottom-[2%] right-[5%] hidden h-[310px] w-[390px] lg:block" aria-hidden="true">
            <div className="illustration-orbit illustration-orbit-one" />
            <div className="illustration-orbit illustration-orbit-two" />
            <div className="illustration-paper">
              <span className="paper-mark" />
              <span className="paper-line paper-line-long" />
              <span className="paper-line paper-line-short" />
              <span className="paper-line paper-line-medium" />
              <span className="paper-stamp">HAM</span>
            </div>
            <div className="illustration-trophy">
              <span className="trophy-handle trophy-handle-left" />
              <span className="trophy-handle trophy-handle-right" />
              <span className="trophy-cup">★</span>
              <span className="trophy-stem" />
              <span className="trophy-base" />
            </div>
            <div className="illustration-spark spark-one">✦</div>
            <div className="illustration-spark spark-two">✳</div>
            <div className="illustration-dot dot-one" />
            <div className="illustration-dot dot-two" />
          </div>

          <p className="relative z-10 hidden text-xs text-white/55 lg:block">
            © 2026 Lomba Hari HAM, L
          </p>
        </aside>

        <section className="flex items-center justify-center px-6 py-9 sm:px-12 sm:py-12 lg:px-[clamp(44px,7vw,88px)]">
          <form onSubmit={kirim} className="w-full max-w-[390px]">
            <div className="mb-7">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#55766a]">
                Akses panitia &amp; juri
              </p>
              <h1 className="text-[32px] font-semibold leading-tight tracking-[-0.03em] text-[#183b35]">
                Selamat Datang 
              </h1>
              <p className="mt-2 text-sm leading-6 text-[#718079]">
                Masuk untuk mengelola lomba, menilai karya peserta, dan memantau hasil penilaian.
              </p>
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-semibold text-[#40554c]">
                Email
                <input
                  className={fieldClassName}
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>

              <label className="block text-xs font-semibold text-[#40554c]">
                Kata sandi
                <span className="relative block">
                  <input
                    className={`${fieldClassName} pr-24`}
                    type={lihat ? "text" : "password"}
                    autoComplete="current-password"
                    minLength={8}
                    required
                    placeholder="Minimal 8 karakter"
                    value={sandi}
                    onChange={(event) => setSandi(event.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setLihat(!lihat)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded px-1 py-1 text-xs font-semibold text-[#55766a] hover:text-[#183b35] focus-visible:outline-2 focus-visible:outline-[#2c7767]"
                    aria-label={lihat ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
                  >
                    {lihat ? "Sembunyikan" : "Lihat"}
                  </button>
                </span>
              </label>
            </div>

            {error && (
              <p role="alert" className="mt-4 rounded-lg bg-[#fff0ed] px-3 py-2.5 text-sm text-[#a74431]">
                {error}
              </p>
            )}
            <button className="mt-6 h-12 w-full rounded-lg bg-[#245c4e] text-sm font-semibold text-white shadow-[0_5px_12px_rgba(36,92,78,0.16)] transition hover:bg-[#1c4b40] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245c4e]">
              Masuk ke akun
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
