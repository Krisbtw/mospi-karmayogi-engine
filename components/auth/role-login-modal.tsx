"use client";

import React from "react";
import { User, ShieldCheck, ArrowRight, Check, X, Sparkles, Building2 } from "lucide-react";
import { useRole, UserRole } from "@/lib/role-context";
import { cn } from "@/lib/utils";

interface RoleLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRole?: (role: UserRole) => void;
}

export function RoleLoginModal({ isOpen, onClose, onSelectRole }: RoleLoginModalProps) {
  const { role, setRole, currentOfficer, adminProfile } = useRole();

  if (!isOpen) return null;

  const handleChoose = (selectedRole: UserRole) => {
    setRole(selectedRole);
    if (onSelectRole) onSelectRole(selectedRole);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-navy-950/60 p-4 backdrop-blur-sm transition-all"
      role="dialog"
      aria-modal="true"
      aria-labelledby="role-login-title"
    >
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-2xl transition-all">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 inline-flex h-8 w-8 items-center justify-center rounded-lg text-fg-muted hover:bg-slate-100 hover:text-fg"
          aria-label="Close role switcher"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Hackathon Evaluation · Role-Based Experience</span>
          </div>
          <h2 id="role-login-title" className="mt-3 text-2xl font-bold tracking-tight text-fg">
            Select Platform Persona
          </h2>
          <p className="mt-1.5 text-xs text-fg-muted max-w-md mx-auto">
            Switch between the civil service operational officer experience and the institutional training division administration.
          </p>
        </div>

        {/* Role Options */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Card 1: Cadre Officer */}
          <div
            onClick={() => handleChoose("OFFICER")}
            className={cn(
              "group relative flex flex-col justify-between rounded-xl border p-5 transition-all cursor-pointer",
              role === "OFFICER"
                ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                : "border-border bg-surface hover:border-primary/50 hover:bg-slate-50"
            )}
          >
            {role === "OFFICER" && (
              <span className="absolute top-3.5 right-3.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px]">
                <Check className="h-3 w-3 stroke-[3]" />
              </span>
            )}
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-fg">Cadre Officer</h3>
                  <p className="text-[11px] font-medium text-primary">Learn · Practise · Improve</p>
                </div>
              </div>

              <div className="mt-4 rounded-lg bg-slate-50/80 p-2.5 border border-slate-200/70 text-xs">
                <p className="font-semibold text-fg">{currentOfficer.name}</p>
                <p className="text-[11px] text-fg-muted">{currentOfficer.designation}</p>
                <p className="text-[11px] text-fg-muted">{currentOfficer.division}</p>
              </div>

              <ul className="mt-4 space-y-1.5 text-xs text-fg-muted">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>Diagnose FRAC competency gaps</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>Enrol in aligned iGOT courses</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>Take source-grounded practice MCQs</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary/90 transition-all"
            >
              <span>Continue as Officer</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Card 2: Training Division Admin */}
          <div
            onClick={() => handleChoose("TRAINING_ADMIN")}
            className={cn(
              "group relative flex flex-col justify-between rounded-xl border p-5 transition-all cursor-pointer",
              role === "TRAINING_ADMIN"
                ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                : "border-border bg-surface hover:border-primary/50 hover:bg-slate-50"
            )}
          >
            {role === "TRAINING_ADMIN" && (
              <span className="absolute top-3.5 right-3.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px]">
                <Check className="h-3 w-3 stroke-[3]" />
              </span>
            )}
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-fg">Training Admin</h3>
                  <p className="text-[11px] font-medium text-amber-700">Assess · Validate · Monitor</p>
                </div>
              </div>

              <div className="mt-4 rounded-lg bg-slate-50/80 p-2.5 border border-slate-200/70 text-xs">
                <p className="font-semibold text-fg">{adminProfile.name}</p>
                <p className="text-[11px] text-fg-muted">{adminProfile.designation}</p>
                <p className="text-[11px] text-fg-muted">NSSTA, MoSPI Headquarters</p>
              </div>

              <ul className="mt-4 space-y-1.5 text-xs text-fg-muted">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                  <span>Monitor cadre readiness matrix</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                  <span>Ingest official MoSPI manuals</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                  <span>Human-in-the-loop MCQ review</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition-all dark:bg-white dark:text-slate-900"
            >
              <span>Continue as Training Admin</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-5 text-center text-[11px] text-fg-muted">
          You can toggle roles anytime using the top navigation pill.
        </p>
      </div>
    </div>
  );
}
