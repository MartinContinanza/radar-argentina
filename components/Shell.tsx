"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthButton } from "./auth-modal";

const NAV_ITEMS = [
  { label: "Noticias",        href: "/" },
  { label: "Fuentes",         href: "/fuentes" },
  { label: "Newsletter",      href: "/newsletter" },
  { label: "Auto-evaluación", href: "/autoevaluacion" },
  { label: "Acerca de",       href: "/acerca" },
];

export function Shell({
  children,
  loadingStatus,
}: {
  children: React.ReactNode;
  loadingStatus?: React.ReactNode;
}) {
  const path = usePathname();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">

      {/* ── Header ── */}
      <header className="border-b border-slate-700/60 bg-slate-900/95 sticky top-0 z-50 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">

          {/* Left: logo + brand */}
          <div className="flex items-center gap-4">
            <Link href="/" className="w-36 shrink-0">
              <Image
                src="/cu-logo.png"
                alt="Control Union"
                width={144}
                height={40}
                className="object-contain brightness-0 invert opacity-85"
              />
            </Link>
            <div className="w-px h-8 bg-slate-700" />
            <div className="flex items-center gap-3 flex-wrap">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-[#3EB2ED]">◈</span>
                <span className="font-display text-xl font-bold tracking-tight text-white">Radar</span>
              </Link>
              <span className="text-slate-500 text-sm hidden md:block">
                Sustentabilidad &amp; Certificaciones con impacto en Argentina
              </span>
            </div>
          </div>

          {/* Right: loading status + suggestion icon + auth button */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Suggestion bulb */}
            <Link
              href="/acerca#sugerencias"
              className="p-2 rounded-lg border border-slate-700 hover:border-[#3EB2ED] hover:text-[#3EB2ED] text-slate-400 transition-colors"
              title="Sugerencias de mejora"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.344.346A5.001 5.001 0 0112 17.5a5 5 0 01-2.829-.964l-.344-.346z" />
              </svg>
            </Link>

            {/* Loading status passed from page (e.g. RSS progress) */}
            {loadingStatus}

            {/* Auth button / user menu */}
            <AuthButton />
          </div>
        </div>
      </header>

      {/* ── Nav ── */}
      <nav className="border-b border-slate-700/60 bg-slate-900/80">
        <div className="max-w-6xl mx-auto px-4 flex items-center overflow-x-auto">
          {NAV_ITEMS.map((item) => {
            const active =
              path === item.href ||
              (item.href !== "/" && path.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2.5 text-sm whitespace-nowrap font-medium transition-colors border-b-2 -mb-px ${
                  active
                    ? "text-[#3EB2ED] border-[#3EB2ED]"
                    : "text-slate-400 border-transparent hover:text-slate-200"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ── Content ── */}
      <main className="flex-1">{children}</main>

      {/* ── Footer ── */}
      <Footer />
    </div>
  );
}

function Footer() {
  const [visits, setVisits] = useState<number | null>(null);

  useEffect(() => {
    try {
      const stored = parseInt(localStorage.getItem("radar_visits") || "0", 10);
      const newCount = stored + 1;
      localStorage.setItem("radar_visits", String(newCount));
      setVisits(newCount);
    } catch {
      setVisits(null);
    }
  }, []);

  return (
    <footer className="border-t border-slate-800 mt-12 py-6 px-4">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-3">
          <Image
            src="/cu-logo.png"
            alt="Control Union"
            width={96}
            height={26}
            className="object-contain brightness-0 invert opacity-30"
          />
          <span>Radar — desarrollado por Control Union Argentina</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Fuentes públicas oficiales · Sin datos propietarios</span>
          {visits !== null && (
            <span className="text-slate-700 text-[10px]">
              visitas: {visits.toLocaleString("es-AR")}
            </span>
          )}
        </div>
      </div>
    </footer>
  );
}
