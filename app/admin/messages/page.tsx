'use client';

import { useEffect, useState } from 'react';
import { Trash2, X } from 'lucide-react';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { AdminRowsSkeleton } from '@/components/skeletons';

type Submission = { id: string; name: string; email: string; message: string; status: 'New' | 'Read'; created_at: string };

export default function MessagesListPage() {
  const [items, setItems] = useState<Submission[]>([]);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [notice, setNotice] = useState('');
  const [pendingDelete, setPendingDelete] = useState<Submission | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/contact').then(res => { if (!res.ok) throw new Error('Could not load messages.'); return res.json(); })
      .then((data: Submission[]) => { if (!cancelled) { setItems(data); setReady(true); } })
      .catch(err => { if (!cancelled) { setLoadError(err instanceof Error ? err.message : 'Could not reach Supabase.'); setReady(true); } });
    return () => { cancelled = true; };
  }, []);

  async function toggleRead(item: Submission) {
    const nextStatus = item.status === 'New' ? 'Read' : 'New';
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: nextStatus } : i));
    await fetch(`/api/contact/${item.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: nextStatus }) }).catch(() => {});
  }

  async function remove(id: string) {
    setDeleting(true);
    try {
      const res = await fetch(`/api/contact/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete.');
      setItems(prev => prev.filter(i => i.id !== id));
      setNotice('Message removed.');
      setPendingDelete(null);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Failed to delete.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="admin-top"><div><h1 className="display">Messages</h1></div></div>
      {notice && <div className="admin-notice">{notice}<button onClick={() => setNotice('')} aria-label="Close"><X size={14} /></button></div>}
      {loadError && <div className="admin-notice">Could not load messages from Supabase: {loadError}</div>}
      {!ready && <AdminRowsSkeleton />}
      {ready && <>
        <p className="admin-helper">Enquiries submitted through the contact form on the website.</p>
        <div className="admin-table card">
          {items.map(item => <div className="admin-row" key={item.id}>
            <div className="admin-row-main"><div><b>{item.name} &middot; <a href={`mailto:${item.email}`}>{item.email}</a></b><span>{item.message}</span><span>{new Date(item.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span></div></div>
            <div className="row-actions">
              <span className={`status ${item.status.toLowerCase()}`}>{item.status}</span>
              <button onClick={() => toggleRead(item)}>{item.status === 'New' ? 'Mark read' : 'Mark unread'}</button>
              <button className="danger" onClick={() => setPendingDelete(item)} disabled={deleting} aria-label={`Delete message from ${item.name}`}><Trash2 size={15} /></button>
            </div>
          </div>)}
          {items.length === 0 && <div className="admin-empty">No messages yet.</div>}
        </div>
      </>}
      {pendingDelete && <ConfirmDialog title="Delete this message?" message={`Delete the message from "${pendingDelete.name}"? This can't be undone.`} confirmLabel="Delete" tone="danger" busy={deleting} onConfirm={() => remove(pendingDelete.id)} onCancel={() => setPendingDelete(null)} />}
    </>
  );
}
