'use client';

export function ConfirmDialog({ title, message, confirmLabel, tone, busy, onConfirm, onCancel }: { title: string; message: string; confirmLabel: string; tone?: 'danger'; busy?: boolean; onConfirm: () => void; onCancel: () => void }) {
  return <div className="confirm-overlay" onClick={busy ? undefined : onCancel}><div className="confirm-dialog card" onClick={e => e.stopPropagation()} role="alertdialog" aria-modal="true" aria-label={title}><h3>{title}</h3><p>{message}</p><div className="confirm-actions"><button className="button light" onClick={onCancel} disabled={busy}>Cancel</button><button className={`button dark ${tone === 'danger' ? 'confirm-danger' : ''}`} onClick={onConfirm} disabled={busy} aria-busy={busy}>{busy ? <span className="spinner" aria-hidden="true" /> : null}{busy ? 'Deleting…' : confirmLabel}</button></div></div></div>;
}
