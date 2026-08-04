import { NextRequest } from 'next/server';
import { createHandlers } from '@/lib/cms-server';
import { investorCategoryRowToItem, investorCategoryItemToPayload } from '@/lib/cms';

const handlers = createHandlers('investor_gallery_categories', investorCategoryRowToItem, investorCategoryItemToPayload);

// Rename only — categories are never deleted from here, since removing one
// could orphan photos already tagged with it (client's explicit call).
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return handlers.update(req, id);
}
