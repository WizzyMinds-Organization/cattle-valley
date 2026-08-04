'use client';

import { use } from 'react';
import { ModuleEditorPage } from '@/components/admin-module-editor';
import { fetchBlogPosts } from '@/lib/cms';

export default function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ModuleEditorPage module="Blogs" slug="blogs" id={id} fetchItems={fetchBlogPosts} />;
}
