'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, MapPin, MessageCircle, Phone } from 'lucide-react';
import { Item, fetchHubs, formatAuctionDate } from '@/lib/cms';

function normaliseNumber(value: string) { return value.replace(/[^0-9]/g, ''); }
function hasUpcomingAuction(value?: string) { if (!value) return false; const date = new Date(`${value}T00:00:00`); return !Number.isNaN(date.getTime()) && date.getTime() >= new Date(new Date().toDateString()).getTime(); }

export function HubList() {
  const [hubs, setHubs] = useState<Item[]>([]);
  useEffect(() => { fetchHubs().then(setHubs).catch(() => {}); }, []);
  return <div className="shell hub-grid">{hubs.map(hub => { const upcoming = hasUpcomingAuction(hub.auctionDate); return <article className="card hub" key={hub.id}><img className="hub-image" src={hub.image} alt={`${hub.title} livestock facility`} loading="lazy"/><div className="hub-content"><span className="hub-meta">{upcoming ? 'Opening soon' : 'Open for visits'}</span><h3>{hub.title}</h3><p className="hub-location"><MapPin size={14}/> {hub.location}{hub.mapsUrl && <a href={hub.mapsUrl} target="_blank" rel="noreferrer" className="hub-maps-link">View location</a>}</p><p>{hub.description}</p><div className="auction-date"><CalendarDays size={15}/><span><b>{upcoming ? 'Upcoming auction' : 'Auction status'}</b>{upcoming ? formatAuctionDate(hub.auctionDate) : 'No auctions currently listed'}</span></div><div className="hub-actions">{hub.contactNumber && <p className="hub-contact"><Phone size={14}/> {hub.contactNumber}</p>}<a className="button dark hub-whatsapp" href={`https://wa.me/${normaliseNumber(hub.whatsapp || '')}?text=${encodeURIComponent(`Hello Cattle Valley, I would like to enquire about ${hub.title}${upcoming ? ` and its auction on ${formatAuctionDate(hub.auctionDate)}` : ''}.`)}`} target="_blank" rel="noreferrer"><MessageCircle size={16}/> Enquire on WhatsApp</a></div></div></article>; })}{hubs.length === 0 && <p className="gallery-empty">No hubs published yet.</p>}</div>;
}
