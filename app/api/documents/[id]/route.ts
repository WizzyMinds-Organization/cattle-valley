import { NextRequest } from 'next/server';
import { createHandlers } from '@/lib/cms-server';
import { documentRowToItem, documentItemToPayload } from '@/lib/cms';

const handlers = createHandlers('documents', documentRowToItem, documentItemToPayload);

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return handlers.update(req, id);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return handlers.remove(id);
}
