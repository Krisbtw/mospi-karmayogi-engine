"use client";

import { useState, useRef, DragEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileText, Check, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DocumentItem } from "@/lib/data-service";

interface DocumentDropzoneProps {
  onDocumentAdded: (doc: DocumentItem) => void;
  className?: string;
  onSuccess?: () => void;
}

const PRESET_MANUALS = [
  {
    title: "Periodic Labour Force Survey (PLFS) guidelines 2024",
    type: "PLFS_HANDBOOK" as const,
    pages: 148,
    desc: "Sampling methodology, rotation schemes and labour market FRAC mapping",
    tag: "NSSO FOD",
  },
  {
    title: "Consumer Price Index (CPI) manual and basket weights",
    type: "CPI_METHODOLOGY" as const,
    pages: 92,
    desc: "Laspeyres aggregation formulas and urban/rural market collection",
    tag: "Price Statistics",
  },
  {
    title: "System of National Accounts (SNA 2008) guidelines",
    type: "NATIONAL_ACCOUNTS_MANUAL" as const,
    pages: 220,
    desc: "Gross Value Added (GVA) calculation and supply-use tables",
    tag: "NAD MoSPI",
  },
  {
    title: "Annual Survey of Industries (ASI) frame design",
    type: "ASI_METHODOLOGY" as const,
    pages: 110,
    desc: "Industrial classification, Factories Act frames and capital asset audit",
    tag: "ESD Kolkata",
  },
];

const STAGES = [
  { label: "Validating MoSPI survey schema and PDF format", pct: 25 },
  { label: "Semantic paragraph chunking and table extraction", pct: 60 },
  { label: "Generating embeddings and FRAC competency vector map", pct: 90 },
  { label: "Ingestion complete — vector index ready for quiz generation", pct: 100 },
];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950";

