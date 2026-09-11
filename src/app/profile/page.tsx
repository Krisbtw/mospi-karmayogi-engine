'use client';
import { useEffect, useState } from 'react';
import { DEPARTMENTS, roleMap } from '@/lib/competency-data';
import { postJSON, useEmployee } from '@/lib/client';
import { Card, ErrorBanner, Spinner } from '@/components/ui';
import type { Employee } from '@/lib/types';

export default function ProfilePage() {
  const { employee, loading, error, reload } = useEmployee();
  const [form, setForm] = useState<Employee | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => { if (employee) setForm(employee); }, [employee]);

  if (loading) return <Spinner label="Loading profile…" />;
  if (error) return <ErrorBanner message={error} />;
  if (!form) return null;

  const designations = DEPARTMENTS.find(d => d.name === form.department)?.designations ?? [];
  const roles = designations.find(d => d.title === form.designation)?.roles ?? [];

  function set<K extends keyof Employee>(k: K, v: Employee[K]) {
    setForm(f => {
      if (!f) return f;
      const next = { ...f, [k]: v };
      if (k === 'department') { next.designation = ''; next.role = ''; }
      if (k === 'designation') next.role = '';
      return next;
    });
  }

  async function save() {
    if (!form) return;
    setBusy(true); setMsg(null); setErr(null);
    try {
      await postJSON('/api/profile', { ...form, yearsExperience: Number(form.yearsExperience) });
      setMsg('Profile saved. Role requirements will apply on the next gap analysis.');
      reload();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally { setBusy(false); }
  }

  return (
    <div>
      <Card title="Employee Profile" subtitle="Department → Designation → Role → Experience drives the required competencies.">
        {msg && <div className="alert alert-ok">{msg}</div>}
        {err && <ErrorBanner message={err} />}
        <div className="form-grid">
          <div><label>Employee ID</label><input type="text" value={form.id} readOnly /></div>
          <div><label>Name</label><input type="text" value={form.name} onChange={e => set('name', e.target.value)} /></div>
          <div>
            <label>Department / Ministry</label>
            <select value={form.department} onChange={e => set('department', e.target.value)}>
              {DEPARTMENTS.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label>Designation</label>
            <select value={form.designation} onChange={e => set('designation', e.target.value)}>
              {designations.map(d => <option key={d.title} value={d.title}>{d.title}</option>)}
            </select>
          </div>
          <div>
            <label>Role</label>
            <select value={form.role} onChange={e => set('role', e.target.value)}>
              {roles.map(r => <option key={r} value={r}>{roleMap.get(r)?.title ?? r}</option>)}
            </select>
          </div>
          <div><label>Years of Experience</label><input type="number" min={0} max={45} value={form.yearsExperience} onChange={e => set('yearsExperience', Number(e.target.value))} /></div>
          <div><label>Location</label><input type="text" value={form.location} onChange={e => set('location', e.target.value)} /></div>
          <div><label>Functional Area</label><input type="text" value={form.functionalArea} onChange={e => set('functionalArea', e.target.value)} /></div>
          <div><label>Cadre Rank</label><input type="text" value={form.cadreRank} onChange={e => set('cadreRank', e.target.value)} /></div>
        </div>
        <div className="cta-row">
          <button className="btn btn-primary" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save Profile'}</button>
        </div>
      </Card>
    </div>
  );
}
