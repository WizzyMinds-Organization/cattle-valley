'use client';

import { useEffect, useMemo, useState } from 'react';
import { InvestorCategory, InvestorImage, fetchInvestorCategories, fetchInvestorImages, formatAuctionDate } from '@/lib/cms';

export function InvestorGalleryBrowser() {
  const [categories, setCategories] = useState<InvestorCategory[]>([]);
  const [images, setImages] = useState<InvestorImage[]>([]);
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([fetchInvestorCategories(), fetchInvestorImages()]).then(([cats, imgs]) => {
      setCategories(cats); setImages(imgs);
      const params = new URLSearchParams(window.location.search);
      const urlCategory = params.get('category');
      const urlDate = params.get('date');
      const initialCategory = urlCategory || cats[0]?.slug || '';
      const datesForCategory = imgs.filter(i => i.category === initialCategory).map(i => i.takenOn).sort().reverse();
      const initialDate = urlDate || datesForCategory[0] || '';
      setCategory(initialCategory);
      setDate(initialDate);
      setReady(true);
    }).catch(() => setReady(true));
  }, []);

  const dates = useMemo(() => Array.from(new Set(images.filter(i => i.category === category).map(i => i.takenOn))).sort().reverse(), [images, category]);
  const visible = images.filter(i => i.category === category && i.takenOn === date);

  function updateUrl(nextCategory: string, nextDate: string) {
    const url = new URL(window.location.href);
    if (nextCategory) url.searchParams.set('category', nextCategory); else url.searchParams.delete('category');
    if (nextDate) url.searchParams.set('date', nextDate); else url.searchParams.delete('date');
    window.history.replaceState({}, '', url);
  }

  function chooseCategory(slug: string) {
    setCategory(slug);
    const nextDates = Array.from(new Set(images.filter(i => i.category === slug).map(i => i.takenOn))).sort().reverse();
    const nextDate = nextDates[0] || '';
    setDate(nextDate);
    updateUrl(slug, nextDate);
  }

  function chooseDate(value: string) {
    setDate(value);
    updateUrl(category, value);
  }

  if (!ready) return <div className="masonry" aria-hidden="true">{Array.from({ length: 6 }).map((_, i) => <div className="skeleton-tile" key={i} />)}</div>;

  if (categories.length === 0) return <p className="gallery-empty">No investor photos have been published yet.</p>;

  return <>
    <div className="investor-gallery-controls">
      <div className="gallery-filters" aria-label="Investor gallery categories">
        {categories.map(c => <button key={c.id} className={category === c.slug ? 'is-active' : ''} onClick={() => chooseCategory(c.slug)}>{c.name}</button>)}
      </div>
      {dates.length > 0 && <select className="investor-date-select" value={date} onChange={e => chooseDate(e.target.value)} aria-label="Select date">
        {dates.map(d => <option key={d} value={d}>{formatAuctionDate(d)}</option>)}
      </select>}
    </div>
    <div className="masonry">{visible.map(image => <img key={image.id} src={image.image} alt={image.title} loading="lazy" />)}</div>
    {visible.length === 0 && <p className="gallery-empty">No photos for this category and date yet.</p>}
  </>;
}
