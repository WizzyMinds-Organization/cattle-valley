'use client';

import { ChangeEvent, DragEvent, FormEvent, useRef, useState } from 'react';
import { Save, UploadCloud, X } from 'lucide-react';
import { Item, Status, formatAuctionDate, uploadFile } from '@/lib/cms';
import { RichTextEditor } from './rich-text-editor';
import { DatePicker, Select } from './ui-controls';

type EditorProps = { item: Item; onCancel: () => void; onSave: (item: Item) => Promise<void>; onDirty: () => void };

export function Frame({ children, title, onCancel }: { children: React.ReactNode; title: string; onCancel: () => void }) {
  return <div className="card editor"><div className="editor-heading"><h2 className="display">{title}</h2><button type="button" onClick={onCancel} aria-label="Close editor"><X size={18} /></button></div>{children}</div>;
}

export function HubEditor({ item, onCancel, onSave, onDirty }: EditorProps) {
  const [image, setImage] = useState(item.image || '');
  const [auctionDate, setAuctionDate] = useState(item.auctionDate || '');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState('');
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const selected = auctionDate;
    const file = d.get('image') as File;
    setBusy(true); setError(''); setProgress(file?.size ? 0 : null);
    try {
      const uploadedUrl = file?.size ? (await uploadFile(file, setProgress)).url : image;
      setProgress(null);
      await onSave({ ...item, title: String(d.get('title')), location: String(d.get('location')), description: String(d.get('description')), auctionDate: selected, whatsapp: String(d.get('whatsapp')), contactNumber: String(d.get('contactNumber') || ''), mapsUrl: String(d.get('mapsUrl') || ''), image: uploadedUrl, detail: `${d.get('location')} · Auction: ${formatAuctionDate(selected)}` });
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to upload photo.'); }
    finally { setBusy(false); setProgress(null); }
  }
  return <Frame title={item.title ? 'Edit hub & auction' : 'New hub'} onCancel={onCancel}><form onSubmit={submit} onChange={onDirty}><Field label="Hub name" name="title" value={item.title} /><Field label="Location" name="location" value={item.location} placeholder="Malappuram, Kerala" /><Field label="Hub description" name="description" value={item.description} textarea /><div className="field"><label htmlFor="auctionDate">Upcoming auction date</label><DatePicker id="auctionDate" name="auctionDate" value={auctionDate} onChange={value => { setAuctionDate(value); onDirty(); }} /></div><Field label="Auction WhatsApp number" name="whatsapp" value={item.whatsapp} placeholder="919876543210" hint="Country code only—no +, spaces, or punctuation. Each hub can have a different number." /><div className="field"><label htmlFor="contactNumber">Contact number (shown on the card)</label><input id="contactNumber" name="contactNumber" defaultValue={item.contactNumber} placeholder="+91 98765 43210" /><small>Displayed as visible text on the hub card. Can differ from the WhatsApp number above.</small></div><div className="field"><label htmlFor="mapsUrl">Google Maps link</label><input id="mapsUrl" name="mapsUrl" defaultValue={item.mapsUrl} placeholder="https://maps.app.goo.gl/…" /><small>Paste the link from Google Maps' Share button. Leave blank to hide the "View location" link on the card.</small></div><Upload label="Hub photo" name="image" image={image} onImage={value => { setImage(value); onDirty(); }} required={!image} disabled={busy} progress={progress} />{error && <p className="form-error">{error}</p>}<Actions onCancel={onCancel} busy={busy} savingLabel={progress !== null ? `Uploading ${progress}%…` : undefined} /></form></Frame>;
}

