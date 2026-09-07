"use client";

import { X, FileUp, Database, BookOpen, CheckCircle2 } from "lucide-react";
import { DocumentItem } from "@/lib/data-service";
import { DocumentDropzone } from "./document-dropzone";

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDocumentAdded: (doc: DocumentItem) => void;
  existingDocuments: DocumentItem[];
}

export function DocumentUploadModal({
  isOpen,
  onClose,
  onDocumentAdded,
  existingDocuments,
}: DocumentUploadModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/15 bg-slate-900 text-slate-100 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <FileUp className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">MoSPI Learning Material Ingestion</h2>
              <p className="text-xs text-slate-400">RAG Pipeline: Extract, Semantic Chunking & Vector Embeddings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* High-density 21st.dev style Document Dropzone */}
          <DocumentDropzone
            className="border-0 bg-transparent p-0 shadow-none"
            onDocumentAdded={(doc) => {
              onDocumentAdded(doc);
            }}
            onSuccess={() => {
              setTimeout(() => {
                onClose();
              }, 1200);
            }}
          />

          {/* Already Indexed Documents */}
          <div className="border-t border-white/10 pt-4">
            <h4 className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5 text-sky-400" />
              <span>Currently Ingested Handbooks in Knowledge Store ({existingDocuments.length})</span>
            </h4>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {existingDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between rounded-lg border border-white/5 bg-slate-950/60 px-3 py-2 text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <BookOpen className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate text-slate-200 font-medium">{doc.title}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 text-slate-400">
                    <span className="rounded bg-sky-500/15 px-1.5 py-0.5 text-[10px] text-sky-300">
                      {doc.chunkCount} chunks
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400 text-[11px]">
                      <CheckCircle2 className="h-3 w-3" /> Ready
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-white/10 bg-slate-950/60 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
