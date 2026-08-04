'use client';

import { ModuleListPage } from '@/components/admin-module-list';
import { fetchDocuments } from '@/lib/cms';

export default function DocumentsListPage() {
  return <ModuleListPage module="Documents" slug="documents" singular="document" fetchItems={fetchDocuments} showStatus={false} />;
}
