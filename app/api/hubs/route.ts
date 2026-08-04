import { NextRequest } from 'next/server';
import { createHandlers } from '@/lib/cms-server';
import { hubRowToItem, hubItemToPayload } from '@/lib/cms';

const handlers = createHandlers('hubs', hubRowToItem, hubItemToPayload);

export async function POST(req: NextRequest) {
  return handlers.create(req);
}
