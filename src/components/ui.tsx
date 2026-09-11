import type { ReactNode } from 'react';

export function Spinner({ label = 'Loading…' }: { label?: string }) {
  return <div className="spinner-row"><span className="spinner" aria-hidden /><span>{label}</span></div>;
}

export function ErrorBanner({ message }: { message: string }) {
  return <div className="alert alert-error" role="alert">{message}</div>;
}

export function Card({ title, subtitle, actions, children }: { title?: string; subtitle?: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <section className="card">
      {(title || actions) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
          {title && <h2>{title}</h2>}
          {actions}
        </div>
      )}
      {subtitle && <p className="card-sub">{subtitle}</p>}
      {children}
    </section>
  );
}

export function Badge({ kind, children }: { kind: string; children: ReactNode }) {
  return <span className={`badge badge-${kind}`}>{children}</span>;
}

export function Metric({ value, label, good }: { value: ReactNode; label: string; good?: boolean }) {
  return (
    <div className={`metric${good ? ' stat-good' : ''}`}>
      <div className="m-value">{value}</div>
      <div className="m-label">{label}</div>
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '36px 20px' }}>
      <h2>{title}</h2>
      <p className="card-sub" style={{ maxWidth: 460, margin: '0 auto 12px' }}>{children}</p>
    </div>
  );
}
