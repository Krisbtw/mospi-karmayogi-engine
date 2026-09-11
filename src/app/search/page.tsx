'use client';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getJSON, setEmployeeId, useAsync } from '@/lib/client';
import { Card, EmptyState, Spinner } from '@/components/ui';

interface SearchItem { title: string; subtitle: string; href: string; employeeId?: string; }
interface SearchResp { groups: { name: string; items: SearchItem[] }[]; }

function SearchResults() {
  const params = useSearchParams();
  const q = params.get('q') ?? '';
  const router = useRouter();
  const { data, loading, error } = useAsync(
    () => q ? getJSON<SearchResp>(`/api/search?q=${encodeURIComponent(q)}`) : Promise.resolve({ groups: [] }),
    [q],
  );

  function open(item: SearchItem) {
    if (item.employeeId) setEmployeeId(item.employeeId);
    router.push(item.href);
  }

  if (loading) return <Spinner label="Searching…" />;
  if (error) return <EmptyState title="Search failed">{error}</EmptyState>;
  const groups = data?.groups ?? [];
  if (!groups.length) return <EmptyState title={`No results for “${q}”`}>Try an employee name, competency, course, document or quiz title.</EmptyState>;

  return (
    <Card title={`Search — “${q}”`}>
      {groups.map(g => (
        <div key={g.name} style={{ marginBottom: 14 }}>
          <h3>{g.name}</h3>
          {g.items.map((item, i) => (
            <button key={i} className="btn" style={{ display: 'block', width: '100%', textAlign: 'left', marginBottom: 6 }} onClick={() => open(item)}>
              <span className="cell-strong">{item.title}</span>
              <span className="cell-sub"> — {item.subtitle}</span>
            </button>
          ))}
        </div>
      ))}
    </Card>
  );
}

export default function SearchPage() {
  return <Suspense fallback={<Spinner label="Searching…" />}><SearchResults /></Suspense>;
}
