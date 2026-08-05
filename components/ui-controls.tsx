'use client';

import { useEffect, useRef, useState } from 'react';
import { Calendar, Check, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatAuctionDate } from '@/lib/cms';

function useCloseOnOutside(open: boolean, ref: React.RefObject<HTMLElement | null>, close: () => void) {
  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) close(); }
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') close(); }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open, ref, close]);
}

export type SelectOption = { value: string; label: string; disabled?: boolean };

export function Select({ id, name, value, onChange, options, placeholder = 'Select…', required, disabled, ariaLabel, className }: {
  id?: string; name?: string; value: string; onChange: (value: string) => void; options: SelectOption[];
  placeholder?: string; required?: boolean; disabled?: boolean; ariaLabel?: string; className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useCloseOnOutside(open, ref, () => setOpen(false));
  const selected = options.find(o => o.value === value);

  return <div className={`ui-select${className ? ` ${className}` : ''}`} ref={ref}>
    {name && <input type="hidden" name={name} value={value} />}
    <button type="button" id={id} className="ui-select-trigger" aria-haspopup="listbox" aria-expanded={open} aria-label={ariaLabel}
      data-placeholder={!selected} disabled={disabled} onClick={() => setOpen(o => !o)}>
      <span>{selected ? selected.label : placeholder}</span>
      <ChevronDown size={16} className={`ui-select-chevron${open ? ' is-open' : ''}`} />
    </button>
    {open && <ul className="ui-select-menu" role="listbox">
      {options.map(o => <li key={o.value} role="option" aria-selected={o.value === value}
        className={`ui-select-option${o.value === value ? ' is-selected' : ''}${o.disabled ? ' is-disabled' : ''}`}
        onClick={() => { if (o.disabled) return; onChange(o.value); setOpen(false); }}>
        <span>{o.label}</span>{o.value === value && <Check size={15} />}
      </li>)}
      {options.length === 0 && <li className="ui-select-empty">No options available</li>}
    </ul>}
  </div>;
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function toISO(y: number, m: number, d: number) { return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`; }

export function DatePicker({ id, name, value, onChange, placeholder = 'Select date', className }: {
  id?: string; name?: string; value: string; onChange: (value: string) => void; placeholder?: string; className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useCloseOnOutside(open, ref, () => setOpen(false));

  const base = value && !Number.isNaN(new Date(`${value}T00:00:00`).getTime()) ? new Date(`${value}T00:00:00`) : new Date();
  const [viewYear, setViewYear] = useState(base.getFullYear());
  const [viewMonth, setViewMonth] = useState(base.getMonth());

  function openPicker() {
    const b = value && !Number.isNaN(new Date(`${value}T00:00:00`).getTime()) ? new Date(`${value}T00:00:00`) : new Date();
    setViewYear(b.getFullYear());
    setViewMonth(b.getMonth());
    setOpen(o => !o);
  }

  function prevMonth() { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); }
  function nextMonth() { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); }

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const today = new Date();
  const todayISO = toISO(today.getFullYear(), today.getMonth(), today.getDate());
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return <div className={`ui-select ui-date${className ? ` ${className}` : ''}`} ref={ref}>
    {name && <input type="hidden" name={name} value={value} />}
    <button type="button" id={id} className="ui-select-trigger" aria-haspopup="dialog" aria-expanded={open} data-placeholder={!value} onClick={openPicker}>
      <span>{value ? formatAuctionDate(value) : placeholder}</span>
      <Calendar size={16} />
    </button>
    {open && <div className="ui-date-menu" role="dialog" aria-label="Choose date">
      <div className="ui-date-header">
        <button type="button" className="ui-date-nav" onClick={prevMonth} aria-label="Previous month"><ChevronLeft size={16} /></button>
        <span>{new Date(viewYear, viewMonth).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
        <button type="button" className="ui-date-nav" onClick={nextMonth} aria-label="Next month"><ChevronRight size={16} /></button>
      </div>
      <div className="ui-date-grid">
        {WEEKDAYS.map((w, i) => <span className="ui-date-weekday" key={i}>{w}</span>)}
        {cells.map((day, i) => day === null ? <span key={i} /> : <DateCell key={i} iso={toISO(viewYear, viewMonth, day)} day={day} selected={toISO(viewYear, viewMonth, day) === value} today={toISO(viewYear, viewMonth, day) === todayISO} onPick={onChange} onClose={() => setOpen(false)} />)}
      </div>
    </div>}
  </div>;
}

function DateCell({ iso, day, selected, today, onPick, onClose }: { iso: string; day: number; selected: boolean; today: boolean; onPick: (iso: string) => void; onClose: () => void }) {
  return <button type="button" className={`ui-date-day${selected ? ' is-selected' : ''}${today ? ' is-today' : ''}`} onClick={() => { onPick(iso); onClose(); }}>{day}</button>;
}
