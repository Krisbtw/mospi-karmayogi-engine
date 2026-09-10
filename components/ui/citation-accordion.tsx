"use client";

import React, { useState } from "react";
import { ChevronDown, BookOpen, Quote, ShieldCheck, FileText, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CitationItem {
  id: string;
  sourceDocument: string;
  sourceCitation: string;
  sourceSnippet: string;
  handbookSection?: string;
  pageNumber?: number | string;
  fracMapping?: string;
}

interface CitationAccordionProps {
  citations: CitationItem[];
  title?: string;
  className?: string;
  defaultExpanded?: boolean;
}

export function CitationAccordion({
  citations,
  title = "MoSPI Ground-Truth Evidence & Citations",
  className,
  defaultExpanded = false,
}: CitationAccordionProps) {
  const [openIds, setOpenIds] = useState<Record<string, boolean>>(() => {
    if (defaultExpanded && citations.length > 0) {
      return { [citations[0].id]: true };
    }
    return {};
  });

  const toggle = (id: string) => {
    setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!citations || citations.length === 0) return null;

  return (
    <div className={cn("rounded-xl border border-border bg-surface shadow-sm overflow-hidden", className)}>
      <div className="flex items-center justify-between border-b border-border bg-slate-50/60 px-4 py-2.5 dark:bg-slate-900/40">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <h4 className="text-xs font-semibold tracking-tight text-fg">{title}</h4>
        </div>
        <span className="font-mono text-[10px] text-fg-muted uppercase tracking-wider">
          {citations.length} Verified Sources
        </span>
      </div>

      <div className="divide-y divide-border">
        {citations.map((item) => {
          const isOpen = !!openIds[item.id];
          return (
            <div key={item.id} className="transition-colors hover:bg-slate-50/40 dark:hover:bg-slate-900/20">
              <button
                type="button"
                onClick={() => toggle(item.id)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left outline-none focus-visible:bg-slate-50 dark:focus-visible:bg-slate-900/40"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
                    <BookOpen className="h-3 w-3" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-fg truncate">{item.sourceDocument}</p>
                    <p className="text-[11px] text-fg-muted truncate">{item.sourceCitation}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.pageNumber && (
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      p. {item.pageNumber}
                    </span>
                  )}
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-fg-muted transition-transform duration-200",
                      isOpen && "rotate-180 text-primary"
                    )}
                  />
                </div>
              </button>

              {isOpen && (
                <div className="px-4 pb-3 pt-1">
                  <div className="rounded-lg border border-amber-200/80 bg-amber-50/60 p-3 text-xs leading-relaxed text-slate-700 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-200/90">
                    <div className="flex items-start gap-2">
                      <Quote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                      <div>
                        <p className="italic font-serif text-[12px]">{item.sourceSnippet}</p>
                        {item.handbookSection && (
                          <p className="mt-2 text-[11px] font-mono text-amber-700 dark:text-amber-400">
                            Section: {item.handbookSection}
                          </p>
                        )}
                        {item.fracMapping && (
                          <div className="mt-2 flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                            <span className="font-semibold text-fg">FRAC Competency Anchor:</span> {item.fracMapping}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
