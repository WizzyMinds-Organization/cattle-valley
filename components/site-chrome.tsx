'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, Instagram, Linkedin, MapPin } from 'lucide-react';
import { MobileMenu } from './mobile-menu';
export function Header(){
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return <header className={`nav${scrolled ? ' is-scrolled' : ''}`}><div className="shell nav-row"><Link href="/" className="brand" aria-label="Cattle Valley home"><img src="/images/cattle-valley-logo-dark-bg.svg" alt="Cattle Valley logo"/>CATTLE VALLEY</Link><nav className="nav-links" aria-label="Main navigation"><Link href="/about">About</Link><Link href="/#hubs">Our Hubs</Link><Link href="/gallery">Gallery</Link><Link href="/blog">Insights</Link><Link href="/careers">Careers</Link><Link href="/contact">Contact</Link></nav><Link href="/#hubs" className="button ghost nav-action">Explore hubs <ArrowRight size={15}/></Link><MobileMenu/></div></header>}
export function Footer(){return <footer className="footer"><div className="shell footer-grid"><div><div className="brand"><img src="/images/cattle-valley-logo-dark-bg.svg" alt=""/>CATTLE VALLEY</div><p>A technology-led livestock enterprise cultivating healthier animals, stronger farms, and a more sustainable tomorrow.</p></div><div><h4>Explore</h4><div className="footer-links"><Link href="/about">Our story</Link><Link href="/hubs">Livestock hubs</Link><Link href="/gallery">Gallery</Link><Link href="/blog">Journal</Link><Link href="/careers">Careers</Link><Link href="/investor-gallery">Investor Gallery</Link></div></div><div><h4>Contact</h4><p><MapPin size={14}/> Ram Residency Building, Triprayar P.O., Thrissur, Kerala 680567<br/>+91 99465 25259<br/>info.cattlevalley@gmail.com</p></div><div><h4>Follow the journey</h4><p>Practical knowledge and on-ground progress from a new generation of livestock farming.</p><div style={{display:'flex',gap:12}}><Instagram size={18}/><Linkedin size={18}/></div></div></div><div className="shell copyright">© {new Date().getFullYear()} Cattle Valley · Promoted by Cattle-Valley Limited · <Link href="/privacy">Privacy</Link> · <Link href="/terms">Terms</Link></div></footer>}
export function PageHero({eyebrow,title,copy}:{eyebrow:string,title:string,copy:string}){return <><Header/><section className="page-hero"><div className="shell"><span className="eyebrow">{eyebrow}</span><h1 className="display">{title}</h1><p>{copy}</p></div></section></>}