export function JobEditor({ item, onCancel, onSave, onDirty }: EditorProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    setBusy(true); setError('');
    try {
      await onSave({ ...item, title: String(d.get('title')), category: String(d.get('category')), location: String(d.get('location')), employmentType: String(d.get('employmentType')), content: String(d.get('content')), status: d.get('status') === 'Published' ? 'Published' : 'Draft', detail: [d.get('category'), d.get('location'), d.get('employmentType')].filter(Boolean).join(' · ') });
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to save.'); }
    finally { setBusy(false); }
  }
  return <Frame title={item.title ? 'Edit job opening' : 'New job opening'} onCancel={onCancel}><form onSubmit={submit} onChange={onDirty}><Field label="Job title" name="title" value={item.title} /><Field label="Department" name="category" value={item.category} placeholder="Operations" hint="Type the department name. New departments create filter chips on the Careers page automatically." /><Field label="Location" name="location" value={item.location} placeholder="Malappuram, Kerala" /><Field label="Employment type" name="employmentType" value={item.employmentType} placeholder="Full-time" /><div className="field"><label>Job description</label><RichTextEditor name="content" defaultValue={item.content} onDirty={onDirty} /></div><StatusToggle value={item.status} />{error && <p className="form-error">{error}</p>}<Actions onCancel={onCancel} busy={busy} /></form></Frame>;
}

export function BlogEditor({ item, onCancel, onSave, onDirty }: EditorProps) {
  const [image, setImage] = useState(item.image || '');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState('');
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const file = d.get('image') as File;
    setBusy(true); setError(''); setProgress(file?.size ? 0 : null);
    try {
      const uploadedUrl = file?.size ? (await uploadFile(file, setProgress)).url : image;
      setProgress(null);
      await onSave({ ...item, title: String(d.get('title')), subheading: String(d.get('subheading')), content: String(d.get('content')), category: String(d.get('category')), readTime: String(d.get('readTime')), image: uploadedUrl, status: d.get('status') === 'Published' ? 'Published' : 'Draft', detail: `${d.get('category')} · ${d.get('readTime')}` });
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to upload image.'); }
    finally { setBusy(false); setProgress(null); }
  }
  return <Frame title={item.title ? 'Edit blog' : 'New blog'} onCancel={onCancel}><form onSubmit={submit} onChange={onDirty}><Field label="Headline" name="title" value={item.title} /><Field label="Subheading" name="subheading" value={item.subheading} textarea /><div className="field"><label>Article content</label><RichTextEditor name="content" defaultValue={item.content} onDirty={onDirty} /></div><Field label="Category" name="category" value={item.category} placeholder="Sustainable Farming" /><Field label="Read time" name="readTime" value={item.readTime} placeholder="6 min read" /><Upload label="Cover image" name="image" image={image} onImage={value => { setImage(value); onDirty(); }} disabled={busy} progress={progress} />{error && <p className="form-error">{error}</p>}<StatusToggle value={item.status} /><Actions onCancel={onCancel} busy={busy} savingLabel={progress !== null ? `Uploading ${progress}%…` : undefined} /></form></Frame>;
}

export function GalleryEditor({ item, onCancel, onSave, onDirty }: EditorProps) {
  const [image, setImage] = useState(item.image || '');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState('');
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const tags = String(d.get('category')).split(',').map(tag => tag.trim()).filter(Boolean).map(slugify);
    const category = tags[0] || 'general';
    const file = d.get('image') as File;
    setBusy(true); setError(''); setProgress(file?.size ? 0 : null);
    try {
      const uploadedUrl = file?.size ? (await uploadFile(file, setProgress)).url : image;
      setProgress(null);
      await onSave({ ...item, title: String(d.get('title')), category, tags, slug: category, image: uploadedUrl, createdAt: item.createdAt || new Date().toISOString(), detail: tags.join(', ') || 'General' });
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to upload image.'); }
    finally { setBusy(false); setProgress(null); }
  }
  return <Frame title={item.title ? 'Edit gallery image' : 'Add gallery image'} onCancel={onCancel}><form onSubmit={submit} onChange={onDirty}><Field label="Image title" name="title" value={item.title} /><Field label="Category tags" name="category" value={item.tags?.join(', ') || item.category} placeholder="Facilities, Livestock, Events" hint="Type one or more tags separated by commas. New tags create gallery categories automatically." /><Upload label="Gallery image" name="image" image={image} onImage={value => { setImage(value); onDirty(); }} required={!image} disabled={busy} progress={progress} />{error && <p className="form-error">{error}</p>}<Actions onCancel={onCancel} busy={busy} savingLabel={progress !== null ? `Uploading ${progress}%…` : undefined} /></form></Frame>;
}

