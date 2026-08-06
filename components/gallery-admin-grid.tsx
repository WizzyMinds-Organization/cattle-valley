'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { Item, deleteItem, fetchGalleryImages } from '@/lib/cms';
import { ConfirmDialog } from './confirm-dialog';
import { PhotoGridSkeleton } from './skeletons';

export function GalleryAdminGrid() {
  const [items, setItems] = useState<Item[]>([]);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [notice, setNotice] = useState('');
  const [pendingDelete, setPendingDelete] = useState<Item | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [activeTag, setActiveTag] = useState('all');
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let cancelled = false;
    fetchGalleryImages().then(data => { if (!cancelled) { setItems(data); setReady(true); } }).catch(err => { if (!cancelled) { setLoadError(err instanceof Error ? err.message : 'Could not reach Supabase.'); setReady(true); } });
    return () => { cancelled = true; };
  }, []);

  async function remove(id: string) {
    setDeleting(true);
    try { await deleteItem('Gallery', id); setItems(prev => prev.filter(i => i.id !== id)); setNotice('Image removed.'); setPendingDelete(null); }
    catch (err) { setNotice(err instanceof Error ? err.message : 'Failed to delete.'); }
    finally { setDeleting(false); }
  }

  const tags = Array.from(new Set(items.flatMap(item => item.tags?.length ? item.tags : [item.slug || 'general'])));
  const visible = activeTag === 'all' ? items : items.filter(item => (item.tags?.length ? item.tags : [item.slug || 'general']).includes(activeTag));

  return <>
    <div className="admin-top"><div><h1 className="display">Gallery</h1></div><Link className="button dark" href="/admin/gallery/new"><Plus size={16} />Add gallery</Link></div>
    {notice && <div className="admin-notice">{notice}<button onClick={() => setNotice('')} aria-label="Close"><X size={14} /></button></div>}
    {loadError && <div className="admin-notice">Could not load content from Supabase: {loadError}</div>}
    {!ready && <PhotoGridSkeleton count={8} />}
    {ready && <>
      {tags.length > 0 && <div className="gallery-filters" aria-label="Filter by tag">
        <button className={activeTag === 'all' ? 'is-active' : ''} onClick={() => setActiveTag('all')}>All ({items.length})</button>
        {tags.map(tag => <button key={tag} className={activeTag === tag ? 'is-active' : ''} onClick={() => setActiveTag(tag)}>{tag.replace(/-/g, ' ')}</button>)}
      </div>}
      {visible.length === 0 && <div className="admin-empty">No images in this category yet.</div>}
      <div className="admin-photo-grid">
        {visible.map(item => <div className={`admin-photo-card${loadedImages[item.id] ? '' : ' skeleton-shimmer'}`} key={item.id}>
          <img src={item.image} alt={item.title} loading="lazy" style={{ opacity: loadedImages[item.id] ? 1 : 0 }} onLoad={() => setLoadedImages(prev => ({ ...prev, [item.id]: true }))} />
          <div className="admin-photo-overlay">
            <div className="admin-photo-info"><b>{item.title}</b><span>{item.detail}</span></div>
            <div className="admin-photo-actions">
              <Link href={`/admin/gallery/${item.id}`} aria-label={`Edit ${item.title}`}><Pencil size={15} /></Link>
              <button onClick={() => setPendingDelete(item)} disabled={deleting} aria-label={`Delete ${item.title}`}><Trash2 size={15} /></button>
            </div>
          </div>
        </div>)}
      </div>
    </>}
    {pendingDelete && <ConfirmDialog title="Delete this image?" message={`Delete "${pendingDelete.title}"? This can't be undone.`} confirmLabel="Delete" tone="danger" busy={deleting} onConfirm={() => remove(pendingDelete.id)} onCancel={() => setPendingDelete(null)} />}
  </>;
}
