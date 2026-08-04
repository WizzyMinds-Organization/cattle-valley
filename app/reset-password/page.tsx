'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        setError('This reset link is invalid or has expired. Request a new one.');
      }
      setReady(true);
    });
  }, []);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setStatus('saving');
    setError('');
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setStatus('error');
      setError(error.message);
      return;
    }
    router.push('/admin');
    router.refresh();
  }

  return (
    <main className="admin">
      <div className="shell" style={{ maxWidth: 420 }}>
        <div className="card editor">
          <div className="editor-heading">
            <h2 className="display">Set a new password</h2>
          </div>
          {!ready ? (
            <p className="admin-helper">Loading…</p>
          ) : (
            <form onSubmit={submit}>
              <div className="field">
                <label htmlFor="password">New password</label>
                <input id="password" type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
              <div className="field">
                <label htmlFor="confirm">Confirm password</label>
                <input id="confirm" type="password" required minLength={8} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" />
              </div>
              {error && <p className="form-error">{error}</p>}
              <button className="button dark" disabled={status === 'saving'}>
                <KeyRound size={16} />
                {status === 'saving' ? 'Saving…' : 'Save password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