export function DocumentDropzone({
  onDocumentAdded,
  className,
  onSuccess,
}: DocumentDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isIngesting, setIsIngesting] = useState(false);
  const [stage, setStage] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [completedDoc, setCompletedDoc] = useState<DocumentItem | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<typeof PRESET_MANUALS[0] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      const selected = droppedFiles[0];
      setFile(selected);
      setSelectedPreset(null);
      setCompletedDoc(null);
    }
  };

  const handlePresetSelect = (preset: typeof PRESET_MANUALS[0]) => {
    setSelectedPreset(preset);
    setFile(null);
    setCompletedDoc(null);
  };

  const detectSourceType = (filename: string): DocumentItem["sourceType"] => {
    const lower = filename.toLowerCase();
    if (lower.includes("plfs") || lower.includes("labour")) return "PLFS_HANDBOOK";
    if (lower.includes("cpi") || lower.includes("price")) return "CPI_METHODOLOGY";
    if (lower.includes("asi") || lower.includes("industry")) return "ASI_METHODOLOGY";
    if (lower.includes("sna") || lower.includes("national") || lower.includes("gdp")) return "NATIONAL_ACCOUNTS_MANUAL";
    return "PLFS_HANDBOOK";
  };

  const runIngestionPipeline = async () => {
    if (!file && !selectedPreset) return;

    setIsIngesting(true);
    setCompletedDoc(null);

    setStage(0);
    setProgress(25);
    await new Promise((r) => setTimeout(r, 600));

    setStage(1);
    setProgress(60);
    await new Promise((r) => setTimeout(r, 700));

    setStage(2);
    setProgress(90);
    await new Promise((r) => setTimeout(r, 650));

    setStage(3);
    setProgress(100);
    await new Promise((r) => setTimeout(r, 450));

    const title = selectedPreset ? selectedPreset.title : file!.name.replace(/\.[^/.]+$/, "");
    const sourceType = selectedPreset ? selectedPreset.type : detectSourceType(file!.name);
    const pages = selectedPreset ? selectedPreset.pages : Math.max(16, Math.round(file!.size / 1024 / 22));

    const newDoc: DocumentItem = {
      id: `doc_${Date.now()}`,
      title,
      sourceType,
      pageCount: pages,
      fileSizeKb: selectedPreset ? pages * 24 : Math.round(file!.size / 1024),
      chunkCount: Math.round(pages * 1.3),
      uploadedAt: "Just now",
      status: "READY",
      summary: `Indexed official MoSPI document with semantic paragraph chunking for FRAC assessment generation.`,
    };

    onDocumentAdded(newDoc);
    setCompletedDoc(newDoc);
    setIsIngesting(false);
    onSuccess?.();
  };

  const resetAll = () => {
    setFile(null);
    setSelectedPreset(null);
    setCompletedDoc(null);
    setStage(0);
    setProgress(0);
  };

  const canOpenPicker = !isIngesting && !completedDoc;

  return (
    <div className={cn("rounded-lg border border-slate-800 bg-slate-900/50 p-8", className)}>
      {/* Asymmetric: intro copy on the left (5/12), interactive zone on the right (7/12) */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="flex flex-col justify-between gap-8 lg:col-span-5">
          <div className="flex flex-col gap-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500">
              Retrieval index
            </p>
            <h3 className="text-2xl font-semibold tracking-tight text-white text-balance">
              Ingest a statistical manual or guideline
            </h3>
            <p className="max-w-md text-sm leading-relaxed text-slate-400 text-pretty">
              Official MoSPI handbooks are chunked, embedded and mapped to FRAC competencies so the
              diagnostic quiz can cite the exact section it is testing.
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs">
            <div className="flex flex-col gap-0.5">
              <dt className="text-slate-500">Accepted formats</dt>
              <dd className="font-mono text-slate-300">PDF · DOCX · TXT</dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-slate-500">Size limit</dt>
              <dd className="font-mono text-slate-300">50 MB per file</dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-7">
          {/* Drop zone */}
          <div
            role="button"
            tabIndex={canOpenPicker ? 0 : -1}
            aria-label="Upload a survey handbook"
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => canOpenPicker && fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (canOpenPicker && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            className={cn(
              "group relative flex min-h-[220px] flex-col items-center justify-center overflow-hidden rounded-md border border-dashed p-8 text-center transition-[border-color,background-color,transform] duration-200",
              canOpenPicker && "cursor-pointer active:scale-[0.995]",
              focusRing,
              isDragActive
                ? "border-amber-400 bg-amber-500/5"
                : "border-slate-700 bg-slate-950/50 hover:border-slate-500 hover:bg-slate-950/80"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setFile(f);
                  setSelectedPreset(null);
                  setCompletedDoc(null);
                }
              }}
            />

            <AnimatePresence mode="wait">
              {!file && !selectedPreset && !completedDoc && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center"
                >
                  <UploadCloud
                    className="h-7 w-7 text-slate-500 transition-[color,transform] duration-200 group-hover:-translate-y-0.5 group-hover:text-amber-400"
                    aria-hidden
                  />
                  <p className="mt-4 text-sm font-medium text-white">
                    Drop a survey handbook here, or{" "}
                    <span className="text-amber-400 underline decoration-amber-400/40 underline-offset-4 transition-colors duration-200 group-hover:decoration-amber-400">
                      browse files
                    </span>
                  </p>
                  <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-slate-400 text-pretty">
                    Survey questions, sampling designs and coding standards are parsed for question synthesis.
                  </p>
                </motion.div>
              )}

              {(file || selectedPreset) && !completedDoc && (
                <motion.div
                  key="selected"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                  className="flex w-full max-w-md flex-col items-center"
                >
                  <FileText className="h-7 w-7 text-amber-400" aria-hidden />
                  <p className="mt-3 text-sm font-semibold text-white text-balance">
                    {file ? file.name : selectedPreset?.title}
                  </p>
                  <p className="mt-1 font-mono text-xs text-slate-400">
                    {file
                      ? `${(file.size / 1024).toFixed(1)} KB · local document`
                      : `${selectedPreset?.pages} pages · ${selectedPreset?.tag}`}
                  </p>

                  {isIngesting ? (
                    <div className="mt-6 flex w-full flex-col gap-2">
                      <div className="flex items-center justify-between gap-4 text-xs">
                        <span className="flex items-center gap-1.5 text-left text-slate-300">
                          <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-amber-400" aria-hidden />
                          {STAGES[stage]?.label}
                        </span>
                        <span className="font-mono font-semibold text-amber-300">{progress}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                        <motion.div
                          className="h-full bg-amber-400"
                          initial={{ width: "0%" }}
                          animate={{ width: `${progress}%` }}
                          transition={{ ease: "easeInOut", duration: 0.3 }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          runIngestionPipeline();
                        }}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-md bg-amber-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-sm transition-[background-color,transform,box-shadow] duration-200 hover:-translate-y-px hover:bg-amber-400 hover:shadow-md active:translate-y-0 active:scale-[0.98] active:bg-amber-600",
                          focusRing
                        )}
                      >
                        <span>Run ingestion</span>
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          resetAll();
                        }}
                        className={cn(
                          "rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 transition-[background-color,border-color,color,transform] duration-200 hover:border-slate-500 hover:bg-slate-800 hover:text-white active:scale-[0.98]",
                          focusRing
                        )}
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {completedDoc && (
                <motion.div
                  key="completed"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                    <Check className="h-5 w-5" aria-hidden />
                  </span>
                  <p className="mt-3 text-sm font-semibold text-white">Vector index ready</p>
                  <p className="mt-1 max-w-sm text-center text-xs leading-relaxed text-slate-400 text-pretty">
                    <strong className="font-medium text-slate-200">{completedDoc.title}</strong> was split into{" "}
                    {completedDoc.chunkCount} semantic chunks and is available for quiz generation.
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      resetAll();
                    }}
                    className={cn(
                      "mt-4 rounded-md border border-slate-700 bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-slate-200 transition-[background-color,border-color,transform] duration-200 hover:border-slate-500 hover:bg-slate-800 active:scale-[0.98]",
                      focusRing
                    )}
                  >
                    Upload another manual
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Preset manuals */}
          <div className="flex flex-col gap-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500">
              Or pick an official MoSPI manual
            </p>
            <div className="flex flex-col divide-y divide-slate-800 overflow-hidden rounded-md border border-slate-800">
              {PRESET_MANUALS.map((preset) => {
                const isSelected = selectedPreset?.title === preset.title;
                return (
                  <button
                    key={preset.title}
                    type="button"
                    disabled={isIngesting}
                    aria-pressed={isSelected}
                    onClick={() => handlePresetSelect(preset)}
                    className={cn(
                      "group/preset grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-4 px-4 py-3 text-left text-xs transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-400",
                      isSelected
                        ? "bg-amber-500/10"
                        : "bg-slate-950/30 hover:bg-slate-800/60 active:bg-slate-800"
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "h-1.5 w-1.5 rounded-full transition-colors duration-200",
                        isSelected ? "bg-amber-400" : "bg-slate-700 group-hover/preset:bg-slate-500"
                      )}
                    />
                    <span className="min-w-0">
                      <span
                        className={cn(
                          "block truncate font-medium transition-colors duration-200",
                          isSelected ? "text-amber-100" : "text-slate-200 group-hover/preset:text-white"
                        )}
                      >
                        {preset.title}
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] text-slate-500">{preset.desc}</span>
                    </span>
                    <span className="font-mono text-[11px] tabular-nums text-slate-500">{preset.pages} pp</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
