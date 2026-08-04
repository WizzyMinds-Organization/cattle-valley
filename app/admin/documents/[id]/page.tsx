'use client';

import { use } from 'react';
import { ModuleEditorPage } from '@/components/admin-module-editor';
import { fetchDocuments } from '@/lib/cms';

export default function EditDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ModuleEditorPage module="Documents" slug="documents" id={id} fetchItems={fetchDocuments} />;
}
