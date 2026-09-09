"use client";

import { X, Check } from "lucide-react";
import { DocumentItem } from "@/lib/data-service";
import { cn } from "@/lib/utils";
import { DocumentDropzone } from "./document-dropzone";

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDocumentAdded: (doc: DocumentItem) => void;
  existingDocuments: DocumentItem[];
}

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900";

export function DocumentUploadModal({
  isOpen,
  onClose,
  onDocumentAdded,
  existingDocuments,
}: DocumentUploadModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-slate-800 bg-slate-900 text-slate-100 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 px-6 py-5">
          <div className="flex flex-col gap-1">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500">
              Knowledge store
            </p>
            <h2 id="upload-modal-title" className="text-lg font-semibold tracking-tight text-white">
              Add learning material
            </h2>
            <p className="text-xs text-slate-400">Extract, chunk and embed an official handbook.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={cn(
              "rounded-md p-1.5 text-slate-400 transition-colors duration-200 hover:bg-slate-800 hover:text-white active:scale-95",
              focusRing
            )}
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-8 overflow-y-auto p-6">
          <DocumentDropzone
            className="border-0 bg-transparent p-0"
            onDocumentAdded={(doc) => {
              onDocumentAdded(doc);
            }}
            onSuccess={() => {
              setTimeout(() => {
                onClose();
              }, 1200);
            }}
          />

          {/* Indexed documents */}
          <div className="flex flex-col gap-3 border-t border-slate-800 pt-6">
            <div className="flex items-baseline justify-between">
              <h4 className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                Currently indexed handbooks
              </h4>
              <span className="font-mono text-xs text-slate-500">{existingDocuments.length} total</span>
            </div>
            <ul className="flex max-h-40 flex-col divide-y divide-slate-800 overflow-y-auto rounded-md border border-slate-800 pr-0">
              {existingDocuments.map((doc) => (
                <li
                  key={doc.id}
                  className="flex items-center justify-between gap-4 px-3 py-2 text-xs transition-colors duration-200 hover:bg-slate-800/40"
                >
                  <span className="truncate font-medium text-slate-200">{doc.title}</span>
                  <span className="flex shrink-0 items-center gap-3 font-mono text-[11px] text-slate-500">
                    <span>{doc.chunkCount} chunks</span>
                    <span className="flex items-center gap-1 text-emerald-300">
                      <Check className="h-3 w-3" aria-hidden /> ready
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-slate-800 bg-slate-950/60 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "rounded-md border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-medium text-slate-200 transition-[background-color,border-color,transform] duration-200 hover:border-slate-500 hover:bg-slate-800 active:scale-[0.98]",
              focusRing
            )}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
