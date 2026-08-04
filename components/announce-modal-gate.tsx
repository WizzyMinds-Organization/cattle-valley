'use client';

import { usePathname } from 'next/navigation';
import { AnnounceModal } from './announce-modal';

const excludedPrefixes = ['/admin', '/login', '/forgot-password', '/reset-password'];

export function AnnounceModalGate() {
  const pathname = usePathname();
  if (excludedPrefixes.some(prefix => pathname.startsWith(prefix))) return null;
  return <AnnounceModal />;
}
