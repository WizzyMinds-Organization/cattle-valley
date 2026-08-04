'use client';

import { use } from 'react';
import { ModuleEditorPage } from '@/components/admin-module-editor';
import { fetchJobs } from '@/lib/cms';

export default function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ModuleEditorPage module="Careers" slug="careers" id={id} fetchItems={fetchJobs} />;
}
