'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { FileText } from 'lucide-react';
import { Item, fetchGalleryImages, fetchDocuments } from '@/lib/cms';

const PAGE_SIZE = 9;

function GallerySkeleton() {
  return <div className="masonry" aria-hidden="true">{Array.from({ length: PAGE_SIZE }).map((_, i) => <div className="skeleton-tile" key={i} style={{ height: 180 + (i % 3) * 60 }} />)}</div>;
}

export function GalleryBrowser({ documentsOnly = false }: { documentsOnly?: boolean }) {
  const [gallery, setGallery] = useState<Item[]>([]);
  const [docs, setDocs] = useState<Item[]>([]);
  const [active, setActive] = useState('latest');
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    Promise.all([fetchGalleryImages().then(setGallery).catch(() => {}), fetchDocuments().then(setDocs).catch(() => {})]).finally(() => setLoading(false));
    const shared = new URLSearchParams(window.location.search).get('category');
    if (shared) setActive(shared);
  }, []);

  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [active]);

  const categories = useMemo(() => ['latest', ...Array.from(new Set(gallery.flatMap(item => item.tags?.length ? item.tags : [item.slug || 'general'])))], [gallery]);
  const images = gallery.filter(item => {
    if (active === 'latest') { const d = new Date(item.createdAt || 0); return Date.now() - d.getTime() <= 31 * 24 * 60 * 60 * 1000; }
    return (item.tags?.length ? item.tags : [item.slug || 'general']).includes(active);
  });
  const visibleImages = images.slice(0, visibleCount);
  const allDocs = [...docs].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  const visibleDocs = documentsOnly ? allDocs : allDocs.slice(0, 10);

  function choose(category: string) {
    setActive(category);
    const url = new URL(window.location.href);
    if (category === 'latest') url.searchParams.delete('category'); else url.searchParams.set('category', category);
    window.history.replaceState({}, '', url);
  }

  return <>
    {!documentsOnly && <>
      <div className="gallery-filters" aria-label="Gallery categories">{categories.map(category => <button onClick={() => choose(category)} className={active === category ? 'is-active' : ''} key={category}>{category === 'latest' ? 'Latest' : category.replace(/-/g, ' ')}</button>)}</div>
      {loading ? <GallerySkeleton /> : <>
        <div className="masonry">{visibleImages.map(image => <img key={image.id} src={image.image} alt={image.title} loading="lazy" />)}</div>
        {images.length === 0 && <p className="gallery-empty">No images in this category yet.</p>}
        {visibleCount < images.length && <button className="button light gallery-load-more" onClick={() => setVisibleCount(c => c + PAGE_SIZE)}>Load more</button>}
      </>}
    </>}
    <section className="documents-preview">
      <span className="eyebrow">Document library</span>
      <h2 className="display split-heading">{documentsOnly ? 'All documents.' : 'Useful resources.'}</h2>
      <div className="documents-list">
        {visibleDocs.map(doc => <a className="document-row" key={doc.id} href={doc.url || '#'} download={doc.title}><FileText size={19} /><span><b>{doc.title}</b><small>{doc.detail}</small></span></a>)}
        {!loading && visibleDocs.length === 0 && <p className="gallery-empty">No documents have been uploaded yet.</p>}
      </div>
      {!documentsOnly && <Link href="/documents" className="button light">More documents</Link>}
    </section>
  </>;
}
