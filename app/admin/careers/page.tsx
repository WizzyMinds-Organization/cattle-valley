'use client';

import { ModuleListPage } from '@/components/admin-module-list';
import { fetchJobs } from '@/lib/cms';

export default function CareersListPage() {
  return <ModuleListPage module="Careers" slug="careers" singular="job" fetchItems={fetchJobs} />;
}
