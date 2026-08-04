'use client';

import { ModuleListPage } from '@/components/admin-module-list';
import { fetchHubs } from '@/lib/cms';

export default function HubsListPage() {
  return <ModuleListPage module="Hubs & auctions" slug="hubs" singular="hub" fetchItems={fetchHubs} showStatus={false} />;
}
