import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta' });
export const metadata: Metadata = { title: { default: 'Graze Valley | Healthy Living Habitat', template: '%s | Graze Valley' }, description: 'A science-led livestock enterprise building a healthier, sustainable future.', metadataBase: new URL('https://grazevalley.com'), openGraph: { type: 'website', siteName: 'Graze Valley' }, twitter: { card: 'summary_large_image' } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body className={`${inter.variable} ${jakarta.variable}`}>{children}</body></html>; }
