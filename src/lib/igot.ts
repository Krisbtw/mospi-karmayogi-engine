export function igotMode(): 'live' | 'demo' {
  return process.env.IGOT_API_BASE && process.env.IGOT_API_KEY ? 'live' : 'demo';
}

export function igotCourseUrl(title: string): string {
  return `https://igotkarmayogi.gov.in/search?q=${encodeURIComponent(title)}`;
}

/** Best-effort live iGOT seam. Returns false in demo mode or on failure — never fakes a live call. */
export async function igotRemote(path: string, payload: unknown): Promise<boolean> {
  const base = process.env.IGOT_API_BASE;
  const key = process.env.IGOT_API_KEY;
  if (!base || !key) return false;
  try {
    const res = await fetch(`${base}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(4000),
    });
    return res.ok;
  } catch { return false; }
}
