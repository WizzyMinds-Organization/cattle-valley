'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, MapPin, MessageCircle } from 'lucide-react';
import { Item, fetchHubs, formatAuctionDate } from '@/lib/cms';

function normaliseNumber(value: string) { return value.replace(/[^0-9]/g, ''); }
function hasUpcomingAuction(value?: string) { if (!value) return false; const date = new Date(`${value}T00:00:00`); return !Number.isNaN(date.getTime()) && date.getTime() >= new Date(new Date().toDateString()).getTime(); }

export function HubList() {
  const [hubs, setHubs] = useState<Item[]>([]);
  useEffect(() => { fetchHubs().then(data => setHubs(data.filter(hub => hub.status !== 'Draft'))).catch(() => {}); }, []);
  return <div className="shell hub-grid">{hubs.map(hub => { const upcoming = hasUpcomingAuction(hub.auctionDate); return <article className="card hub" key={hub.id}><img className="hub-image" src={hub.image} alt={`${hub.title} livestock facility`}/><div className="hub-content"><span className="hub-meta">{hub.status === 'Upcoming' ? 'Opening soon' : 'Open for visits'}</span><h3>{hub.title}</h3><p><MapPin size={14}/> {hub.location}</p><p>{hub.description}</p><div className="auction-date"><CalendarDays size={15}/><span><b>{upcoming ? 'Upcoming auction' : 'Auction status'}</b>{upcoming ? formatAuctionDate(hub.auctionDate) : 'No auctions currently listed'}</span></div><a className="button dark hub-whatsapp" href={`https://wa.me/${normaliseNumber(hub.whatsapp || '')}?text=${encodeURIComponent(`Hello Graze Valley, I would like to enquire about ${hub.title}${upcoming ? ` and its auction on ${formatAuctionDate(hub.auctionDate)}` : ''}.`)}`} target="_blank" rel="noreferrer"><MessageCircle size={16}/> Enquire on WhatsApp</a></div></article>; })}{hubs.length === 0 && <p className="gallery-empty">No hubs published yet.</p>}</div>;
}
