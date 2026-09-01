'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Briefcase, FileText, FolderOpen, ImageIcon, LayoutDashboard, LogOut, MapPin, Menu, MessageSquareQuote, Settings as SettingsIcon, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

const nav = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Blogs', href: '/admin/blogs', icon: FileText },
  { label: 'Hubs & auctions', href: '/admin/hubs', icon: MapPin },
  { label: 'Gallery', href: '/admin/gallery', icon: ImageIcon },
  { label: 'Investor gallery', href: '/admin/investor-gallery', icon: TrendingUp },
  { label: 'Testimonials', href: '/admin/testimonials', icon: MessageSquareQuote },
  { label: 'Documents', href: '/admin/documents', icon: FolderOpen },
  { label: 'Careers', href: '/admin/careers', icon: Briefcase },
  { label: 'Site settings', href: '/admin/settings', icon: SettingsIcon },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [signingOut, setSigningOut] = useState(false);

  // Local read (no network) — middleware already verified the session
  // before this component could render.
  useEffect(() => { supabase.auth.getSession().then(({ data }) => setUserEmail(data.session?.user?.email || '')); }, []);
  useEffect(() => { document.body.style.overflow = sidebarOpen ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [sidebarOpen]);

  async function signOut() { setSigningOut(true); await supabase.auth.signOut(); router.push('/login'); router.refresh(); }
  function isActive(href: string) { return href === '/admin' ? pathname === '/admin' : pathname.startsWith(href); }
  const activeItem = nav.find(item => isActive(item.href));

  return (
    <div className="admin"><div className="admin-shell">
      <aside className={`admin-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
        <div className="admin-brand"><span className="eyebrow">Cattle Valley</span><b className="display">Content<br/>Studio</b></div>
        <nav aria-label="Admin navigation">{nav.map(({ label, href, icon: Icon }) => <Link prefetch={false} className={`admin-nav-item ${isActive(href) ? 'is-active' : ''}`} href={href} key={label} onClick={() => setSidebarOpen(false)}><Icon size={16} />{label}</Link>)}</nav>
        <div className="admin-sidebar-foot">{userEmail && <p className="admin-user">{userEmail}</p>}<button className="admin-reset" onClick={signOut} disabled={signingOut}><LogOut size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />{signingOut ? 'Signing out…' : 'Sign out'}</button></div>
      </aside>
      {sidebarOpen && <button className="admin-overlay" aria-label="Close menu" onClick={() => setSidebarOpen(false)} />}
      <div className="admin-main">
        <header className="admin-topbar"><button className="admin-hamburger" aria-label="Open menu" onClick={() => setSidebarOpen(true)}><Menu size={19} /></button><span className="admin-topbar-title">{activeItem?.label || 'Admin'}</span></header>
        <section className="admin-content">{children}</section>
      </div>
    </div></div>
  );
}
