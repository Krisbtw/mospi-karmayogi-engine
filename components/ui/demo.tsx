"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Info, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { ShaderBackground } from "@/components/ui/kk";

export default function ShaderBackgroundDemo() {
  const [showControls, setShowControls] = useState(true);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-slate-950 font-ui text-white select-none">
      {/* Full viewport WebGL Shader Canvas */}
      <ShaderBackground className="h-full w-full" />

      {/* Top Floating Navigation Header */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-6 pointer-events-none">
        <Link
          href="/"
          className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/20 bg-slate-950/70 px-4 py-2 text-sm font-medium text-white shadow-xl backdrop-blur-md transition-all hover:bg-slate-900 hover:border-white/30 hover:scale-[1.02]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to MoSPI Platform</span>
        </Link>

        <div className="pointer-events-auto flex items-center gap-3">
          <button
            onClick={() => setShowControls((prev) => !prev)}
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-slate-950/70 px-3.5 py-1.5 text-xs text-slate-300 shadow-xl backdrop-blur-md hover:text-white hover:bg-slate-900 transition-colors"
          >
            {showControls ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            <span>{showControls ? "Hide Info" : "Show Info"}</span>
          </button>
        </div>
      </div>

      {/* Bottom Floating Info HUD Card */}
      {showControls && (
        <div className="absolute bottom-6 left-6 z-20 max-w-sm pointer-events-auto">
          <div className="rounded-2xl border border-white/15 bg-slate-950/80 p-5 shadow-2xl backdrop-blur-xl transition-all">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">WebGL Mesh Drift</h3>
                <p className="text-[11px] text-slate-400">21st.dev Shader Builder</p>
              </div>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-slate-300">
              Zero external dependencies. Runs directly on GPU via a custom fragment shader featuring OKLab perceptual color mixing, domain warping, and cursor ripple physics.
            </p>

            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Integrated in Landing Hero
              </span>
              <span className="font-mono text-sky-300">60 FPS · WebGL1</span>
            </div>
          </div>
        </div>
      )}

      {/* Subdued interaction prompt */}
      <div className="pointer-events-none absolute bottom-6 right-6 z-10 hidden sm:block text-right">
        <p className="text-xs font-medium text-slate-400/80 tracking-wide">
          Move your mouse across the screen to distort the shader domain
        </p>
      </div>
    </div>
  );
}
