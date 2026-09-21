'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Briefcase, Mail, MapPin } from 'lucide-react';
import { Footer, Header } from '@/components/site-chrome';
import { Item, fetchJobs } from '@/lib/cms';

const APPLY_EMAIL = 'info.cattlevalley@gmail.com';

function applyMailto(jobTitle: string) {
  const subject = `Application: ${jobTitle}`;
  const body = `Hi Cattle Valley team,\n\nI would like to apply for the ${jobTitle} role.\n\nName:\nPhone:\nEmail:\nNote:\n\n(Please attach your resume before sending.)`;
  return `mailto:${APPLY_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

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
      <div className="shell">
        {job?.content && <div className="article-body" dangerouslySetInnerHTML={{ __html: job.content }} />}
        {job && <div className="card apply-card">
          <h3>Apply for this role</h3>
          <p>Click below to open your email app with the subject filled in. Attach your resume, fill in your details, and send.</p>
          <a className="button dark" href={applyMailto(job.title)}><Mail size={16} /> Apply via email</a>
          <p className="apply-email">Button not working? Email your CV directly to <a href={`mailto:${APPLY_EMAIL}`}>{APPLY_EMAIL}</a></p>
        </div>}
        <Link href="/careers" className="button light" style={{ marginTop: 32 }}>← Back to careers</Link>
      </div>
    </article>
    <Footer />
  </>;
}
