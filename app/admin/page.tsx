'use client';

import { useEffect, useState } from 'react';
import { BarChart3, FileText, FolderOpen, ImageIcon, MapPin } from 'lucide-react';
import { fetchBlogPosts, fetchDocuments, fetchGalleryImages, fetchHubs } from '@/lib/cms';
import { DashboardCardsSkeleton } from '@/components/skeletons';

export default function AdminOverview() {
  const [metrics, setMetrics] = useState({ blogs: 0, hubs: 0, gallery: 0, documents: 0 });
  const [ready, setReady] = useState(false);
  useEffect(() => {
    Promise.all([fetchBlogPosts(), fetchHubs(), fetchGalleryImages(), fetchDocuments()])
      .then(([blogs, hubs, gallery, documents]) => setMetrics({ blogs: blogs.length, hubs: hubs.length, gallery: gallery.length, documents: documents.length }))
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);
  return <>
    <div className="admin-top"><div><h1 className="display">Overview</h1></div></div>
    <p className="admin-helper">Manage your live content from one place. Hubs and auctions, gallery images, documents, and testimonials are ready for editing.</p>
    {!ready && <DashboardCardsSkeleton />}
    {ready && <div className="dashboard-cards">{[[String(metrics.blogs), 'Blog posts', FileText], [String(metrics.hubs), 'Hub locations', MapPin], [String(metrics.gallery), 'Gallery images', ImageIcon], [String(metrics.documents), 'Documents', FolderOpen]].map(([number, title, Icon]) => { const Glyph = Icon as typeof BarChart3; return <div className="card admin-metric" key={title as string}><Glyph size={18} /><b>{number as string}</b><span>{title as string}</span></div>; })}</div>}
    <div className="card admin-welcome"><BarChart3 size={24} /><div><h2 className="display">Your content, organised.</h2><p>Use the gallery category and document tools to keep each public collection current.</p></div></div>
  </>;
}
