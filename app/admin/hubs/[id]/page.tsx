'use client';

import { use } from 'react';
import { ModuleEditorPage } from '@/components/admin-module-editor';
import { fetchHubs } from '@/lib/cms';

export default function EditHubPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ModuleEditorPage module="Hubs & auctions" slug="hubs" id={id} fetchItems={fetchHubs} />;
}
