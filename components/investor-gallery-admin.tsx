'use client';

import { ChangeEvent, DragEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Settings as SettingsIcon, Trash2, UploadCloud, X } from 'lucide-react';
import { InvestorCategory, InvestorImage, deleteInvestorImage, fetchInvestorCategories, fetchInvestorImages, formatAuctionDate, saveInvestorImage, uploadFile } from '@/lib/cms';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { InvestorCategoryModal } from '@/components/investor-category-modal';
import { DatePicker, Select } from '@/components/ui-controls';
import { InvestorGroupsSkeleton } from '@/components/skeletons';

const DATES_PER_PAGE = 4;

export function InvestorGalleryAdmin() {
  const [categories, setCategories] = useState<InvestorCategory[]>([]);
  const [images, setImages] = useState<InvestorImage[]>([]);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<InvestorImage | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadCategory, setUploadCategory] = useState('');
  const [uploadDate, setUploadDate] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [datePage, setDatePage] = useState<Record<string, number>>({});

  useEffect(() => {
    Promise.all([fetchInvestorCategories(), fetchInvestorImages()])
      .then(([cats, imgs]) => { setCategories(cats); setImages(imgs); setReady(true); if (cats[0]) setOpenCategory(cats[0].id); })
      .catch(err => { setError(err instanceof Error ? err.message : 'Could not reach Supabase.'); setReady(true); });
  }, []);

  function toggleCategory(id: string) { setOpenCategory(prev => prev === id ? null : id); }
  function changeDatePage(categoryId: string, page: number) { setDatePage(prev => ({ ...prev, [categoryId]: page })); }

  function addFiles(list: FileList | File[]) {
    const incoming = Array.from(list).filter(f => f.type.startsWith('image/'));
    setFiles(prev => [...prev, ...incoming]);
  }
  function pickFiles(e: ChangeEvent<HTMLInputElement>) { if (e.target.files) addFiles(e.target.files); e.target.value = ''; }
  function removeFile(index: number) { setFiles(prev => prev.filter((_, i) => i !== index)); }
  function onDrop(e: DragEvent<HTMLDivElement>) { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files) addFiles(e.dataTransfer.files); }

  async function submitBatch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!uploadCategory || !uploadDate || files.length === 0) { setError('Choose a category, a date, and at least one photo.'); return; }
    setUploading(true); setError(''); setNotice('');
    try {
      const saved: InvestorImage[] = [];
      for (let i = 0; i < files.length; i++) {
        setProgress(`Uploading ${i + 1} of ${files.length}…`);
        const file = files[i];
        const uploaded = await uploadFile(file);
        const item = await saveInvestorImage({ title: file.name, category: uploadCategory, takenOn: uploadDate, image: uploaded.url }, true);
        saved.push(item);
      }
      setImages(prev => [...saved, ...prev]);
      setNotice(`Uploaded ${saved.length} photo${saved.length === 1 ? '' : 's'}.`);
      setFiles([]);
      setUploadDate('');
      e.currentTarget.reset();
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to upload photos.'); }
    finally { setUploading(false); setProgress(''); }
  }

  async function remove(id: string) {
    try { await deleteInvestorImage(id); setImages(prev => prev.filter(i => i.id !== id)); setNotice('Photo removed.'); }
    catch (err) { setNotice(err instanceof Error ? err.message : 'Failed to delete.'); }
  }

  const groups = useMemo(() => {
    return categories.map(cat => {
      const catImages = images.filter(i => i.category === cat.slug);
      const byDate = new Map<string, InvestorImage[]>();
      for (const image of catImages) {
        const list = byDate.get(image.takenOn) || [];
        list.push(image);
        byDate.set(image.takenOn, list);
      }
      const dates = Array.from(byDate.keys()).sort().reverse().map(date => ({ date, images: byDate.get(date)! }));
      return { category: cat, count: catImages.length, dates };
    });
  }, [categories, images]);

  return <>
    <div className="admin-top"><div><h1 className="display">Investor gallery</h1></div><button className="button light" onClick={() => setShowCategoryModal(true)}><SettingsIcon size={16} />Manage categories</button></div>
    {notice && <div className="admin-notice">{notice}<button onClick={() => setNotice('')} aria-label="Close"><X size={14} /></button></div>}
    {!ready && <InvestorGroupsSkeleton />}
    {ready && <>
      <p className="admin-helper">Bulk-upload a batch of photos for one category and one date — this is what the team shares with investors as a filtered link.</p>
      <form className="card editor editor-wide" onSubmit={submitBatch}>
        <div className="upload-layout">
          <div className="field upload-field-category">
            <label htmlFor="category">Category</label>
            <Select id="category" name="category" placeholder="Select a category…" value={uploadCategory} onChange={setUploadCategory} options={categories.map(c => ({ value: c.slug, label: c.name }))} />
            {categories.length === 0 && <small>No categories yet — use &quot;Manage categories&quot; above to add one first.</small>}
          </div>
          <div className="field upload-field-date"><label htmlFor="takenOn">Date these photos were taken / provided</label><DatePicker id="takenOn" name="takenOn" value={uploadDate} onChange={setUploadDate} /></div>

          <div
            className={`upload-dropzone ${dragOver ? 'is-drag-over' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
          >
            <UploadCloud size={26} />
            <p><b>Drag photos here</b> or <label htmlFor="files" className="upload-browse-link">browse files</label></p>
            <input id="files" type="file" accept="image/*" multiple onChange={pickFiles} style={{ display: 'none' }} />
          </div>

          <div className="field upload-submit-field"><button className="button dark" disabled={uploading}><UploadCloud size={16} />{uploading ? (progress || 'Uploading…') : `Upload ${files.length || ''} batch`}</button></div>
        </div>

        {files.length > 0 && <div className="upload-preview-grid">
          {files.map((file, i) => <div className="upload-preview-item" key={`${file.name}-${i}`}>
            <img src={URL.createObjectURL(file)} alt="" />
            <button type="button" onClick={() => removeFile(i)} aria-label={`Remove ${file.name}`}><X size={13} /></button>
          </div>)}
        </div>}
        {files.length > 0 && <small>{files.length} photo{files.length === 1 ? '' : 's'} ready to upload.</small>}

        {error && <p className="form-error">{error}</p>}
      </form>

      <div className="investor-groups">
        {groups.map(group => {
          const isOpen = openCategory === group.category.id;
          const totalPages = Math.max(1, Math.ceil(group.dates.length / DATES_PER_PAGE));
          const currentPage = Math.min(datePage[group.category.id] || 0, totalPages - 1);
          const visibleDates = group.dates.slice(currentPage * DATES_PER_PAGE, currentPage * DATES_PER_PAGE + DATES_PER_PAGE);
          return <div className="investor-group" key={group.category.id}>
            <button type="button" className="investor-group-summary" onClick={() => toggleCategory(group.category.id)} aria-expanded={isOpen}>
              <span className="investor-group-title">{group.category.name}</span>
              <span className="investor-group-count">{group.count} photo{group.count === 1 ? '' : 's'} · {group.dates.length} date{group.dates.length === 1 ? '' : 's'}<ChevronDown size={16} className={`investor-group-chevron${isOpen ? ' is-open' : ''}`} /></span>
            </button>
            {isOpen && <>
              {group.dates.length === 0 && <p className="admin-helper" style={{ padding: '0 0 16px' }}>No photos in this category yet.</p>}
              {visibleDates.map(({ date, images: dateImages }) => <div className="investor-date-group" key={date}>
                <span className="investor-date-label">{formatAuctionDate(date)} <em>({dateImages.length})</em></span>
                <div className="investor-photo-grid">
                  {dateImages.map(image => <div className="investor-photo-card" key={image.id}>
                    <img src={image.image} alt={image.title} loading="lazy" />
                    <button className="investor-photo-delete" onClick={() => setPendingDelete(image)} aria-label="Delete photo"><Trash2 size={14} /></button>
                  </div>)}
                </div>
              </div>)}
              {totalPages > 1 && <div className="investor-pagination">
                <button type="button" className="ui-date-nav" onClick={() => changeDatePage(group.category.id, currentPage - 1)} disabled={currentPage === 0} aria-label="Previous dates"><ChevronLeft size={16} /></button>
                <span>Page {currentPage + 1} of {totalPages}</span>
                <button type="button" className="ui-date-nav" onClick={() => changeDatePage(group.category.id, currentPage + 1)} disabled={currentPage === totalPages - 1} aria-label="Next dates"><ChevronRight size={16} /></button>
              </div>}
            </>}
          </div>;
        })}
        {groups.length === 0 && <div className="admin-empty">No categories yet — use &quot;Manage categories&quot; to add one first.</div>}
      </div>
    </>}
    {showCategoryModal && <InvestorCategoryModal categories={categories} onClose={() => setShowCategoryModal(false)} onChange={setCategories} />}
    {pendingDelete && <ConfirmDialog title="Delete this photo?" message="This can't be undone." confirmLabel="Delete" tone="danger" onConfirm={() => { remove(pendingDelete.id); setPendingDelete(null); }} onCancel={() => setPendingDelete(null)} />}
  </>;
}
