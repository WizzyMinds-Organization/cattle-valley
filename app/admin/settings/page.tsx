'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Settings, fetchSettings, saveSettings as persistSettings } from '@/lib/cms';
import { SettingsForm } from '@/components/admin-editors';

const emptySettings: Settings = { siteName: '', email: '', phone: '', address: '', heroImage: '', youtubeUrl: '', instagramUrl: '' };

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(emptySettings);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => { fetchSettings().then(data => { setSettings(data); setReady(true); }).catch(() => setReady(true)); }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const next: Settings = { siteName: String(data.get('siteName')), email: String(data.get('email')), phone: String(data.get('phone')), address: String(data.get('address')), heroImage: String(data.get('heroImage')), youtubeUrl: String(data.get('youtubeUrl')), instagramUrl: String(data.get('instagramUrl')) };
    try { const saved = await persistSettings(next); setSettings(saved); setNotice('Site settings saved.'); }
    catch (err) { setNotice(err instanceof Error ? err.message : 'Failed to save settings.'); }
  }

  return <>
    <div className="admin-top"><div><h1 className="display">Site settings</h1></div></div>
    {notice && <div className="admin-notice">{notice}</div>}
    {!ready && <p className="admin-helper">Loading…</p>}
    {ready && <SettingsForm settings={settings} onSubmit={submit} onDirty={() => {}} />}
  </>;
}
