import { NextRequest } from 'next/server';
import { createHandlers } from '@/lib/cms-server';
import { investorCategoryRowToItem, investorCategoryItemToPayload } from '@/lib/cms';

const handlers = createHandlers('investor_gallery_categories', investorCategoryRowToItem, investorCategoryItemToPayload);

export async function POST(req: NextRequest) {
  return handlers.create(req);
}
