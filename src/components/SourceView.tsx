'use client';
import { useState } from 'react';

export interface SourceInfo {
  sourceDocTitle: string; sourceSection: string; chunkIndex: number; evidence: string; confidence: number;
}

export function SourceView({ q }: { q: SourceInfo }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button type="button" className="btn btn-sm" onClick={() => setOpen(o => !open)}>View Source</button>
      {open && (
        <div className="source-panel">
          <div><strong>Document:</strong> {q.sourceDocTitle}</div>
          <div><strong>Section:</strong> {q.sourceSection} · <strong>Chunk:</strong> #{q.chunkIndex} · <strong>Confidence:</strong> {Math.round(q.confidence * 100)}%</div>
          <blockquote>{q.evidence}</blockquote>
        </div>
      )}
    </div>
  );
}
