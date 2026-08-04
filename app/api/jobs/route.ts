import { NextRequest } from 'next/server';
import { createHandlers } from '@/lib/cms-server';
import { jobRowToItem, jobItemToPayload } from '@/lib/cms';

const handlers = createHandlers('job_openings', jobRowToItem, jobItemToPayload);

export async function POST(req: NextRequest) {
  return handlers.create(req);
}
