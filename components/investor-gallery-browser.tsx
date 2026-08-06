'use client';

import { useEffect, useMemo, useState } from 'react';
import { InvestorCategory, InvestorImage, InvestorImageDate, fetchInvestorCategories, fetchInvestorImageDates, fetchInvestorImagesFor, fetchLatestInvestorImages, formatAuctionDate } from '@/lib/cms';
import { Select } from '@/components/ui-controls';
import { Lightbox } from '@/components/lightbox';

const LATEST_COUNT = 9;

function GallerySkeleton() {
  return <div className="masonry" aria-hidden="true">{Array.from({ length: 6 }).map((_, i) => <div className="skeleton-tile" key={i} />)}</div>;
}

export function InvestorGalleryBrowser() {
  const [categories, setCategories] = useState<InvestorCategory[]>([]);
  const [dateIndex, setDateIndex] = useState<InvestorImageDate[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');

  const [activeCategory, setActiveCategory] = useState(''); // '' = Latest view
  const [selectedDate, setSelectedDate] = useState('');
  const [appliedDate, setAppliedDate] = useState('');

  const [images, setImages] = useState<InvestorImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const isLatestView = activeCategory === '';
  const datesForActive = useMemo(() => Array.from(new Set(dateIndex.filter(d => d.category === activeCategory).map(d => d.takenOn))).sort().reverse(), [dateIndex, activeCategory]);

  async function loadLatest() {
    setLoadingImages(true);
    try { setImages(await fetchLatestInvestorImages(LATEST_COUNT)); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not load photos.'); }
    finally { setLoadingImages(false); }
  }

  async function loadFiltered(cat: string, takenOn: string) {
    setLoadingImages(true);
    try { setImages(await fetchInvestorImagesFor(cat, takenOn)); setAppliedDate(takenOn); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not load photos.'); }
    finally { setLoadingImages(false); }
  }

  function updateUrl(nextCategory: string, nextDate: string) {
    const url = new URL(window.location.href);
    if (nextCategory) url.searchParams.set('category', nextCategory); else url.searchParams.delete('category');
    if (nextDate) url.searchParams.set('date', nextDate); else url.searchParams.delete('date');
    window.history.replaceState({}, '', url);
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlCategory = params.get('category') || '';
    const urlDate = params.get('date') || '';

    Promise.all([fetchInvestorCategories(), fetchInvestorImageDates()]).then(([cats, dates]) => {
      setCategories(cats);
      setDateIndex(dates);
      setReady(true);
      if (urlCategory) {
        const datesForCategory = dates.filter(d => d.category === urlCategory).map(d => d.takenOn).sort().reverse();
        const initialDate = urlDate || datesForCategory[0] || '';
        setActiveCategory(urlCategory);
        setSelectedDate(initialDate);
        if (initialDate) loadFiltered(urlCategory, initialDate);
      } else {
        loadLatest();
      }
    }).catch(err => { setError(err instanceof Error ? err.message : 'Could not load gallery.'); setReady(true); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function chooseLatest() {
    setActiveCategory('');
    setSelectedDate('');
    setAppliedDate('');
    updateUrl('', '');
    loadLatest();
  }

  function chooseCategory(slug: string) {
    setActiveCategory(slug);
    const nextDates = Array.from(new Set(dateIndex.filter(d => d.category === slug).map(d => d.takenOn))).sort().reverse();
    setSelectedDate(nextDates[0] || '');
    setAppliedDate('');
    setImages([]);
  }

  function applyFilter() {
    if (!activeCategory || !selectedDate) return;
    updateUrl(activeCategory, selectedDate);
    loadFiltered(activeCategory, selectedDate);
  }

  if (!ready) return <GallerySkeleton />;

  if (categories.length === 0) return <p className="gallery-empty">No investor photos have been published yet.</p>;

  return <>
    <div className="investor-gallery-controls">
      <div className="gallery-filters" aria-label="Investor gallery categories">
        <button className={isLatestView ? 'is-active' : ''} onClick={chooseLatest}>Latest</button>
        {categories.map(c => <button key={c.id} className={activeCategory === c.slug ? 'is-active' : ''} onClick={() => chooseCategory(c.slug)}>{c.name}</button>)}
      </div>
      {!isLatestView && datesForActive.length > 0 && <div className="investor-filter-apply">
        <Select className="investor-date-select" value={selectedDate} onChange={setSelectedDate} ariaLabel="Select date" options={datesForActive.map(d => ({ value: d, label: formatAuctionDate(d) }))} />
        <button className="button dark" onClick={applyFilter} disabled={loadingImages || (selectedDate === appliedDate && images.length > 0)}>Apply filter</button>
      </div>}
    </div>
    {!isLatestView && datesForActive.length === 0 && <p className="gallery-empty">No photos in this category yet.</p>}
    {(isLatestView || datesForActive.length > 0) && (loadingImages ? <GallerySkeleton /> : <>
      <div className="masonry">{images.map((image, i) => <img key={image.id} src={image.image} alt={image.title} loading="lazy" onClick={() => setLightboxIndex(i)} />)}</div>
      {images.length === 0 && !isLatestView && !appliedDate && <p className="gallery-empty">Select a date and click &quot;Apply filter&quot; to see the photos.</p>}
      {images.length === 0 && !isLatestView && appliedDate && <p className="gallery-empty">No photos for this category and date yet.</p>}
      {images.length === 0 && isLatestView && <p className="gallery-empty">No investor photos have been published yet.</p>}
      {lightboxIndex !== null && <Lightbox
        src={images[lightboxIndex].image}
        alt={images[lightboxIndex].title}
        onClose={() => setLightboxIndex(null)}
        onPrev={lightboxIndex > 0 ? () => setLightboxIndex(i => (i as number) - 1) : undefined}
        onNext={lightboxIndex < images.length - 1 ? () => setLightboxIndex(i => (i as number) + 1) : undefined}
      />}
    </>)}
    {error && <p className="gallery-empty">{error}</p>}
  </>;
}
