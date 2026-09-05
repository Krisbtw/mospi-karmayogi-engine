"use client";

import { ArrowUpRight, ShieldCheck } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/75 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-sky-600 to-teal-400 text-white shadow-md">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white tracking-tight">MoSPI × iGOT Karmayogi</span>
              <span className="hidden sm:inline-block rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-medium text-sky-300 border border-sky-500/30">
                FRAC Prototype
              </span>
            </div>
            <p className="text-[11px] text-slate-400">National Statistical Capacity Platform</p>
          </div>
        </div>

        {/* Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <a href="#dashboard" className="text-slate-300 hover:text-white transition-colors">
            Officer Dashboard
          </a>
          <a href="#dashboard" className="text-slate-300 hover:text-white transition-colors">
            Competency Matrix
          </a>
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <a
            href="#dashboard"
            className="inline-flex items-center gap-2 rounded-md bg-sky-600 hover:bg-sky-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors"
          >
            <span>Cadre Portal</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </header>
  );
}
