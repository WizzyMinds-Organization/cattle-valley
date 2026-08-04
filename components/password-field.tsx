'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export function PasswordField({ id, label, value, onChange, placeholder, minLength }: { id: string; label: string; value: string; onChange: (value: string) => void; placeholder?: string; minLength?: number }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="password-field">
        <input id={id} type={visible ? 'text' : 'password'} required minLength={minLength} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
        <button type="button" className="password-toggle" onClick={() => setVisible(v => !v)} aria-label={visible ? 'Hide password' : 'Show password'} aria-pressed={visible}>
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </div>
  );
}
