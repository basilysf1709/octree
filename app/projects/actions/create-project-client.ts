'use client';

import { createProject } from './create-project';
import { useProjectRefresh } from '@/lib/project-context';

export function useCreateProject() {
  const { refreshProjects } = useProjectRefresh();

  const createProjectWithRefresh = async (formData: FormData) => {
    const result = await createProject({ projectId: null }, formData);
    
    if (result.success) {
      // Trigger sidebar refresh after successful project creation
      refreshProjects();
    }
    
    return result;
  };

  return { createProjectWithRefresh };
} 