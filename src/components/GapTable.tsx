import { Badge } from './ui';
import type { GapRow } from '@/lib/types';

export function priorityBadge(p: GapRow['priority']): string {
  return p === 'Critical' ? 'critical' : p === 'High' ? 'high' : p === 'Medium' ? 'medium' : p === 'Low' ? 'low' : 'complete';
}

export function GapTable({ rows }: { rows: GapRow[] }) {
  return (
    <table className="table">
      <thead><tr><th>Competency</th><th>Required</th><th>Current</th><th>Gap</th><th>Priority</th></tr></thead>
      <tbody>
        {rows.map(r => (
          <tr key={r.competencyId}>
            <td>
              <div className="cell-strong">{r.name}</div>
              <div className="cell-sub">{r.domain}</div>
              <div className="bars">
                <div className="bar"><div className="bar-fill fill-required" style={{ width: `${r.required}%` }} /></div>
                <div className="bar"><div className="bar-fill fill-current" style={{ width: `${r.current}%` }} /></div>
              </div>
              <div className="bar-legend">grey = required · blue = current</div>
            </td>
            <td>{r.required}%</td>
            <td>{r.current}%</td>
            <td className="cell-strong">{r.gap > 0 ? `${r.gap} pp` : '—'}</td>
            <td><Badge kind={priorityBadge(r.priority)}>{r.priority}</Badge></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
