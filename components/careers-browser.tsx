'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Briefcase, MapPin } from 'lucide-react';
import { Item, fetchJobs } from '@/lib/cms';

export function CareersBrowser() {
  const [jobs, setJobs] = useState<Item[]>([]);
  const [active, setActive] = useState('all');
  const [ready, setReady] = useState(false);

  useEffect(() => { fetchJobs().then(data => { setJobs(data.filter(job => job.status !== 'Draft')); setReady(true); }).catch(() => setReady(true)); }, []);

  const departments = useMemo(() => ['all', ...Array.from(new Set(jobs.map(job => job.category).filter((d): d is string => !!d)))], [jobs]);
  const visible = active === 'all' ? jobs : jobs.filter(job => job.category === active);

  if (!ready) return <p className="admin-helper">Loading openings…</p>;

  return <>
    {departments.length > 1 && <div className="gallery-filters" aria-label="Filter by department">{departments.map(d => <button key={d} className={active === d ? 'is-active' : ''} onClick={() => setActive(d)}>{d === 'all' ? 'All departments' : d}</button>)}</div>}
    <div className="careers-list">
      {visible.map(job => <Link href={`/careers/${job.id}`} className="card careers-row" key={job.id}>
        <div><h3>{job.title}</h3><p className="hub-meta">{job.category}</p></div>
        <div className="careers-meta">{job.location && <span><MapPin size={14} /> {job.location}</span>}{job.employmentType && <span><Briefcase size={14} /> {job.employmentType}</span>}</div>
      </Link>)}
      {visible.length === 0 && <p className="gallery-empty">No open roles right now. Check back soon.</p>}
    </div>
  </>;
}
