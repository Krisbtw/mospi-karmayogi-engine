import { NextRequest, NextResponse } from 'next/server';
import { aiEnabled } from '@/lib/ai';
import { chunkSections } from '@/lib/chunk';
import { embedMany } from '@/lib/embed';
import { detectKind, extractSections } from '@/lib/extract';
import { getDB, uid, updateDB } from '@/lib/store';
import type { Chunk, DocRecord } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const db = await getDB();
  return NextResponse.json({
    documents: db.documents.map(d => ({ id: d.id, title: d.title, kind: d.kind, chunkCount: d.chunkCount, sections: d.sections.length, uploadedAt: d.uploadedAt })),
  });
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    if (file.size > 20 * 1024 * 1024) return NextResponse.json({ error: 'File exceeds the 20 MB limit.' }, { status: 415 });
    const kind = detectKind(file.name);
    if (!kind) {
      const ext = file.name.split('.').pop() ?? '?';
      return NextResponse.json({ error: `Unsupported file type “.${ext}”. Supported: PDF, DOCX, PPTX, TXT.` }, { status: 415 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const sections = await extractSections(file.name, kind, buffer);
    const total = sections.reduce((s, x) => s + x.text.length, 0);
    if (total < 200) return NextResponse.json({ error: 'Extracted text is too short to use (the document may be empty, scanned, or image-only).' }, { status: 422 });

    const title = (form.get('title') as string | null)?.trim() || file.name.replace(/\.[^.]+$/, '');
    const doc: DocRecord = { id: uid('DOC'), title, filename: file.name, kind, sections, uploadedAt: new Date().toISOString(), chunkCount: 0 };
    const raw = chunkSections(sections, doc.id, title);
    if (!raw.length) return NextResponse.json({ error: 'No processable text chunks could be built from this document.' }, { status: 422 });
    const embs = await embedMany(raw.map(c => c.text));
    const chunks: Chunk[] = raw.map((c, i) => ({ ...c, embedding: embs[i] }));
    doc.chunkCount = chunks.length;

    await updateDB(data => { data.documents.push(doc); data.chunks.push(...chunks); });
    return NextResponse.json({ document: { id: doc.id, title, kind, sections: sections.length, chunkCount: chunks.length }, embeddings: aiEnabled() ? 'ai' : 'lexical-fallback' });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Document processing failed.' }, { status: 400 });
  }
}
