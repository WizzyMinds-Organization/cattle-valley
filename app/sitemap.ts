import type { MetadataRoute } from 'next';
export default function sitemap(): MetadataRoute.Sitemap { const pages=['','/about','/gallery','/documents','/blog','/contact','/privacy','/terms']; return pages.map(path=>({url:`https://cattlevalley.com${path}`,lastModified:new Date(),changeFrequency:'weekly',priority:path===''?1:.7})); }
