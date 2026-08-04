'use client';

import { FormEvent, Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogIn } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { PasswordField } from '@/components/password-field';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const notAuthorized = params.get('error') === 'not-authorized';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle');
  const [error, setError] = useState('');

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setStatus('error');
      setError(error.message);
      return;
    }
    router.push(params.get('next') || '/admin');
    router.refresh();
  }

  return (
    <div className="card editor">
      <div className="editor-heading">
        <h2 className="display">Admin sign in</h2>
      </div>
      {notAuthorized && <p className="form-error">That account doesn&apos;t have admin access.</p>}
      <form onSubmit={submit}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <PasswordField id="password" label="Password" value={password} onChange={setPassword} placeholder="••••••••" />
        {error && <p className="form-error">{error}</p>}
        <button className="button dark" disabled={status === 'sending'}>
          <LogIn size={16} />
          {status === 'sending' ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="admin-helper" style={{ marginTop: 16, marginBottom: 0 }}>
        <Link href="/forgot-password" className="text-link">Forgot your password?</Link>
      </p>
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
