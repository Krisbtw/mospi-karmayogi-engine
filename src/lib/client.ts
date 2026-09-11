'use client';
import { useCallback, useEffect, useState } from 'react';
import type { Employee } from './types';

async function errMsg(res: Response): Promise<string> {
  try { const j = await res.json(); return j.error ?? res.statusText; } catch { return res.statusText; }
}
export async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(await errMsg(res));
  return res.json() as Promise<T>;
}
export async function postJSON<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await errMsg(res));
  return res.json() as Promise<T>;
}

const KEY = 'mospi.employee';
export function setEmployeeId(id: string) {
  localStorage.setItem(KEY, id);
  window.dispatchEvent(new Event('mospi:employee'));
}
export function useEmployeeId(): string {
  const [id, setId] = useState('E001');
  useEffect(() => {
    setId(localStorage.getItem(KEY) ?? 'E001');
    const h = () => setId(localStorage.getItem(KEY) ?? 'E001');
    window.addEventListener('mospi:employee', h);
    return () => window.removeEventListener('mospi:employee', h);
  }, []);
  return id;
}

export function useAsync<T>(loader: () => Promise<T>, deps: unknown[]) {
  const [state, setState] = useState<{ data?: T; error?: string; loading: boolean }>({ loading: true });
  const [nonce, setNonce] = useState(0);
  useEffect(() => {
    let alive = true;
    setState(s => ({ ...s, loading: true, error: undefined }));
    loader()
      .then(d => { if (alive) setState({ data: d, loading: false }); })
      .catch(e => { if (alive) setState({ error: e instanceof Error ? e.message : String(e), loading: false }); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);
  const reload = useCallback(() => setNonce(n => n + 1), []);
  return { ...state, reload };
}

export function useEmployee() {
  const id = useEmployeeId();
  const { data, loading, error, reload } = useAsync(
    () => getJSON<{ employee: Employee }>(`/api/profile?id=${encodeURIComponent(id)}`),
    [id],
  );
  return { id, employee: data?.employee, loading, error, reload };
}
