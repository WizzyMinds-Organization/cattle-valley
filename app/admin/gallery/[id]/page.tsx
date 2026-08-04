'use client';

import { use } from 'react';
import { ModuleEditorPage } from '@/components/admin-module-editor';
import { fetchGalleryImages } from '@/lib/cms';

export default function EditGalleryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ModuleEditorPage module="Gallery" slug="gallery" id={id} fetchItems={fetchGalleryImages} />;
}
