'use client';

import { ModuleEditorPage } from '@/components/admin-module-editor';
import { fetchBlogPosts } from '@/lib/cms';

export default function NewBlogPage() {
  return <ModuleEditorPage module="Blogs" slug="blogs" fetchItems={fetchBlogPosts} />;
}
