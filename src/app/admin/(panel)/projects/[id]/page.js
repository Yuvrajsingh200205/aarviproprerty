'use client';
import { use } from 'react';
import ProjectEditor from '@/components/admin/ProjectEditor';

export default function EditProject({ params }) {
  const { id } = use(params);
  return <ProjectEditor id={id} />;
}
