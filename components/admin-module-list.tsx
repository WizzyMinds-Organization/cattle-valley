'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { Item, deleteItem } from '@/lib/cms';
import { ConfirmDialog } from './confirm-dialog';

export type ContentModule = 'Blogs' | 'Hubs & auctions' | 'Gallery' | 'Testimonials' | 'Documents' | 'Careers';

export function ModuleListPage({ module, slug, singular, fetchItems, showStatus = true }: {
  module: ContentModule;
  slug: string;
  singular: string;
  fetchItems: () => Promise<Item[]>;
  showStatus?: boolean;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [notice, setNotice] = useState('');
  const [pendingDelete, setPendingDelete] = useState<Item | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchItems().then(data => { if (!cancelled) { setItems(data); setReady(true); } }).catch(err => { if (!cancelled) { setLoadError(err instanceof Error ? err.message : 'Could not reach Supabase.'); setReady(true); } });
    return () => { cancelled = true; };
  }, []);

  async function remove(id: string) {
    try { await deleteItem(module, id); setItems(prev => prev.filter(i => i.id !== id)); setNotice('Item removed.'); }
    catch (err) { setNotice(err instanceof Error ? err.message : 'Failed to delete.'); }
  }

  return (
    <>
      <div className="admin-top"><div><h1 className="display">{module}</h1></div><Link className="button dark" href={`/admin/${slug}/new`}><Plus size={16} />Add {singular}</Link></div>
      {notice && <div className="admin-notice">{notice}<button onClick={() => setNotice('')} aria-label="Close"><X size={14} /></button></div>}
      {loadError && <div className="admin-notice">Could not load content from Supabase: {loadError}</div>}
      {!ready && <p className="admin-helper">Loading…</p>}
      {ready && <>
        <p className="admin-helper">Changes save straight to the database and go live on the public site immediately.</p>
        <div className="admin-table card">
          {items.map(item => <div className="admin-row" key={item.id}><div className="admin-row-main">{item.image && <img className="admin-thumb" src={item.image} alt="" />}<div><b>{item.title}</b><span>{item.detail}</span></div></div><div className="row-actions">{showStatus && item.status && <span className={`status ${item.status.toLowerCase()}`}>{item.status}</span>}<Link href={`/admin/${slug}/${item.id}`}>Edit</Link><button className="danger" onClick={() => setPendingDelete(item)} aria-label={`Delete ${item.title}`}><Trash2 size={15} /></button></div></div>)}
          {items.length === 0 && <div className="admin-empty">No entries yet. Add your first one above.</div>}
        </div>
      </>}
      {pendingDelete && <ConfirmDialog title="Delete this item?" message={`Delete "${pendingDelete.title}"? This can't be undone.`} confirmLabel="Delete" tone="danger" onConfirm={() => { remove(pendingDelete.id); setPendingDelete(null); }} onCancel={() => setPendingDelete(null)} />}
    </>
  );
}
