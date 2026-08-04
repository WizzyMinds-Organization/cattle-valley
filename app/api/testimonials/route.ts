import { NextRequest } from 'next/server';
import { createHandlers } from '@/lib/cms-server';
import { testimonialRowToItem, testimonialItemToPayload } from '@/lib/cms';

const handlers = createHandlers('testimonials', testimonialRowToItem, testimonialItemToPayload);

export async function POST(req: NextRequest) {
  return handlers.create(req);
}
