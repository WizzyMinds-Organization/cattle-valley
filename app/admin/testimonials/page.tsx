'use client';

import { ModuleListPage } from '@/components/admin-module-list';
import { fetchTestimonials } from '@/lib/cms';

export default function TestimonialsListPage() {
  return <ModuleListPage module="Testimonials" slug="testimonials" singular="testimonial" fetchItems={fetchTestimonials} showStatus={false} />;
}
