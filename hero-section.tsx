"use client";

import { useReducedMotion, motion } from "framer-motion";
import { ArrowUpRight, FileUp, LayoutGrid, TrendingUp, BadgeCheck } from "lucide-react";

/**
 * Landing hero for the MoSPI × iGOT Karmayogi platform.
 *
 * Layout: two-column on desktop (copy + CTAs left, floating competency
 * preview right), stacked on mobile. Background is a static dot grid plus
 * two soft gradient blobs — motion is limited to a single orchestrated
 * entrance and the badge's radar ping, per the brief's "subtle" motion dial.
 */
export function HeroSection() {
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
    <section className="relative overflow-hidden bg-bg">
      {/* Background layer: dot grid + gradient blobs */}
      <div className="pointer-events-none absolute inset-0 bg-dot-grid opacity-[0.35]" aria-hidden />
      <div
        className="pointer-events-none absolute -top-32 -left-20 h-[420px] w-[420px] rounded-full bg-secondary opacity-25 blur-[110px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-40 right-0 h-[380px] w-[380px] rounded-full bg-tertiary opacity-25 blur-[110px]"
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-16 px-6 py-24 lg:grid-cols-12 lg:gap-8 lg:py-32">
        {/* Left column: copy */}
        <div className="lg:col-span-6 lg:pt-4">
          <motion.div
            initial="hidden"
            animate="show"
            custom={0}
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-4 py-1.5 shadow-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping-slow rounded-full bg-secondary" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-secondary" />
            </span>
            <span className="text-sm font-medium text-fg-muted">
              iGOT Karmayogi Bharat · FRAC standard aligned
            </span>
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="show"
            custom={0.1}
            variants={fadeUp}
            className="mt-6 text-4xl font-semibold leading-[1.1] tracking-tight text-fg sm:text-5xl lg:text-[3.25rem]"
          >
            AI-driven capacity building for{" "}
            <span className="bg-gradient-to-r from-secondary via-primary to-tertiary bg-clip-text text-transparent">
              India&apos;s statistical machine
            </span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="show"
            custom={0.2}
            variants={fadeUp}
            className="mt-5 max-w-xl text-lg leading-relaxed text-fg-muted"
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
              className="group inline-flex cursor-pointer items-center justify-center gap-2 rounded-md bg-accent px-6 py-3 font-semibold text-accent-foreground shadow-glow-accent transition-transform duration-200 hover:-translate-y-0.5"
            >
              <FileUp className="h-4 w-4" aria-hidden />
              Upload methodology PDF
              <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
            </button>
            <button
              type="button"
              className="glass-panel inline-flex cursor-pointer items-center justify-center gap-2 rounded-md px-6 py-3 font-semibold text-fg shadow-sm transition-colors duration-200 hover:bg-surface"
            >
              <LayoutGrid className="h-4 w-4" aria-hidden />
              Explore competency matrix
            </button>
          </motion.div>

          <motion.dl
            initial="hidden"
            animate="show"
            custom={0.4}
            variants={fadeUp}
            className="mt-14 grid grid-cols-3 gap-6 border-t border-border pt-8"
          >
            {[
              ["6", "cadre ranks mapped"],
              ["120+", "FRAC competencies"],
              ["4", "MoSPI domains covered"],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="font-data text-2xl font-semibold text-fg">{value}</dt>
                <dd className="mt-1 text-sm text-fg-muted">{label}</dd>
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
  // Static illustrative pentagon radar — not the live dashboard chart
  // (see components/dashboard/competency-radar.tsx for the real one).
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
    <div className="glass-panel rounded-xl p-5 shadow-lg">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-fg">Officer skill baseline</p>
        <span className="rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-medium text-secondary">
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
            className="text-border"
            strokeWidth={1}
          />
        ))}
        <polygon points={toPath(target)} fill="rgb(var(--color-tertiary) / 0.12)" stroke="rgb(var(--color-tertiary))" strokeWidth={1.5} strokeDasharray="4 3" />
        <polygon points={toPath(current)} fill="rgb(var(--color-secondary) / 0.22)" stroke="rgb(var(--color-secondary))" strokeWidth={2} />
      </svg>
      <div className="flex items-center gap-4 text-xs text-fg-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-secondary" /> Current
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full border border-tertiary border-dashed" /> Target (JSO baseline)
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
      className="glass-panel absolute -left-8 top-10 hidden items-center gap-2 rounded-lg px-4 py-2.5 shadow-md sm:flex"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-tertiary/15 text-tertiary">
        <TrendingUp className="h-4 w-4" aria-hidden />
      </span>
      <div>
        <p className="text-xs font-medium text-fg-muted">National Accounts</p>
        <p className="font-data text-sm font-semibold text-tertiary">+18% gap closed</p>
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
      className="glass-panel absolute -bottom-8 -right-4 w-64 rounded-lg p-3.5 shadow-md sm:right-4"
    >
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent/15 text-accent">
          <BadgeCheck className="h-4 w-4" aria-hidden />
        </span>
        <div>
          <p className="text-xs text-fg-muted">Recommended on iGOT Karmayogi</p>
          <p className="text-sm font-semibold text-fg">CPI Compilation: Advanced Index Methods</p>
          <p className="mt-1 text-xs text-secondary">Closes 2 of 3 flagged gaps</p>
        </div>
      </div>
    </motion.div>
  );
}
