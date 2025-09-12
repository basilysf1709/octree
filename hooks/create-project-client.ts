'use client';

import { createProject } from '../app/projects/actions/create-project';
import { useProjectRefresh } from '@/app/context/project';

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