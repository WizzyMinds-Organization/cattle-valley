'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    setError('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent('/reset-password')}`,
    });
    if (error) {
      setStatus('error');
      setError(error.message);
      return;
    }
    setStatus('sent');
  }

  return (
    <main className="admin">
      <div className="shell" style={{ maxWidth: 420 }}>
        <div className="card editor">
          <div className="editor-heading">
            <h2 className="display">Reset password</h2>
          </div>
          {status === 'sent' ? (
            <p className="admin-helper">Check <b>{email}</b> for a link to set a new password.</p>
          ) : (
            <form onSubmit={submit}>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              {error && <p className="form-error">{error}</p>}
              <button className="button dark" disabled={status === 'sending'}>
                <Mail size={16} />
                {status === 'sending' ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
          )}
          <p className="admin-helper" style={{ marginTop: 16, marginBottom: 0 }}>
            <Link href="/login" className="text-link">Back to sign in</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
