"use client";

import React, { useState } from "react";
import { FileUp, BookOpen, CheckCircle2, Clock, Sparkles, ArrowRight, FileText, Layers, Download } from "lucide-react";
import { DocumentItem } from "@/lib/data-service";
import { DocumentDropzone } from "@/components/documents/document-dropzone";
import { Button } from "@/components/ui/button";

interface AdminDocumentsViewProps {
  documents: DocumentItem[];
  onDocumentAdded: (doc: DocumentItem) => void;
  onSelectForQuizGeneration: (doc: DocumentItem) => void;
}

export function AdminDocumentsView({
  documents,
  onDocumentAdded,
  onSelectForQuizGeneration,
}: AdminDocumentsViewProps) {
  const [showUpload, setShowUpload] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-primary font-semibold">
              Source Knowledge Base
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-fg mt-0.5">
            Statistical Manuals & Training Material
          </h2>
          <p className="text-xs text-fg-muted mt-1">
            Official guidelines, survey protocols, and national accounting standards uploaded for RAG retrieval and question generation.
          </p>
        </div>

        <Button
          onClick={() => setShowUpload(!showUpload)}
          className="gap-2 self-start sm:self-auto"
        >
          <FileUp className="h-4 w-4" />
          <span>{showUpload ? "Hide Ingestion Panel" : "Upload New Manual"}</span>
        </Button>
      </div>

      {/* Ingestion Dropzone Area (Expandable) */}
      {showUpload && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-fg">Ingest MoSPI Guidelines Document</h3>
            <p className="text-xs text-fg-muted">
              Supported formats: PDF, DOCX, TXT. Documents are chunked and mapped into semantic RAG vectors.
            </p>
          </div>
          <DocumentDropzone
            onDocumentAdded={(doc) => {
              onDocumentAdded(doc);
              setShowUpload(false);
            }}
          />
        </div>
      )}

      {/* Repository Stats Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-fg-muted">Indexed Manuals</p>
            <p className="text-2xl font-bold text-fg">{documents.length}</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-fg-muted">RAG Knowledge Chunks</p>
            <p className="text-2xl font-bold text-emerald-700">
              {documents.reduce((sum, d) => sum + d.chunkCount, 0)} Chunks
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-700">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-fg-muted">Vector Index Status</p>
            <p className="text-2xl font-bold text-sky-700">Operational</p>
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-border bg-slate-50/80 dark:bg-slate-900/50 text-[11px] font-mono uppercase tracking-wider text-fg-muted">
                <th className="py-3 px-4 font-semibold text-fg">Manual Title</th>
                <th className="py-3 px-4 font-semibold">Division / Wing</th>
                <th className="py-3 px-4 font-semibold">Pages / Chunks</th>
                <th className="py-3 px-4 font-semibold">Processing Status</th>
                <th className="py-3 px-4 font-semibold">Added On</th>
                <th className="py-3 px-4 text-right font-semibold">AI Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary mt-0.5">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-fg">{doc.title}</p>
                        <p className="text-[11px] text-fg-muted font-mono">{doc.id}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-fg">
                      {doc.sourceType === "PLFS_HANDBOOK"
                        ? "FOD (Surveys)"
                        : doc.sourceType === "NATIONAL_ACCOUNTS_MANUAL"
                        ? "NAD (Accounts)"
                        : doc.sourceType === "CPI_METHODOLOGY"
                        ? "ESD (Prices)"
                        : doc.sourceType === "ASI_METHODOLOGY"
                        ? "DQAD / Industrial"
                        : "MoSPI General"}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="text-fg">
                      <span>{doc.pageCount} pages</span>
                      <span className="text-fg-muted"> · {doc.chunkCount} chunks</span>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 px-2 py-0.5 text-[11px] font-semibold">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Ready for RAG</span>
                    </span>
                  </td>

                  <td className="py-3 px-4 text-fg-muted">
                    {doc.uploadedAt}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <Button
                      size="sm"
                      onClick={() => onSelectForQuizGeneration(doc)}
                      className="gap-1.5 text-xs h-7"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>Generate AI Quiz</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
