import { NextRequest } from 'next/server';
import { createHandlers } from '@/lib/cms-server';
import { documentRowToItem, documentItemToPayload } from '@/lib/cms';

const handlers = createHandlers('documents', documentRowToItem, documentItemToPayload);

export async function POST(req: NextRequest) {
  return handlers.create(req);
}
