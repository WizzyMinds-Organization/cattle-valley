import { supabase } from '@/lib/supabase/client';

export type Status = 'Published' | 'Draft' | 'Active' | 'Upcoming';

export type Item = {
  id: string;
  title: string;
  detail: string;
  status?: Status;
  location?: string;
  description?: string;
  auctionDate?: string;
  whatsapp?: string;
  contactNumber?: string;
  mapsUrl?: string;
  image?: string;
  category?: string;
  tags?: string[];
  slug?: string;
  createdAt?: string;
  subheading?: string;
  readTime?: string;
  content?: string;
  quote?: string;
  url?: string;
  size?: number;
  fileName?: string;
  issueDate?: string;
  employmentType?: string;
};

export type Settings = {
  siteName: string;
  email: string;
  phone: string;
  address: string;
  heroImage?: string;
  youtubeUrl?: string;
  instagramUrl?: string;
};

export function formatAuctionDate(iso?: string): string {
  if (!iso) return '';
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }).format(date);
}

// --- Row <-> Item mapping -----------------------------------------------
// Database columns are snake_case; the UI (admin editors, public pages)
// works with the camelCase Item shape below. These converters are pure
// functions so they're safe to import from both server (API routes) and
// client (browser) code.

type HubRow = { id: string; title: string; location: string; description: string; auction_date: string | null; whatsapp: string | null; contact_number: string | null; maps_url: string | null; image_url: string | null };
export function hubRowToItem(row: HubRow): Item {
  const auctionDate = row.auction_date || '';
  return { id: row.id, title: row.title, location: row.location, description: row.description, auctionDate, whatsapp: row.whatsapp || '', contactNumber: row.contact_number || '', mapsUrl: row.maps_url || '', image: row.image_url || '', detail: `${row.location} · Auction: ${formatAuctionDate(auctionDate)}` };
}
export function hubItemToPayload(item: Partial<Item>) {
  return { title: item.title, location: item.location, description: item.description, auction_date: item.auctionDate || null, whatsapp: item.whatsapp, contact_number: item.contactNumber || null, maps_url: item.mapsUrl || null, image_url: item.image };
}

type BlogRow = { id: string; title: string; subheading: string | null; content: string | null; category: string | null; read_time: string | null; image_url: string | null; status: string; created_at: string };
export function blogRowToItem(row: BlogRow): Item {
  return { id: row.id, title: row.title, subheading: row.subheading || '', content: row.content || '', category: row.category || '', readTime: row.read_time || '', image: row.image_url || '', status: row.status as Status, createdAt: row.created_at, detail: `${row.category || ''} · ${row.read_time || ''}` };
}
export function blogItemToPayload(item: Partial<Item>) {
  return { title: item.title, subheading: item.subheading, content: item.content, category: item.category, read_time: item.readTime, image_url: item.image, status: item.status };
}

type GalleryRow = { id: string; title: string; category: string | null; tags: string[] | null; slug: string | null; image_url: string | null; created_at: string };
export function galleryRowToItem(row: GalleryRow): Item {
  const tags = row.tags || [];
  return { id: row.id, title: row.title, category: row.category || '', tags, slug: row.slug || '', image: row.image_url || '', createdAt: row.created_at, detail: tags.join(', ') || 'General' };
}
export function galleryItemToPayload(item: Partial<Item>) {
  return { title: item.title, category: item.category, tags: item.tags || [], slug: item.slug, image_url: item.image };
}

type TestimonialRow = { id: string; name: string; role: string | null; quote: string | null; status: string };
export function testimonialRowToItem(row: TestimonialRow): Item {
  return { id: row.id, title: row.name, detail: row.role || '', quote: row.quote || '', status: row.status as Status };
}
export function testimonialItemToPayload(item: Partial<Item>) {
  return { name: item.title, role: item.detail, quote: item.quote, status: item.status || 'Published' };
}

