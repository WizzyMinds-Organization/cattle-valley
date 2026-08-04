'use client';

import { use } from 'react';
import { ModuleEditorPage } from '@/components/admin-module-editor';
import { fetchTestimonials } from '@/lib/cms';

export default function EditTestimonialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ModuleEditorPage module="Testimonials" slug="testimonials" id={id} fetchItems={fetchTestimonials} />;
}
