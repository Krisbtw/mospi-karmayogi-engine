"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface SlidingTabOption<T extends string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

interface SlidingTabsProps<T extends string> {
  options: SlidingTabOption<T>[];
  activeId: T;
  onChange: (id: T) => void;
  className?: string;
  layoutId?: string;
}

export function SlidingTabs<T extends string>({
  options,
  activeId,
  onChange,
  className,
  layoutId = "active-pill",
}: SlidingTabsProps<T>) {
  return (
    <div
      role="tablist"
      className={cn(
        "relative inline-flex items-center gap-1 rounded-full border border-border bg-slate-100/80 p-1 backdrop-blur-md dark:bg-slate-900/80",
        className
      )}
    >
      {options.map((tab) => {
        const isActive = activeId === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative z-10 flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium transition-colors duration-300 ease-out outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
              isActive ? "text-primary font-semibold" : "text-fg-muted hover:text-fg"
            )}
          >
            {tab.icon && <span className="h-3.5 w-3.5 shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  "ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-mono",
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                )}
              >
                {tab.badge}
              </span>
            )}
            {isActive && (
              <motion.div
                layoutId={layoutId}
                transition={{ type: "spring", stiffness: 220, damping: 28, mass: 0.8 }}
                className="absolute inset-0 -z-10 rounded-full bg-white shadow-sm ring-1 ring-black/5 dark:bg-slate-800"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
