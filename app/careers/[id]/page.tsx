'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Briefcase, MapPin } from 'lucide-react';
import { Footer, Header } from '@/components/site-chrome';
import { Item, fetchJobs } from '@/lib/cms';

export default function JobDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [job, setJob] = useState<Item | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchJobs().then(jobs => { if (cancelled) return; setJob(jobs.find(j => j.id === id && j.status !== 'Draft') || null); setReady(true); }).catch(() => setReady(true));
    return () => { cancelled = true; };
  }, [id]);

  if (ready && !job) return <><Header /><section className="page-hero"><div className="shell"><span className="eyebrow">Not found</span><h1 className="display">This role isn&apos;t open anymore.</h1></div></section><div className="content shell"><Link href="/careers" className="button light">← Back to careers</Link></div><Footer /></>;

  return <>
    <Header />
    <section className="page-hero">
      <div className="shell">
        <span className="eyebrow">{job?.category || 'Loading…'}</span>
        <h1 className="display">{job?.title || ''}</h1>
        <p style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>{job?.location && <span><MapPin size={14} /> {job.location}</span>}{job?.employmentType && <span><Briefcase size={14} /> {job.employmentType}</span>}</p>
      </div>
    </section>
    <article className="content">
      <div className="shell" style={{ maxWidth: 820 }}>
        {job?.content && <div className="article-body" dangerouslySetInnerHTML={{ __html: job.content }} />}
        <Link href="/careers" className="button light" style={{ marginTop: 32 }}>← Back to careers</Link>
      </div>
    </article>
    <Footer />
  </>;
}
