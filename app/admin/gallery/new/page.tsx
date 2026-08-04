'use client';

import { ModuleEditorPage } from '@/components/admin-module-editor';
import { fetchGalleryImages } from '@/lib/cms';

export default function NewGalleryPage() {
  return <ModuleEditorPage module="Gallery" slug="gallery" fetchItems={fetchGalleryImages} />;
}