export function TestimonialEditor({ item, onCancel, onSave, onDirty }: EditorProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    setBusy(true); setError('');
    try {
      await onSave({ ...item, title: String(d.get('title')), detail: String(d.get('detail')), quote: String(d.get('quote')), status: 'Published' });
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to save.'); }
    finally { setBusy(false); }
  }
  return <Frame title={item.title ? 'Edit testimonial' : 'Add testimonial'} onCancel={onCancel}><form onSubmit={submit} onChange={onDirty}><Field label="Person's name" name="title" value={item.title} /><Field label="Role / details" name="detail" value={item.detail} placeholder="Veterinary Consultant" /><Field label="Testimonial" name="quote" value={item.quote} textarea />{error && <p className="form-error">{error}</p>}<Actions onCancel={onCancel} busy={busy} /></form></Frame>;
}

export function DocumentEditor({ item, onCancel, onSave, onDirty }: EditorProps) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [issueDate, setIssueDate] = useState(item.issueDate || '');
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const file = d.get('document') as File;
    if (!item.url && !file?.size) return setError('Please choose a document.');
    if (file?.size > 5 * 1024 * 1024) return setError('Documents must be 5 MB or smaller.');
    setBusy(true); setError(''); setProgress(file?.size ? 0 : null);
    try {
      const uploaded = file?.size ? await uploadFile(file, setProgress) : null;
      setProgress(null);
      await onSave({ ...item, title: String(d.get('title')), category: String(d.get('category')) || 'General', issueDate, url: uploaded?.url || item.url, fileName: uploaded?.name || item.fileName, size: uploaded?.size || item.size, detail: uploaded ? `${uploaded.name} · ${(uploaded.size / 1024 / 1024).toFixed(1)} MB` : item.detail, createdAt: item.createdAt || new Date().toISOString() });
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to upload document.'); }
    finally { setBusy(false); setProgress(null); }
  }
  return <Frame title={item.title ? 'Edit document' : 'Upload document'} onCancel={onCancel}><form onSubmit={submit} onChange={onDirty}><Field label="Document title" name="title" value={item.title} /><Field label="Category" name="category" value={item.category} placeholder="Policies" /><div className="field"><label htmlFor="issueDate">Issue date</label><DatePicker id="issueDate" name="issueDate" value={issueDate} onChange={value => { setIssueDate(value); onDirty(); }} /></div><div className="field"><label htmlFor="document">Document file</label><input id="document" name="document" type="file" accept=".pdf,.doc,.docx" disabled={busy} /><small>PDF, DOC, or DOCX · maximum file size 5 MB.</small>{progress !== null && <ProgressBar percent={progress} />}</div>{error && <p className="form-error">{error}</p>}<Actions onCancel={onCancel} busy={busy} savingLabel={progress !== null ? `Uploading ${progress}%…` : undefined} /></form></Frame>;
}

export function Field({ label, name, value, placeholder, textarea, hint }: { label: string; name: string; value?: string; placeholder?: string; textarea?: boolean; hint?: string }) {
  return <div className="field"><label htmlFor={name}>{label}</label>{textarea ? <textarea id={name} name={name} defaultValue={value} rows={3} required /> : <input id={name} name={name} defaultValue={value} placeholder={placeholder} required />}{hint && <small>{hint}</small>}</div>;
}

