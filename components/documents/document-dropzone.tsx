"use client";

import { useState, useRef, DragEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Layers,
  Sparkles,
  ArrowRight,
  Database,
  Cpu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DocumentItem } from "@/lib/data-service";

interface DocumentDropzoneProps {
  onDocumentAdded: (doc: DocumentItem) => void;
  className?: string;
  onSuccess?: () => void;
}

const PRESET_MANUALS = [
  {
    title: "Periodic Labour Force Survey (PLFS) Guidelines 2024",
    type: "PLFS_HANDBOOK" as const,
    pages: 148,
    desc: "Sampling methodology, rotation schemes & labor market FRAC mapping",
    tag: "NSSO FOD",
  },
  {
    title: "Consumer Price Index (CPI) Manual & Basket Weights",
    type: "CPI_METHODOLOGY" as const,
    pages: 92,
    desc: "Laspeyres aggregation formulas & urban/rural market collection",
    tag: "Price Statistics",
  },
  {
    title: "System of National Accounts (SNA 2008) Guidelines",
    type: "NATIONAL_ACCOUNTS_MANUAL" as const,
    pages: 220,
    desc: "Gross Value Added (GVA) calculation & supply-use tables",
    tag: "NAD MoSPI",
  },
  {
    title: "Annual Survey of Industries (ASI) Frame Design",
    type: "ASI_METHODOLOGY" as const,
    pages: 110,
    desc: "Industrial classification, factory act frames & capital asset audit",
    tag: "ESD Kolkata",
  },
];

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

  const STAGES = [
    { label: "Validating MoSPI survey schema & PDF format...", pct: 25, icon: FileText },
    { label: "Semantic paragraph chunking & table extraction...", pct: 60, icon: Layers },
    { label: "Generating embeddings & FRAC competency vector map...", pct: 90, icon: Cpu },
    { label: "Ingestion complete · Vector index ready for AI Quiz", pct: 100, icon: CheckCircle2 },
  ];

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

    // Stage 1
    setStage(0);
    setProgress(25);
    await new Promise((r) => setTimeout(r, 600));

    // Stage 2
    setStage(1);
    setProgress(60);
    await new Promise((r) => setTimeout(r, 700));

    // Stage 3
    setStage(2);
    setProgress(90);
    await new Promise((r) => setTimeout(r, 650));

    // Stage 4
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

  return (
    <div className={cn("rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur-md", className)}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-amber-400" />
            <h3 className="text-base font-semibold text-white">Statistical Manual & Guideline Ingestion</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Enterprise RAG Ingestion · Drag official MoSPI guidelines for AI Diagnostic Assessment Generation
          </p>
        </div>
        <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-0.5 text-[11px] font-mono font-medium text-sky-300">
          PDF · DOCX · TXT up to 50MB
        </span>
      </div>

      {/* Drop Zone Area */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !isIngesting && !completedDoc && fileInputRef.current?.click()}
        className={cn(
          "relative group flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-7 text-center transition-all cursor-pointer overflow-hidden",
          isDragActive
            ? "border-sky-400 bg-sky-950/30 shadow-lg shadow-sky-900/20 scale-[1.005]"
            : "border-slate-800 hover:border-slate-700 bg-slate-950/60 hover:bg-slate-950/80"
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

        {/* Ambient background glow */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-sky-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <AnimatePresence mode="wait">
          {!file && !selectedPreset && !completedDoc && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex flex-col items-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800/80 text-sky-400 group-hover:scale-110 group-hover:text-sky-300 transition-all border border-slate-700">
                <UploadCloud className="h-6 w-6" />
              </div>
              <p className="mt-3 text-sm font-medium text-white">
                Drag and drop your survey handbook here, or <span className="text-sky-400 underline underline-offset-2">browse files</span>
              </p>
              <p className="mt-1 text-xs text-slate-400 max-w-sm">
                Parses survey questions, sampling designs, and coding standards for automated FRAC question synthesis.
              </p>
            </motion.div>
          )}

          {(file || selectedPreset) && !completedDoc && (
            <motion.div
              key="selected"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center max-w-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/40">
                <FileText className="h-6 w-6" />
              </div>
              <p className="mt-2 text-sm font-semibold text-white">
                {file ? file.name : selectedPreset?.title}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {file
                  ? `${(file.size / 1024).toFixed(1)} KB · Local Document`
                  : `${selectedPreset?.pages} pages · ${selectedPreset?.tag}`}
              </p>

              {isIngesting ? (
                <div className="w-full mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="flex items-center gap-1.5 font-mono text-[11px] text-sky-300">
                      <Sparkles className="h-3.5 w-3.5 animate-spin text-sky-400" />
                      {STAGES[stage]?.label}
                    </span>
                    <span className="font-mono text-sky-400 font-bold">{progress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                    <motion.div
                      className="h-full bg-gradient-to-r from-sky-500 to-teal-400"
                      initial={{ width: "0%" }}
                      animate={{ width: `${progress}%` }}
                      transition={{ ease: "easeInOut", duration: 0.3 }}
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      runIngestionPipeline();
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 px-4 py-2 text-xs font-semibold text-white shadow-md transition-all cursor-pointer"
                  >
                    <span>Run RAG Ingestion Pipeline</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      resetAll();
                    }}
                    className="rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 px-3 py-2 text-xs font-medium text-slate-300 transition-colors"
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <p className="mt-2 text-sm font-semibold text-emerald-300">
                Vector Indexing Complete!
              </p>
              <p className="text-xs text-slate-300 mt-0.5 text-center max-w-sm">
                <strong>{completedDoc.title}</strong> has been embedded into {completedDoc.chunkCount} semantic chunks. Available for quiz generation.
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  resetAll();
                }}
                className="mt-3 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3.5 py-1.5 text-xs text-slate-200 transition-colors"
              >
                Upload Another Manual
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Preset MoSPI Handbooks for quick testing */}
      <div className="mt-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 font-mono">
          Or Select Official MoSPI Standard Manual:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PRESET_MANUALS.map((preset) => (
            <button
              key={preset.title}
              type="button"
              disabled={isIngesting}
              onClick={() => handlePresetSelect(preset)}
              className={cn(
                "flex flex-col text-left rounded-lg border p-2.5 transition-all text-xs",
                selectedPreset?.title === preset.title
                  ? "border-sky-500 bg-sky-500/15 text-white ring-1 ring-sky-500"
                  : "border-slate-800 bg-slate-950/40 hover:bg-slate-800/60 text-slate-300"
              )}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-semibold text-white text-xs truncate max-w-[220px]">
                  {preset.title}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {preset.pages}p
                </span>
              </div>
              <span className="mt-1 text-[11px] text-slate-400 line-clamp-1">
                {preset.desc}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
