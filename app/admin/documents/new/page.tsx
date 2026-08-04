'use client';

import { ModuleEditorPage } from '@/components/admin-module-editor';
import { fetchDocuments } from '@/lib/cms';

export default function NewDocumentPage() {
  return <ModuleEditorPage module="Documents" slug="documents" fetchItems={fetchDocuments} />;
}
