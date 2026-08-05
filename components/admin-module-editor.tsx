'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { Item, saveItem } from '@/lib/cms';
import { HubEditor, BlogEditor, GalleryEditor, TestimonialEditor, DocumentEditor, JobEditor } from './admin-editors';
import type { ContentModule } from './admin-module-list';
import { FormSkeleton } from './skeletons';

const emptyByModule: Record<ContentModule, () => Item> = {
  'Hubs & auctions': () => ({ id: '', title: '', detail: '', location: '', description: '', auctionDate: '', whatsapp: '', contactNumber: '', mapsUrl: '', image: '' }),
  Blogs: () => ({ id: '', title: '', detail: '', status: 'Draft' }),
  Gallery: () => ({ id: '', title: '', detail: '' }),
  Testimonials: () => ({ id: '', title: '', detail: '', status: 'Published' }),
  Documents: () => ({ id: '', title: '', detail: '', category: '', issueDate: '' }),
  Careers: () => ({ id: '', title: '', detail: '', category: '', location: '', employmentType: '', content: '', status: 'Draft' }),
};

export function ModuleEditorPage({ module, slug, id, fetchItems }: { module: ContentModule; slug: string; id?: string; fetchItems: () => Promise<Item[]> }) {
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(id ? null : emptyByModule[module]());
  const [notFound, setNotFound] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    fetchItems().then(items => { if (cancelled) return; const found = items.find(i => i.id === id); if (found) setItem(found); else setNotFound(true); });
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => { function handler(e: BeforeUnloadEvent) { if (dirty) { e.preventDefault(); e.returnValue = ''; } } window.addEventListener('beforeunload', handler); return () => window.removeEventListener('beforeunload', handler); }, [dirty]);

  async function save(next: Item) {
    try { await saveItem(module, next, !next.id); setDirty(false); router.push(`/admin/${slug}`); router.refresh(); }
    catch (err) { setSaveError(err instanceof Error ? err.message : 'Failed to save.'); }
  }
  function cancel() { router.push(`/admin/${slug}`); }
  function markDirty() { setDirty(true); }

  if (notFound) return <p className="admin-helper">Item not found.</p>;
  if (!item) return <FormSkeleton />;

  const props = { item, onCancel: cancel, onSave: save, onDirty: markDirty };
  return <>
    {saveError && <div className="admin-notice">{saveError}<button onClick={() => setSaveError('')} aria-label="Close"><X size={14} /></button></div>}
    {module === 'Hubs & auctions' && <HubEditor {...props} />}
    {module === 'Gallery' && <GalleryEditor {...props} />}
    {module === 'Blogs' && <BlogEditor {...props} />}
    {module === 'Testimonials' && <TestimonialEditor {...props} />}
    {module === 'Documents' && <DocumentEditor {...props} />}
    {module === 'Careers' && <JobEditor {...props} />}
  </>;
}
