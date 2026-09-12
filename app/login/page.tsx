"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  User,
  ArrowRight,
  Sparkles,
  Lock,
  Building2,
  CheckCircle2,
  KeyRound,
  ExternalLink,
  Info,
  RefreshCw,
} from "lucide-react";
import { DEMO_OFFICERS, Officer } from "@/lib/data-service";
import { DotMatrixGrid } from "@/components/ui/dot-matrix-grid";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"demo" | "sso" | "credentials">("demo");
  const [selectedRole, setSelectedRole] = useState<"OFFICER" | "TRAINING_ADMIN">("OFFICER");
  const [emailOrId, setEmailOrId] = useState("anjali.sharma@mospi.gov.in");
  const [password, setPassword] = useState("••••••••••••");
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleLogin = (role: "OFFICER" | "TRAINING_ADMIN") => {
    setIsLoading(true);
    setStatusMessage(`Authenticating ${role === "OFFICER" ? "Cadre Officer" : "Training Division Admin"} credentials...`);
    try {
      localStorage.setItem("mospi_user_role", role);
    } catch {
      // Ignore
    }

    setTimeout(() => {
      setIsLoading(false);
      router.push("/");
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-teal-600 selection:text-white relative">
      {/* Background Dot Grid for subtle institutional statistical aesthetic */}
      <DotMatrixGrid opacity={0.35} gap={24} color="#009f9b" />

      {/* Top Government Banner */}
      <header className="border-b border-slate-200/90 bg-white/85 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
            <span className="font-semibold text-slate-800">
              Government of India · Official Statistical Portal
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[11px] text-slate-500">
            <span>Ministry of Statistics and Programme Implementation</span>
            <span>·</span>
            <span className="text-teal-700 font-semibold flex items-center gap-1">
              <Lock className="h-3 w-3" /> NIC Secure Gateway
            </span>
          </div>
        </div>
      </header>

      {/* Main Login Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10">
        <div className="w-full max-w-2xl bg-white border border-slate-200/90 rounded-2xl shadow-xl p-6 sm:p-8 relative backdrop-blur-sm">
          {/* Institutional Branding */}
          <div className="text-center mb-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/25 bg-teal-50 px-3.5 py-1 text-xs font-semibold text-teal-800 mb-3.5 shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-teal-600" />
              <span>MoSPI × iGOT Karmayogi Statistical Capacity Platform</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              National Statistical Systems Portal
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
              Competency Assessment, FRAC Mapping, and AI Learning Path Engine for India’s Official Statistical Cadre.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex border-b border-slate-200 mb-6 text-xs sm:text-sm font-medium">
            <button
              type="button"
              onClick={() => setActiveTab("demo")}
              className={`flex-1 pb-3 text-center border-b-2 transition-all cursor-pointer ${
                activeTab === "demo"
                  ? "border-teal-600 text-teal-700 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              1-Click Presentation Login
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("credentials")}
              className={`flex-1 pb-3 text-center border-b-2 transition-all cursor-pointer ${
                activeTab === "credentials"
                  ? "border-teal-600 text-teal-700 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Gov.in Credentials
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("sso")}
              className={`flex-1 pb-3 text-center border-b-2 transition-all cursor-pointer ${
                activeTab === "sso"
                  ? "border-teal-600 text-teal-700 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              iGOT Karmayogi SSO
            </button>
          </div>

          {/* TAB 1: 1-Click Evaluation / Demo Login Cards */}
          {activeTab === "demo" && (
            <div className="space-y-4">
              <div className="rounded-lg bg-teal-50 border border-teal-200/80 p-3 text-xs text-teal-900 flex items-start gap-2.5">
                <Info className="h-4 w-4 shrink-0 mt-0.5 text-teal-600" />
                <span>
                  <strong>Hackathon Demo Access:</strong> Select a role to immediately enter the unified dashboard with pre-calibrated FRAC competencies and live data.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Officer Persona Card */}
                <div
                  onClick={() => handleLogin("OFFICER")}
                  className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 hover:border-teal-500 hover:bg-teal-50/30 transition-all cursor-pointer shadow-xs hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
                        <User className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                        Operational
                      </span>
                    </div>

                    <h3 className="mt-3 text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                      Cadre Officer
                    </h3>
                    <p className="text-xs text-teal-600 font-semibold">Learn · Practise · Improve</p>

                    <div className="mt-3.5 space-y-1 rounded-lg bg-slate-50 p-2.5 border border-slate-200 text-[11px] text-slate-700">
                      <p className="font-semibold text-slate-900">Anjali Sharma (JSO)</p>
                      <p className="text-slate-500">Field Operations Division (FOD)</p>
                      <p className="text-[10px] font-mono text-teal-700 font-semibold">Rank: Level 3 Benchmark</p>
                    </div>

                    <ul className="mt-3 space-y-1.5 text-[11px] text-slate-600">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                        <span>FRAC radar gap diagnosis</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                        <span>Personalized iGOT course catalog</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                        <span>Source-linked AI diagnostic MCQs</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-3 py-2 text-xs font-semibold text-white shadow-xs hover:bg-teal-700 transition-colors cursor-pointer"
                  >
                    <span>Login as Cadre Officer</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Training Admin Persona Card */}
                <div
                  onClick={() => handleLogin("TRAINING_ADMIN")}
                  className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 hover:border-indigo-500 hover:bg-indigo-50/30 transition-all cursor-pointer shadow-xs hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                        Institutional
                      </span>
                    </div>

                    <h3 className="mt-3 text-base font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                      Training Division Admin
                    </h3>
                    <p className="text-xs text-indigo-600 font-semibold">Assess · Validate · Monitor</p>

                    <div className="mt-3.5 space-y-1 rounded-lg bg-slate-50 p-2.5 border border-slate-200 text-[11px] text-slate-700">
                      <p className="font-semibold text-slate-900">Dr. Rajiv Sen</p>
                      <p className="text-slate-500">NSSTA Training Directorate</p>
                      <p className="text-[10px] font-mono text-indigo-700 font-semibold">MoSPI HQ · Institutional Review</p>
                    </div>

                    <ul className="mt-3 space-y-1.5 text-[11px] text-slate-600">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                        <span>Cadre deficit heatmap matrix</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                        <span>Ingest statistical manuals (RAG)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                        <span>Human-in-the-loop MCQ moderation</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors cursor-pointer"
                  >
                    <span>Login as Training Admin</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Gov.in Credentials Form */}
          {activeTab === "credentials" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin(selectedRole);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Select System Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole("OFFICER");
                      setEmailOrId("anjali.sharma@mospi.gov.in");
                    }}
                    className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      selectedRole === "OFFICER"
                        ? "border-teal-500 bg-teal-50 text-teal-800 shadow-2xs"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <User className="h-3.5 w-3.5 text-teal-600" />
                    <span>Cadre Officer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole("TRAINING_ADMIN");
                      setEmailOrId("r.sen@mospi.gov.in");
                    }}
                    className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      selectedRole === "TRAINING_ADMIN"
                        ? "border-indigo-500 bg-indigo-50 text-indigo-800 shadow-2xs"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Training Admin</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Official Email Address or Employee ID
                </label>
                <input
                  type="text"
                  value={emailOrId}
                  onChange={(e) => setEmailOrId(e.target.value)}
                  placeholder="name@mospi.gov.in"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-700">
                    Security Password
                  </label>
                  <span className="text-[11px] text-teal-700 hover:underline cursor-pointer font-medium">
                    Forgot password?
                  </span>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 focus:outline-none transition-colors"
                  required
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span>Remember my terminal on this device</span>
                </label>
                <span className="text-[11px] text-slate-500 font-medium">256-bit SSL</span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In with Gov.in Credentials</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 3: iGOT Karmayogi Single Sign-On (SSO) */}
          {activeTab === "sso" && (
            <div className="space-y-4">
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 text-xs space-y-2.5">
                <div className="flex items-center gap-2.5 text-teal-800 font-semibold">
                  <KeyRound className="h-4 w-4 text-teal-600" />
                  <span>Integrated Parichay & iGOT Karmayogi SSO</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Sign in through the Central Civil Services Authentication Gateway. Your FRAC competency profile, course enrollments, and reassessment history are synchronized automatically.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Parichay / iGOT Karmayogi Username or Registered Mobile
                  </label>
                  <input
                    type="text"
                    defaultValue="anjali.sharma@gov.in"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 focus:outline-none transition-colors"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleLogin("OFFICER")}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-teal-600 to-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:from-teal-700 hover:to-indigo-700 transition-all cursor-pointer"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  <span>Authenticate via Parichay SSO</span>
                </button>
              </div>
            </div>
          )}

          {/* Quick Bypass to Dashboard */}
          <div className="mt-7 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-slate-600 hover:text-teal-700 font-medium transition-colors"
            >
              <span>Continue to Main Platform without logging in</span>
              <ArrowRight className="h-3 w-3" />
            </Link>

            <span className="text-[11px] text-slate-400 font-mono">v2.4-SIH-STABLE</span>
          </div>

          {/* Live Status Toast */}
          {statusMessage && (
            <div className="mt-4 p-2.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs text-center font-medium animate-fade-in">
              {statusMessage}
            </div>
          )}
        </div>
      </main>

      {/* Government Footer */}
      <footer className="border-t border-slate-200/90 bg-white/85 py-3.5 text-center text-xs text-slate-500">
        <p>
          Ministry of Statistics and Programme Implementation <span>·</span> National Statistical Systems Training Academy (NSSTA)
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Designed for Mission Karmayogi & Official Statistical System Capacity Building. NIC Digital India Certified.
        </p>
      </footer>
    </div>
  );
}
