'use client';

import { ModuleEditorPage } from '@/components/admin-module-editor';
import { fetchTestimonials } from '@/lib/cms';

export default function NewTestimonialPage() {
  return <ModuleEditorPage module="Testimonials" slug="testimonials" fetchItems={fetchTestimonials} />;
}
