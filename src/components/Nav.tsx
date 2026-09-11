'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { getJSON, setEmployeeId, useAsync, useEmployeeId } from '@/lib/client';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/assess', label: 'Assess' },
  { href: '/gaps', label: 'Gap Analysis' },
  { href: '/path', label: 'Learning Path' },
  { href: '/quiz', label: 'Quiz Studio' },
  { href: '/history', label: 'History' },
  { href: '/admin', label: 'Admin' },
  { href: '/profile', label: 'Profile' },
];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const employeeId = useEmployeeId();
  const { data: employees } = useAsync(() => getJSON<{ employees: { id: string; name: string }[] }>('/api/profile'), []);
  const { data: igot } = useAsync(() => getJSON<{ mode: 'live' | 'demo' }>('/api/igot/status'), []);
  const [q, setQ] = useState('');

  function onSearch(e: FormEvent) {
    e.preventDefault();
    if (q.trim().length >= 2) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <header className="site-header">
      <div className="inner">
        <div className="brand">MoSPI × iGOT Karmayogi<small>Competency Intelligence</small></div>
        <nav className="nav-links" aria-label="Primary">
          {LINKS.map(l => (
            <Link key={l.href} href={l.href} className={pathname === l.href ? 'active' : ''}>{l.label}</Link>
          ))}
        </nav>
        <div className="header-tools">
          <select value={employeeId} onChange={e => setEmployeeId(e.target.value)} aria-label="Select employee">
            {(employees?.employees ?? []).map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
          </select>
          <form onSubmit={onSearch} role="search">
            <input className="search-input" placeholder="Search…" value={q} onChange={e => setQ(e.target.value)} />
          </form>
          {igot && <Badge kind={igot.mode === 'live' ? 'live' : 'demo'}>iGOT {igot.mode}</Badge>}
        </div>
      </div>
    </header>
  );
}

function Badge({ kind, children }: { kind: string; children: React.ReactNode }) {
  return <span className={`badge badge-${kind}`}>{children}</span>;
}
