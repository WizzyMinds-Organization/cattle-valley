'use client';

import { FormEvent, useState } from 'react';
import { X } from 'lucide-react';
import { InvestorCategory, saveInvestorCategory } from '@/lib/cms';

function slugify(value: string) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }

export function InvestorCategoryModal({ categories, onClose, onChange }: { categories: InvestorCategory[]; onClose: () => void; onChange: (categories: InvestorCategory[]) => void }) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  async function rename(category: InvestorCategory, name: string) {
    if (!name.trim() || name === category.name) return;
    setBusyId(category.id); setError('');
    try {
      const saved = await saveInvestorCategory({ id: category.id, name: name.trim(), slug: category.slug }, false);
      onChange(categories.map(c => c.id === category.id ? saved : c));
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to rename category.'); }
    finally { setBusyId(null); }
  }

  async function addCategory(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const name = String(new FormData(form).get('name') || '').trim();
    if (!name) return;
    setAdding(true); setError('');
    try {
      const saved = await saveInvestorCategory({ name, slug: slugify(name) }, true);
      onChange([...categories, saved]);
      form.reset();
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to add category.'); }
    finally { setAdding(false); }
  }

  return <div className="confirm-overlay" onClick={onClose}>
    <div className="confirm-dialog card category-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Manage investor gallery categories">
      <div className="editor-heading"><h3>Manage categories</h3><button type="button" onClick={onClose} aria-label="Close"><X size={18} /></button></div>
      <p className="admin-helper">Rename an existing category, or add a new one. Categories can&apos;t be deleted here since that could orphan photos already tagged with them.</p>
      {error && <p className="form-error">{error}</p>}
      <div className="category-list">
        {categories.map(category => <input key={category.id} defaultValue={category.name} disabled={busyId === category.id} onBlur={e => rename(category, e.target.value)} onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }} />)}
        {categories.length === 0 && <p className="admin-helper">No categories yet. Add the first one below.</p>}
      </div>
      <form onSubmit={addCategory} className="category-add-form">
        <input name="name" placeholder="New category name" required disabled={adding} />
        <button className="button dark" type="submit" disabled={adding} aria-busy={adding}>{adding ? 'Adding…' : 'Add'}</button>
      </form>
    </div>
  </div>;
}
