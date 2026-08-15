'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, CalendarDays, X } from 'lucide-react';
import { Item, fetchDocuments, fetchGalleryImages, fetchHubs, formatAuctionDate } from '@/lib/cms';

function hasUpcomingAuction(value?: string) { if (!value) return false; const date = new Date(`${value}T00:00:00`); return !Number.isNaN(date.getTime()) && date.getTime() >= new Date(new Date().toDateString()).getTime(); }
function isRecent(iso?: string, days = 31) { if (!iso) return false; return Date.now() - new Date(iso).getTime() <= days * 24 * 60 * 60 * 1000; }

export function AnnounceModal() {
  const [open, setOpen] = useState(false);
  const [upcoming, setUpcoming] = useState<Item[]>([]);
  const [hasNewContent, setHasNewContent] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('gv-announce-shown')) return;
    let cancelled = false;
    let timer: number | undefined;
    Promise.all([fetchHubs(), fetchGalleryImages(), fetchDocuments()]).then(([hubs, gallery, docs]) => {
      if (cancelled) return;
      const soon = hubs.filter(h => hasUpcomingAuction(h.auctionDate)).sort((a, b) => new Date(a.auctionDate || 0).getTime() - new Date(b.auctionDate || 0).getTime()).slice(0, 3);
      const newContent = gallery.some(g => isRecent(g.createdAt)) || docs.some(d => isRecent(d.createdAt));
      if (soon.length === 0 && !newContent) return;
      setUpcoming(soon);
      setHasNewContent(newContent);
      timer = window.setTimeout(() => { setOpen(true); sessionStorage.setItem('gv-announce-shown', '1'); }, 3000);
    }).catch(() => {});
    return () => { cancelled = true; if (timer) window.clearTimeout(timer); };
  }, []);

  if (!open) return null;

  return <div className="confirm-overlay">
    <div className="confirm-dialog card announce-modal" role="dialog" aria-modal="true" aria-label="Latest updates">
      <button type="button" className="announce-close" onClick={() => setOpen(false)} aria-label="Close">
        <X size={18} />
      </button>
      <h3>What&apos;s new at Cattle Valley</h3>
      {upcoming.length > 0 && <div className="announce-section">
        <span className="eyebrow">Upcoming auctions</span>
        <ul className="announce-list">{upcoming.map(hub => <li key={hub.id}><CalendarDays size={15} /><span><b>{hub.title}</b>{formatAuctionDate(hub.auctionDate)} · {hub.location}</span></li>)}</ul>
      </div>}
      {hasNewContent && <Link href="/investor-gallery" className="announce-notification" onClick={() => setOpen(false)}>
        <span className="announce-bell"><Bell size={22} /><span className="announce-badge" aria-hidden="true" /></span>
        New photos and documents were just added. See the investor gallery
      </Link>}
      <div className="confirm-actions"><button className="button dark" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setOpen(false)}>Got it</button></div>
    </div>
  </div>;
}
