"use client";

import { ArrowUpRight } from "lucide-react";

const NAV_LINKS = [
  { href: "#dashboard", label: "Officer dashboard" },
  { href: "#dashboard", label: "Competency matrix" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between px-6 lg:px-10">
        {/* Brand */}
        <a
          href="#"
          className="group flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          <span
            aria-hidden
            className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-700 bg-slate-900 font-mono text-[11px] font-semibold tracking-tight text-amber-400 transition-colors duration-200 group-hover:border-amber-500/40 group-hover:bg-slate-800"
          >
            MS
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-sm font-semibold tracking-tight text-white">
              MoSPI × iGOT Karmayogi
            </span>
            <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">
              FRAC prototype · v0.4
            </span>
          </span>
        </a>

        {/* Links */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-400 transition-colors duration-200 hover:bg-slate-900 hover:text-white active:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Action */}
        <a
          href="#dashboard"
          className="group inline-flex h-8 items-center gap-1.5 rounded-md bg-amber-500 px-3.5 text-xs font-semibold text-slate-950 shadow-sm transition-[background-color,transform,box-shadow] duration-200 hover:-translate-y-px hover:bg-amber-400 hover:shadow-md active:translate-y-0 active:scale-[0.98] active:bg-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          <span>Cadre portal</span>
          <ArrowUpRight
            className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            aria-hidden
          />
        </a>
      </div>
    </header>
  );
}
