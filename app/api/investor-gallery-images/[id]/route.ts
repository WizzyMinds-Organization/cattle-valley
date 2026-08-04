import { NextRequest } from 'next/server';
import { createHandlers } from '@/lib/cms-server';
import { investorImageRowToItem, investorImageItemToPayload } from '@/lib/cms';

const handlers = createHandlers('investor_gallery_images', investorImageRowToItem, investorImageItemToPayload);

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return handlers.update(req, id);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return handlers.remove(id);
}