type DocumentRow = { id: string; title: string; category: string | null; file_name: string | null; file_url: string | null; file_size: number | null; issue_date: string | null; created_at: string };
export function documentRowToItem(row: DocumentRow): Item {
  const size = row.file_name ? `${row.file_name}${row.file_size ? ` · ${(row.file_size / 1024 / 1024).toFixed(1)} MB` : ''}` : row.category || '';
  const detail = row.issue_date ? `${size} · Issued ${formatAuctionDate(row.issue_date)}` : size;
  return { id: row.id, title: row.title, category: row.category || '', url: row.file_url || '', size: row.file_size || undefined, fileName: row.file_name || undefined, issueDate: row.issue_date || '', createdAt: row.created_at, detail };
}
export function documentItemToPayload(item: Partial<Item> & { fileName?: string }) {
  return { title: item.title, category: item.category, file_name: item.fileName, file_url: item.url, file_size: item.size, issue_date: item.issueDate || null };
}

type JobRow = { id: string; title: string; department: string | null; location: string | null; employment_type: string | null; description: string | null; status: string; created_at: string };
export function jobRowToItem(row: JobRow): Item {
  return { id: row.id, title: row.title, category: row.department || '', location: row.location || '', employmentType: row.employment_type || '', content: row.description || '', status: row.status as Status, createdAt: row.created_at, detail: [row.department, row.location, row.employment_type].filter(Boolean).join(' · ') };
}
export function jobItemToPayload(item: Partial<Item>) {
  return { title: item.title, department: item.category, location: item.location, employment_type: item.employmentType, description: item.content, status: item.status };
}

type SettingsRow = { site_name: string; email: string | null; phone: string | null; address: string | null; hero_image_url: string | null; youtube_url: string | null; instagram_url: string | null };
export function settingsRowToItem(row: SettingsRow): Settings {
  return { siteName: row.site_name, email: row.email || '', phone: row.phone || '', address: row.address || '', heroImage: row.hero_image_url || '', youtubeUrl: row.youtube_url || '', instagramUrl: row.instagram_url || '' };
}
export function settingsItemToPayload(settings: Settings) {
  return { site_name: settings.siteName, email: settings.email, phone: settings.phone, address: settings.address, hero_image_url: settings.heroImage, youtube_url: settings.youtubeUrl, instagram_url: settings.instagramUrl };
}

// --- Reads (public, via the anon key — RLS allows SELECT to everyone) ---

export async function fetchHubs(): Promise<Item[]> {
  const { data, error } = await supabase.from('hubs').select('*').order('auction_date', { ascending: true });
  if (error) throw error;
  return (data as HubRow[]).map(hubRowToItem);
}
export async function fetchBlogPosts(): Promise<Item[]> {
  const { data, error } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data as BlogRow[]).map(blogRowToItem);
}
export async function fetchGalleryImages(): Promise<Item[]> {
  const { data, error } = await supabase.from('gallery_images').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data as GalleryRow[]).map(galleryRowToItem);
}
export async function fetchTestimonials(): Promise<Item[]> {
  const { data, error } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data as TestimonialRow[]).map(testimonialRowToItem);
}
export async function fetchDocuments(): Promise<Item[]> {
  const { data, error } = await supabase.from('documents').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data as DocumentRow[]).map(documentRowToItem);
}
export async function fetchJobs(): Promise<Item[]> {
  const { data, error } = await supabase.from('job_openings').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data as JobRow[]).map(jobRowToItem);
}
export async function fetchSettings(): Promise<Settings> {
  const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).single();
  if (error) throw error;
  return settingsRowToItem(data as SettingsRow);
}

// --- Writes (admin panel only — go through server API routes that use
// the service_role key, since there's no admin auth gate yet) -----------

const resourcePath: Record<'Blogs' | 'Hubs & auctions' | 'Gallery' | 'Testimonials' | 'Documents' | 'Careers', string> = {
  'Hubs & auctions': 'hubs',
  Blogs: 'blog-posts',
  Gallery: 'gallery-images',
  Testimonials: 'testimonials',
  Documents: 'documents',
  Careers: 'jobs',
};

async function parseOrThrow(res: Response) {
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || `Request failed (${res.status})`);
  return res.json();
}

