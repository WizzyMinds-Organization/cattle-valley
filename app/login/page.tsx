'use client';

import { FormEvent, Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

function LoginForm() {
  const params = useSearchParams();
  const notAuthorized = params.get('error') === 'not-authorized';
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    setError('');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(params.get('next') || '/admin')}` },
    });
    if (error) {
      setStatus('error');
      setError(error.message);
      return;
    }
    setStatus('sent');
  }

  return (
    <div className="card editor">
      <div className="editor-heading">
        <h2 className="display">Admin sign in</h2>
      </div>
      {notAuthorized && <p className="form-error">That account doesn&apos;t have admin access.</p>}
      {status === 'sent' ? (
        <p className="admin-helper">Check <b>{email}</b> for a sign-in link. It expires shortly, so use it soon after it arrives.</p>
      ) : (
        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          {error && <p className="form-error">{error}</p>}
          <button className="button dark" disabled={status === 'sending'}>
            <Mail size={16} />
            {status === 'sending' ? 'Sending…' : 'Send magic link'}
          </button>
        </form>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="admin">
      <div className="shell" style={{ maxWidth: 420 }}>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
