'use client';

import { ModuleListPage } from '@/components/admin-module-list';
import { fetchBlogPosts } from '@/lib/cms';

export default function BlogsListPage() {
  return <ModuleListPage module="Blogs" slug="blogs" singular="blog" fetchItems={fetchBlogPosts} />;
}
