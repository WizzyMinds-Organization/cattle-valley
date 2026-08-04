import { NextRequest } from 'next/server';
import { createHandlers } from '@/lib/cms-server';
import { investorImageRowToItem, investorImageItemToPayload } from '@/lib/cms';

const handlers = createHandlers('investor_gallery_images', investorImageRowToItem, investorImageItemToPayload);

export async function POST(req: NextRequest) {
  return handlers.create(req);
}
