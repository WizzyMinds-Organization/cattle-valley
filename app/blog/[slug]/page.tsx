'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Footer, Header } from '@/components/site-chrome';
import { Item, fetchBlogPosts } from '@/lib/cms';

export default function Article({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: id } = use(params);
  const [post, setPost] = useState<Item | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchBlogPosts().then(posts => { if (cancelled) return; setPost(posts.find(p => p.id === id && p.status !== 'Draft') || null); setReady(true); }).catch(() => setReady(true));
    return () => { cancelled = true; };
  }, [id]);

  if (ready && !post) return <><Header /><section className="page-hero"><div className="shell"><span className="eyebrow">Not found</span><h1 className="display">This article isn&apos;t available.</h1><p>It may have been unpublished or the link is out of date.</p></div></section><div className="content shell"><Link href="/blog" className="button light">← Back to journal</Link></div><Footer /></>;

  return <>
    <Header />
    <section className="page-hero">
      <div className="shell">
        <span className="eyebrow">{post ? `${post.category || 'Journal'} · ${post.readTime || ''}` : 'Loading…'}</span>
        <h1 className="display">{post?.title || ''}</h1>
        {post?.subheading && <p>{post.subheading}</p>}
      </div>
    </section>
    <article className="content">
      <div className="shell" style={{ maxWidth: 820 }}>
        {post?.image && <img src={post.image} alt="" style={{ width: '100%', borderRadius: 22, marginBottom: 32 }} />}
        {post?.content && <div className="article-body" dangerouslySetInnerHTML={{ __html: post.content }} />}
        <Link href="/blog" className="button light" style={{ marginTop: 32 }}>← Back to journal</Link>
      </div>
    </article>
    <Footer />
  </>;
}
