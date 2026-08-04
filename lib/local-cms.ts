export type HubContent = {
  id: string;
  title: string;
  location: string;
  description: string;
  auctionDate: string;
  whatsapp: string;
  status: 'Active' | 'Upcoming' | 'Draft';
  image: string;
};

export const localCmsStorageKey = 'graze-valley-local-cms';

export const defaultHubs: HubContent[] = [
  { id: 'hub-1', title: 'Malappuram Hub', location: 'Malappuram, Kerala', description: 'A science-forward breeding and animal wellness facility.', auctionDate: '18 August 2026', whatsapp: '919876543210', status: 'Active', image: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=1000&q=80' },
  { id: 'hub-2', title: 'Wayanad Hub', location: 'Wayanad, Kerala', description: 'Highland grazing, data-led nutrition, and superior care.', auctionDate: '02 September 2026', whatsapp: '919876543210', status: 'Active', image: 'https://images.unsplash.com/photo-1523742810063-7de5c3c16809?auto=format&fit=crop&w=1000&q=80' },
  { id: 'hub-3', title: 'Palakkad Hub', location: 'Palakkad, Kerala', description: 'Purpose-built spaces for healthy growth and responsible trade.', auctionDate: '15 September 2026', whatsapp: '919876543210', status: 'Upcoming', image: 'https://images.unsplash.com/photo-1535435706-3f1b16e64a8a?auto=format&fit=crop&w=1000&q=80' },
];

export function normaliseHub(hub: Partial<HubContent> & { id: string; title?: string; status?: HubContent['status'] }): HubContent {
  const fallback = defaultHubs.find(item => item.id === hub.id) || defaultHubs[0];
  return { ...fallback, ...hub, title: hub.title || fallback.title, location: hub.location || fallback.location, description: hub.description || fallback.description, auctionDate: hub.auctionDate || fallback.auctionDate, whatsapp: hub.whatsapp || fallback.whatsapp, image: hub.image || fallback.image, status: hub.status || fallback.status };
}
