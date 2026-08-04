import { NextRequest } from 'next/server';
import { createHandlers } from '@/lib/cms-server';
import { galleryRowToItem, galleryItemToPayload } from '@/lib/cms';

const handlers = createHandlers('gallery_images', galleryRowToItem, galleryItemToPayload);

export async function POST(req: NextRequest) {
  return handlers.create(req);
}
