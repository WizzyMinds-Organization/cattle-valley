import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { AnnounceModalGate } from '@/components/announce-modal-gate';
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta' });
export const metadata: Metadata = { title: { default: 'Cattle Valley | Healthy Living Habitat', template: '%s | Cattle Valley' }, description: 'A science-led livestock enterprise building a healthier, sustainable future.', metadataBase: new URL('https://cattlevalley.com'), openGraph: { type: 'website', siteName: 'Cattle Valley', title: 'Cattle Valley | Healthy Living Habitat', description: 'A science-led livestock enterprise building a healthier, sustainable future.', url: '/', images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Cattle Valley — Sustainable livestock. Powered by science.' }] }, twitter: { card: 'summary_large_image', title: 'Cattle Valley | Healthy Living Habitat', description: 'A science-led livestock enterprise building a healthier, sustainable future.', images: ['/og-image.png'] } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body className={`${inter.variable} ${jakarta.variable}`}>{children}<AnnounceModalGate /></body></html>; }
