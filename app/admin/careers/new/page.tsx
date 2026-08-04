'use client';

import { ModuleEditorPage } from '@/components/admin-module-editor';
import { fetchJobs } from '@/lib/cms';

export default function NewJobPage() {
  return <ModuleEditorPage module="Careers" slug="careers" fetchItems={fetchJobs} />;
}
