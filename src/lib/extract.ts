export type DocKind = 'pdf' | 'docx' | 'pptx' | 'txt';
export interface TextSection { label: string; text: string; }

const KIND_BY_EXT: Record<string, DocKind> = { pdf: 'pdf', docx: 'docx', pptx: 'pptx', txt: 'txt' };

export function detectKind(filename: string): DocKind | null {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  return KIND_BY_EXT[ext] ?? null;
}

export function parseTxtSections(text: string): TextSection[] {
  const lines = text.split(/\r?\n/);
  const sections: TextSection[] = [];
  let current: TextSection | null = null;
  for (const line of lines) {
    const heading = line.match(/^#{1,6}\s*(.+)$/);
    if (heading) { current = { label: heading[1].trim(), text: '' }; sections.push(current); }
    else if (current) { if (line.trim()) current.text += (current.text ? ' ' : '') + line.trim(); }
    else if (line.trim()) { current = { label: 'Document', text: line.trim() }; sections.push(current); }
  }
  return sections.filter(s => s.text.trim().length > 0);
}

function slideNo(name: string): number { return parseInt(name.match(/slide(\d+)\.xml/)![1], 10); }

/** Real per-format extraction. Never treats DOCX/PPTX as plain UTF-8. */
export async function extractSections(filename: string, kind: DocKind, buffer: Buffer): Promise<TextSection[]> {
  if (kind === 'pdf') {
    const { extractText, getDocumentProxy } = await import('unpdf');
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const result = await extractText(pdf, { mergePages: false });
    const raw = (result as unknown as { text: string[] | string }).text;
    const pages = Array.isArray(raw) ? raw : [raw];
    const sections = pages
      .map((t, i) => ({ label: `Page ${i + 1}`, text: String(t).replace(/\s+/g, ' ').trim() }))
      .filter(s => s.text.length > 0);
    if (!sections.length) throw new Error('No readable text found in the PDF. Scanned/image-only PDFs are not supported.');
    return sections;
  }
  if (kind === 'docx') {
    const mammoth = (await import('mammoth')).default;
    const { value } = await mammoth.extractRawText({ buffer });
    const paras = value.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
    const sections: TextSection[] = [];
    for (let i = 0; i < paras.length; i += 3) {
      sections.push({ label: `Section ${sections.length + 1}`, text: paras.slice(i, i + 3).join(' ') });
    }
    if (!sections.length) throw new Error('No readable text found in the DOCX file.');
    return sections;
  }
  if (kind === 'pptx') {
    const JSZip = (await import('jszip')).default;
    const zip = await JSZip.loadAsync(buffer);
    const names = Object.keys(zip.files).filter(n => /^ppt\/slides\/slide\d+\.xml$/.test(n)).sort((a, b) => slideNo(a) - slideNo(b));
    if (!names.length) throw new Error('No slides found in the PPTX file.');
    const sections: TextSection[] = [];
    for (const name of names) {
      const xml = await zip.files[name].async('string');
      const runs = xml.match(/<a:t>([^<]*)<\/a:t>/g) ?? [];
      const text = runs.map(r => r.slice(5, r.length - 6).trim()).filter(Boolean).join(' ');
      if (text) sections.push({ label: `Slide ${slideNo(name)}`, text });
    }
    if (!sections.length) throw new Error('No readable text found in the PPTX slides.');
    return sections;
  }
  const text = buffer.toString('utf8');
  if (text.includes('\u0000')) throw new Error('The file is not a valid UTF-8 text document.');
  const sections = parseTxtSections(text);
  if (!sections.length) throw new Error('The text file is empty.');
  return sections;
}
