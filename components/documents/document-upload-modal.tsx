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
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

export function DocumentUploadModal({
  isOpen,
  onClose,
  onDocumentAdded,
  existingDocuments,
}: DocumentUploadModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#123158]/25 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
    >
      <div className="relative flex max-h-[calc(100vh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-border bg-surface text-fg shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div className="flex flex-col gap-1">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-muted">
              Knowledge store
            </p>
            <h2 id="upload-modal-title" className="text-lg font-semibold tracking-tight text-fg">
              Add learning material
            </h2>
            <p className="text-xs text-fg-muted">Extract, chunk and embed an official handbook.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={cn(
              "rounded-md p-1.5 text-fg-muted transition-colors duration-200 hover:bg-bg hover:text-fg active:scale-95",
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
          <div className="flex flex-col gap-3 border-t border-border pt-6">
            <div className="flex items-baseline justify-between">
              <h4 className="text-xs font-medium uppercase tracking-[0.12em] text-fg-muted">
                Currently indexed handbooks
              </h4>
              <span className="font-mono text-xs text-fg-muted">{existingDocuments.length} total</span>
            </div>
            <ul className="flex max-h-40 flex-col divide-y divide-border overflow-y-auto rounded-md border border-border pr-0">
              {existingDocuments.map((doc) => (
                <li
                  key={doc.id}
                  className="flex items-center justify-between gap-4 px-3 py-2 text-xs transition-colors duration-200 hover:bg-bg"
                >
                  <span className="truncate font-medium text-fg">{doc.title}</span>
                  <span className="flex shrink-0 items-center gap-3 font-mono text-[11px] text-fg-muted">
                    <span>{doc.chunkCount} chunks</span>
                    <span className="flex items-center gap-1 text-emerald-700">
                      <Check className="h-3 w-3" aria-hidden /> ready
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-border bg-surface px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "rounded-md border border-border bg-surface px-4 py-2 text-xs font-medium text-fg transition-[background-color,border-color,transform] duration-200 hover:border-fg-muted hover:bg-bg active:scale-[0.98]",
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