export async function saveItem(module: keyof typeof resourcePath, item: Item, isNew: boolean): Promise<Item> {
  const path = `/api/${resourcePath[module]}${isNew ? '' : `/${item.id}`}`;
  const res = await fetch(path, { method: isNew ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) });
  return parseOrThrow(res);
}
export async function deleteItem(module: keyof typeof resourcePath, id: string): Promise<void> {
  const res = await fetch(`/api/${resourcePath[module]}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || `Request failed (${res.status})`);
}
export async function saveSettings(settings: Settings): Promise<Settings> {
  const res = await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) });
  return parseOrThrow(res);
}
export function uploadFile(file: File, onProgress?: (percent: number) => void): Promise<{ url: string; name: string; size: number }> {
  const body = new FormData();
  body.append('file', file);
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload');
    if (onProgress) xhr.upload.onprogress = e => { if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100)); };
    xhr.onload = () => {
      let data: unknown;
      try { data = JSON.parse(xhr.responseText); } catch { data = {}; }
      if (xhr.status >= 200 && xhr.status < 300) resolve(data as { url: string; name: string; size: number });
      else reject(new Error((data as { error?: string })?.error || `Request failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error('Network error while uploading.'));
    xhr.send(body);
  });
}

// --- Investor gallery (separate from the public gallery — see plan) -----

export type InvestorCategory = { id: string; name: string; slug: string };
export type InvestorImage = { id: string; title: string; category: string; takenOn: string; image: string; createdAt?: string };

type InvestorCategoryRow = { id: string; name: string; slug: string };
function investorCategoryRowToItem(row: InvestorCategoryRow): InvestorCategory { return { id: row.id, name: row.name, slug: row.slug }; }
function investorCategoryItemToPayload(item: Partial<InvestorCategory>) { return { name: item.name, slug: item.slug }; }

type InvestorImageRow = { id: string; title: string; category: string; taken_on: string; image_url: string | null; created_at: string };
function investorImageRowToItem(row: InvestorImageRow): InvestorImage { return { id: row.id, title: row.title, category: row.category, takenOn: row.taken_on, image: row.image_url || '', createdAt: row.created_at }; }
function investorImageItemToPayload(item: Partial<InvestorImage>) { return { title: item.title || '', category: item.category, taken_on: item.takenOn, image_url: item.image }; }

export async function fetchInvestorCategories(): Promise<InvestorCategory[]> {
  const { data, error } = await supabase.from('investor_gallery_categories').select('*').order('name');
  if (error) throw error;
  return (data as InvestorCategoryRow[]).map(investorCategoryRowToItem);
}
export async function fetchInvestorImages(): Promise<InvestorImage[]> {
  const { data, error } = await supabase.from('investor_gallery_images').select('*').order('taken_on', { ascending: false });
  if (error) throw error;
  return (data as InvestorImageRow[]).map(investorImageRowToItem);
}
export type InvestorImageDate = { category: string; takenOn: string };
export async function fetchInvestorImageDates(): Promise<InvestorImageDate[]> {
  const { data, error } = await supabase.from('investor_gallery_images').select('category, taken_on').order('taken_on', { ascending: false });
  if (error) throw error;
  return (data as { category: string; taken_on: string }[]).map(row => ({ category: row.category, takenOn: row.taken_on }));
}
export async function fetchLatestInvestorImages(limit = 9): Promise<InvestorImage[]> {
  const { data, error } = await supabase.from('investor_gallery_images').select('*').order('taken_on', { ascending: false }).order('created_at', { ascending: false }).limit(limit);
  if (error) throw error;
  return (data as InvestorImageRow[]).map(investorImageRowToItem);
}
export async function fetchInvestorImagesFor(category: string, takenOn: string): Promise<InvestorImage[]> {
  const { data, error } = await supabase.from('investor_gallery_images').select('*').eq('category', category).eq('taken_on', takenOn);
  if (error) throw error;
  return (data as InvestorImageRow[]).map(investorImageRowToItem);
}
export async function saveInvestorCategory(category: Partial<InvestorCategory>, isNew: boolean): Promise<InvestorCategory> {
  const path = `/api/investor-gallery-categories${isNew ? '' : `/${category.id}`}`;
  const res = await fetch(path, { method: isNew ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(category) });
  return parseOrThrow(res);
}
export async function saveInvestorImage(image: Partial<InvestorImage>, isNew: boolean): Promise<InvestorImage> {
  const path = `/api/investor-gallery-images${isNew ? '' : `/${image.id}`}`;
  const res = await fetch(path, { method: isNew ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(image) });
  return parseOrThrow(res);
}
export async function deleteInvestorImage(id: string): Promise<void> {
  const res = await fetch(`/api/investor-gallery-images/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || `Request failed (${res.status})`);
}
export { investorCategoryRowToItem, investorCategoryItemToPayload, investorImageRowToItem, investorImageItemToPayload };
