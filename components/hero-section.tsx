"use client";

import { useReducedMotion, motion } from "framer-motion";
import { ArrowUpRight, FileUp, LayoutGrid, TrendingUp, BadgeCheck } from "lucide-react";
import { ShaderBackground } from "@/components/ui/kk";

/**
 * Landing hero for the MoSPI × iGOT Karmayogi platform.
 *
 * Integrated with the 21st.dev WebGL ShaderBackground ("Mesh drift").
 * Features real-time interactive mouse distortion, perceptual OKLab color mixing,
 * and frosted glass morphism over India's Official Statistical System capacity platform.
 */
export function HeroSection({ onOpenDocUpload }: { onOpenDocUpload?: () => void }) {
  const prefersReducedMotion = useReducedMotion();

  const fadeUp = {
    hidden: { opacity: 0, y: 14 },
    show: (delay: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: prefersReducedMotion ? 0.01 : 0.5, delay, ease: "easeOut" },
    }),
  };

  return (
    <section className="relative overflow-hidden bg-slate-950 text-slate-100">
      {/* Interactive WebGL Shader Canvas background */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <ShaderBackground className="h-full w-full opacity-70" />
      </div>

      {/* Structured depth overlays: dot grid + smooth gradient blend to content below */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-dot-grid opacity-15" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950"
        aria-hidden
      />

      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-16 px-6 py-20 lg:grid-cols-12 lg:gap-8 lg:py-28">
        {/* Left column: copy & CTAs */}
        <div className="lg:col-span-6 lg:pt-4">
          <motion.div
            initial="hidden"
            animate="show"
            custom={0}
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-slate-900/70 backdrop-blur-md px-4 py-1.5 shadow-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping-slow rounded-full bg-sky-400" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-400" />
            </span>
            <span className="text-sm font-medium text-slate-200">
              iGOT Karmayogi Bharat · FRAC standard aligned
            </span>
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="show"
            custom={0.1}
            variants={fadeUp}
            className="mt-6 text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[3.25rem]"
          >
            AI-driven capacity building for{" "}
            <span className="bg-gradient-to-r from-sky-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
              India&apos;s statistical machine
            </span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="show"
            custom={0.2}
            variants={fadeUp}
            className="mt-5 max-w-xl text-lg leading-relaxed text-slate-300"
          >
            Upload a PLFS handbook or a CPI methodology note. The platform
            finds where each officer&apos;s competency falls short of their
            cadre&apos;s FRAC baseline, and hands them the exact iGOT
            Karmayogi course that closes it.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="show"
            custom={0.3}
            variants={fadeUp}
            className="mt-9 flex flex-col gap-3 sm:flex-row"
          >
            <button
              type="button"
              onClick={onOpenDocUpload}
              className="group inline-flex cursor-pointer items-center justify-center gap-2 rounded-md bg-amber-500 hover:bg-amber-400 px-6 py-3 font-semibold text-slate-950 shadow-lg shadow-amber-500/20 transition-transform duration-200 hover:-translate-y-0.5"
            >
              <FileUp className="h-4 w-4" aria-hidden />
              Upload methodology PDF
              <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
            </button>
            <a
              href="#dashboard"
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border border-white/20 bg-white/10 hover:bg-white/15 px-6 py-3 font-semibold text-white backdrop-blur-md shadow-sm transition-colors duration-200"
            >
              <LayoutGrid className="h-4 w-4" aria-hidden />
              Explore competency matrix
            </a>
          </motion.div>

          <motion.dl
            initial="hidden"
            animate="show"
            custom={0.4}
            variants={fadeUp}
            className="mt-14 grid grid-cols-3 gap-6 border-t border-white/15 pt-8"
          >
            {[
              ["6", "cadre ranks mapped"],
              ["120+", "FRAC competencies"],
              ["4", "MoSPI domains covered"],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="font-data text-2xl font-semibold text-white">{value}</dt>
                <dd className="mt-1 text-sm text-slate-400">{label}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* Right column: floating interactive preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0.01 : 0.6, delay: 0.25, ease: "easeOut" }}
          className="relative lg:col-span-6"
        >
          <div className="relative mx-auto max-w-md lg:mx-0 lg:ml-auto">
            <RadarPreviewCard />
            <GapClosedBadge />
            <CourseRecommendationCard />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function RadarPreviewCard() {
  const axes = 5;
  const center = 110;
  const radius = 78;
  const current = [0.55, 0.7, 0.4, 0.65, 0.5];
  const target = [0.8, 0.85, 0.75, 0.8, 0.8];

  const pointAt = (i: number, value: number) => {
    const angle = (Math.PI * 2 * i) / axes - Math.PI / 2;
    return [center + radius * value * Math.cos(angle), center + radius * value * Math.sin(angle)];
  };
  const toPath = (values: number[]) =>
    values.map((v, i) => pointAt(i, v).join(",")).join(" ");

  return (
    <div className="rounded-xl border border-white/15 bg-slate-900/80 p-5 shadow-2xl backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-white">Officer skill baseline</p>
        <span className="rounded-full bg-sky-500/20 border border-sky-500/30 px-2.5 py-0.5 text-xs font-medium text-sky-300">
          JSO · Price Statistics
        </span>
      </div>
      <svg viewBox="0 0 220 220" className="h-56 w-full" role="img" aria-label="Radar chart comparing current and target competency levels">
        {[0.25, 0.5, 0.75, 1].map((r) => (
          <polygon
            key={r}
            points={Array.from({ length: axes })
              .map((_, i) => pointAt(i, r).join(","))
              .join(" ")}
            fill="none"
            stroke="currentColor"
            className="text-slate-700"
            strokeWidth={1}
          />
        ))}
        <polygon points={toPath(target)} fill="rgba(16, 185, 129, 0.16)" stroke="#10b981" strokeWidth={1.5} strokeDasharray="4 3" />
        <polygon points={toPath(current)} fill="rgba(2, 132, 199, 0.35)" stroke="#38bdf8" strokeWidth={2} />
      </svg>
      <div className="flex items-center gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-sky-400" /> Current
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full border border-emerald-400 border-dashed" /> Target (JSO baseline)
        </span>
      </div>
    </div>
  );
}

function GapClosedBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="absolute -left-8 top-10 hidden items-center gap-2 rounded-lg border border-white/15 bg-slate-900/85 px-4 py-2.5 shadow-xl backdrop-blur-xl sm:flex"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
        <TrendingUp className="h-4 w-4" aria-hidden />
      </span>
      <div>
        <p className="text-xs font-medium text-slate-400">National Accounts</p>
        <p className="font-data text-sm font-semibold text-emerald-400">+18% gap closed</p>
      </div>
    </motion.div>
  );
}

function CourseRecommendationCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.75 }}
      className="absolute -bottom-8 -right-4 w-64 rounded-lg border border-white/15 bg-slate-900/85 p-3.5 shadow-xl backdrop-blur-xl sm:right-4"
    >
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30">
          <BadgeCheck className="h-4 w-4" aria-hidden />
        </span>
        <div>
          <p className="text-xs text-slate-400">Recommended on iGOT Karmayogi</p>
          <p className="text-sm font-semibold text-white">CPI Compilation: Advanced Index Methods</p>
          <p className="mt-1 text-xs text-sky-400">Closes 2 of 3 flagged gaps</p>
        </div>
      </div>
    </motion.div>
  );
}
