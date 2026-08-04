import { NextRequest } from 'next/server';
import { createHandlers } from '@/lib/cms-server';
import { blogRowToItem, blogItemToPayload } from '@/lib/cms';

const handlers = createHandlers('blog_posts', blogRowToItem, blogItemToPayload);

export async function POST(req: NextRequest) {
  return handlers.create(req);
}