export function Upload({ label, name, image, onImage, required, disabled, progress }: { label: string; name: string; image: string; onImage: (value: string) => void; required?: boolean; disabled?: boolean; progress?: number | null }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');

  function pick(file: File | undefined) {
    if (!file) return;
    setFileName(file.name);
    onImage(URL.createObjectURL(file));
  }
  function change(e: ChangeEvent<HTMLInputElement>) { pick(e.target.files?.[0]); }
  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault(); setDragOver(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (!file || !inputRef.current) return;
    const dt = new DataTransfer();
    dt.items.add(file);
    inputRef.current.files = dt.files;
    pick(file);
  }

  return <div className="field">
    <label htmlFor={name}>{label}</label>
    <div className="upload-row">
      {image && <img className="editor-preview" src={image} alt="Upload preview" />}
      <div className="upload-row-drop">
        <div
          className={`upload-dropzone upload-dropzone-compact${dragOver ? ' is-drag-over' : ''}${disabled ? ' is-disabled' : ''}`}
          onDragOver={e => { if (disabled) return; e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => { if (!disabled) inputRef.current?.click(); }}
          role="button"
          tabIndex={disabled ? -1 : 0}
        >
          <UploadCloud size={22} />
          <p>{fileName ? <b>{fileName}</b> : <><b>Drag a photo here</b> or <span className={`upload-browse-link${disabled ? ' is-disabled' : ''}`}>browse files</span></>}</p>
          <input ref={inputRef} id={name} name={name} type="file" accept="image/*" required={required} disabled={disabled} onChange={change} style={{ display: 'none' }} />
        </div>
        {progress != null && <ProgressBar percent={progress} />}
      </div>
    </div>
  </div>;
}

export function ProgressBar({ percent }: { percent: number }) {
  return <div className="upload-progress" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}><div className="upload-progress-fill" style={{ width: `${percent}%` }} /></div>;
}

export function StatusField({ value }: { value?: Status }) {
  const [status, setStatus] = useState(value || 'Draft');
  return <div className="field"><label htmlFor="status">Status</label><Select id="status" name="status" value={status} onChange={v => setStatus(v as Status)} options={[{ value: 'Draft', label: 'Draft' }, { value: 'Published', label: 'Published' }, { value: 'Active', label: 'Active' }, { value: 'Upcoming', label: 'Upcoming' }]} /></div>;
}

export function StatusToggle({ value }: { value?: Status }) {
  const [published, setPublished] = useState(value === 'Published');
  return <div className="field"><label>Status</label><label className="status-toggle"><input type="checkbox" name="status" value="Published" checked={published} onChange={e => setPublished(e.target.checked)} /><span className="status-toggle-track"><span className="status-toggle-thumb" /></span><span className="status-toggle-label">{published ? 'Published' : 'Draft'}</span></label></div>;
}

export function Actions({ onCancel, busy, savingLabel }: { onCancel: () => void; busy?: boolean; savingLabel?: string }) {
  return <div className="editor-actions"><button type="button" className="button light" onClick={onCancel} disabled={busy}>Cancel</button><button className="button dark" disabled={busy} aria-busy={busy}>{busy ? <span className="spinner" aria-hidden="true" /> : <Save size={16} />}{busy ? (savingLabel || 'Saving…') : 'Save changes'}</button></div>;
}

export function SettingsForm({ settings, onSubmit, onDirty, busy }: { settings: import('@/lib/cms').Settings; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onDirty: () => void; busy?: boolean }) {
  return <form className="card editor settings-form" onSubmit={onSubmit} onChange={onDirty}><Field label="Site name" name="siteName" value={settings.siteName} /><Field label="Email" name="email" value={settings.email} /><Field label="Phone" name="phone" value={settings.phone} /><Field label="Address" name="address" value={settings.address} textarea /><Field label="Hero banner image URL" name="heroImage" value={settings.heroImage} placeholder="https://…" hint="Paste a hosted image URL for the homepage hero banner." /><Field label="YouTube channel or latest-video URL" name="youtubeUrl" value={settings.youtubeUrl} placeholder="https://youtube.com/@grazevalley" /><Field label="Instagram profile URL" name="instagramUrl" value={settings.instagramUrl} placeholder="https://instagram.com/grazevalley" /><button className="button dark" disabled={busy} aria-busy={busy}>{busy ? <span className="spinner" aria-hidden="true" /> : <Save size={16} />}{busy ? 'Saving…' : 'Save settings'}</button></form>;
}

export function slugify(value: string) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }
