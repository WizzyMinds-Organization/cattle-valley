'use client';

import Link from 'next/link';
import { DragEvent, useEffect, useState } from 'react';
import { GripVertical, Pencil, Plus, Trash2, X } from 'lucide-react';
import { Item, deleteItem, fetchGalleryImages, reorderGalleryImages, saveItem } from '@/lib/cms';
import { ConfirmDialog } from './confirm-dialog';
import { GalleryEditor } from './admin-editors';
import { PhotoGridSkeleton } from './skeletons';

const emptyGalleryItem = (): Item => ({ id: '', title: '', detail: '' });

export function GalleryAdminGrid() {
  const [items, setItems] = useState<Item[]>([]);
  const [savedOrder, setSavedOrder] = useState<Item[]>([]);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [notice, setNotice] = useState('');
  const [pendingDelete, setPendingDelete] = useState<Item | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [activeTag, setActiveTag] = useState('all');
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [orderDirty, setOrderDirty] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchGalleryImages().then(data => { if (!cancelled) { setItems(data); setSavedOrder(data); setReady(true); } }).catch(err => { if (!cancelled) { setLoadError(err instanceof Error ? err.message : 'Could not reach Supabase.'); setReady(true); } });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    function handler(e: BeforeUnloadEvent) { if (orderDirty) { e.preventDefault(); e.returnValue = ''; } }
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [orderDirty]);

  async function remove(id: string) {
    setDeleting(true);
    try { await deleteItem('Gallery', id); setItems(prev => prev.filter(i => i.id !== id)); setSavedOrder(prev => prev.filter(i => i.id !== id)); setNotice('Image removed.'); setPendingDelete(null); }
    catch (err) { setNotice(err instanceof Error ? err.message : 'Failed to delete.'); }
    finally { setDeleting(false); }
  }

  async function addImage(item: Item) {
    const minOrder = items.reduce((min, i) => typeof i.sortOrder === 'number' ? Math.min(min, i.sortOrder) : min, 0);
    const saved = await saveItem('Gallery', { ...item, sortOrder: minOrder - 1 }, true);
    setItems(prev => [saved, ...prev]);
    setSavedOrder(prev => [saved, ...prev]);
    setShowAdd(false);
  }

  async function saveOrder() {
    setSavingOrder(true);
    try { await reorderGalleryImages(items.map(i => i.id)); setSavedOrder(items); setOrderDirty(false); setNotice('Order saved.'); }
    catch (err) { setNotice(err instanceof Error ? err.message : 'Failed to save order.'); }
    finally { setSavingOrder(false); }
  }
  function discardOrder() { setItems(savedOrder); setOrderDirty(false); }

  function onDragStart(id: string) { setDragId(id); }
  function onDragOver(e: DragEvent<HTMLDivElement>, overId: string) {
    e.preventDefault();
    if (!dragId || dragId === overId) return;
    setItems(prev => {
      const from = prev.findIndex(i => i.id === dragId);
      const to = prev.findIndex(i => i.id === overId);
      if (from === -1 || to === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    setOrderDirty(true);
  }
  function onDragEnd() { setDragId(null); }

  const tags = Array.from(new Set(items.flatMap(item => item.tags?.length ? item.tags : [item.slug || 'general'])));
  const visible = activeTag === 'all' ? items : items.filter(item => (item.tags?.length ? item.tags : [item.slug || 'general']).includes(activeTag));
  const canReorder = activeTag === 'all';

  return <>
    <div className="admin-top"><div><h1 className="display">Gallery</h1></div><button className="button dark" onClick={() => setShowAdd(true)}><Plus size={16} />Add gallery</button></div>
    {notice && <div className="admin-notice">{notice}<button onClick={() => setNotice('')} aria-label="Close"><X size={14} /></button></div>}
    {loadError && <div className="admin-notice">Could not load content from Supabase: {loadError}</div>}
    {!ready && <PhotoGridSkeleton count={8} />}
    {ready && <>
      {tags.length > 0 && <div className="gallery-filters" aria-label="Filter by tag">
        <button className={activeTag === 'all' ? 'is-active' : ''} onClick={() => setActiveTag('all')}>All ({items.length})</button>
        {tags.map(tag => <button key={tag} className={activeTag === tag ? 'is-active' : ''} onClick={() => setActiveTag(tag)}>{tag.replace(/-/g, ' ')}</button>)}
      </div>}
      {visible.length === 0 && <div className="admin-empty">No images in this category yet.</div>}
      {visible.length > 0 && <div className="gallery-order-bar">
        <p className="admin-helper">{canReorder ? 'Drag photos to change the order visitors see them in.' : 'Switch to "All" to drag and reorder photos.'}</p>
        {orderDirty && <div className="gallery-order-actions">
          <span className="gallery-order-unsaved">Unsaved order</span>
          <button type="button" className="button light" onClick={discardOrder} disabled={savingOrder}>Discard</button>
          <button type="button" className="button dark" onClick={saveOrder} disabled={savingOrder} aria-busy={savingOrder}>{savingOrder ? <span className="spinner" aria-hidden="true" /> : null}{savingOrder ? 'Saving…' : 'Save order'}</button>
        </div>}
      </div>}
      <div className="admin-photo-grid">
        {visible.map(item => <div
          className={`admin-photo-card${loadedImages[item.id] ? '' : ' skeleton-shimmer'}${dragId === item.id ? ' is-dragging' : ''}`}
          key={item.id}
          draggable={canReorder}
          onDragStart={() => onDragStart(item.id)}
          onDragOver={e => onDragOver(e, item.id)}
          onDragEnd={onDragEnd}
        >
          <img src={item.image} alt={item.title} loading="lazy" style={{ opacity: loadedImages[item.id] ? 1 : 0 }} onLoad={() => setLoadedImages(prev => ({ ...prev, [item.id]: true }))} />
          {canReorder && <span className="admin-photo-drag" aria-hidden="true"><GripVertical size={15} /></span>}
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
    {showAdd && <div className="confirm-overlay" onClick={() => setShowAdd(false)}><div className="gallery-add-modal" onClick={e => e.stopPropagation()}>
      <GalleryEditor item={emptyGalleryItem()} onCancel={() => setShowAdd(false)} onSave={addImage} onDirty={() => {}} />
    </div></div>}
  </>;
}
