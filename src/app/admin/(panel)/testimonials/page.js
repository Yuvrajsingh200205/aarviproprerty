'use client';
import ResourcePage from '@/components/admin/ResourcePage';
import { resources } from '@/lib/admin-config';

export default function Page() {
  return <ResourcePage config={resources.testimonials} />;
}
