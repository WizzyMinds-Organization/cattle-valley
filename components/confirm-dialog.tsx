'use client';

export function ConfirmDialog({ title, message, confirmLabel, tone, onConfirm, onCancel }: { title: string; message: string; confirmLabel: string; tone?: 'danger'; onConfirm: () => void; onCancel: () => void }) {
  return <div className="confirm-overlay" onClick={onCancel}><div className="confirm-dialog card" onClick={e => e.stopPropagation()} role="alertdialog" aria-modal="true" aria-label={title}><h3>{title}</h3><p>{message}</p><div className="confirm-actions"><button className="button light" onClick={onCancel}>Cancel</button><button className={`button dark ${tone === 'danger' ? 'confirm-danger' : ''}`} onClick={onConfirm}>{confirmLabel}</button></div></div></div>;
}
