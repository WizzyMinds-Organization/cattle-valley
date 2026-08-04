'use client';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
const links=[['About','/about'],['Our Hubs','/#hubs'],['Gallery','/gallery'],['Insights','/blog'],['Contact','/contact']];
export function MobileMenu(){const[open,setOpen]=useState(false);return <div className="mobile-menu"><button className="menu-toggle" onClick={()=>setOpen(value=>!value)} aria-label={open?'Close navigation':'Open navigation'} aria-expanded={open}>{open?<X/>:<Menu/>}</button>{open&&<div className="mobile-drawer">{links.map(([label,href])=><Link href={href} onClick={()=>setOpen(false)} key={label}>{label}</Link>)}</div>}</div>}
