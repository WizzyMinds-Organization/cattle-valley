'use client';

import { ModuleEditorPage } from '@/components/admin-module-editor';
import { fetchHubs } from '@/lib/cms';

export default function NewHubPage() {
  return <ModuleEditorPage module="Hubs & auctions" slug="hubs" fetchItems={fetchHubs} />;
}
