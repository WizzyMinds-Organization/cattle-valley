import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export function createHandlers<Row, Payload>(table: string, rowToItem: (row: Row) => unknown, itemToPayload: (item: Payload) => Record<string, unknown>) {
  async function create(req: NextRequest) {
    const body = (await req.json()) as Payload;
    const { data, error } = await supabaseAdmin.from(table).insert(itemToPayload(body)).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(rowToItem(data as Row));
  }
  async function update(req: NextRequest, id: string) {
    const body = (await req.json()) as Payload;
    const { data, error } = await supabaseAdmin.from(table).update(itemToPayload(body)).eq('id', id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(rowToItem(data as Row));
  }
  async function remove(id: string) {
    const { error } = await supabaseAdmin.from(table).delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return new NextResponse(null, { status: 204 });
  }
  return { create, update, remove };
}
