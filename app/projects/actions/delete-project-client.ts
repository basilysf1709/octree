'use client';

import { deleteProject } from './delete-project';
import { useProjectRefresh } from '@/app/context/project';

export function useDeleteProject() {
  const { refreshProjects } = useProjectRefresh();

  const deleteProjectWithRefresh = async (projectId: string) => {
    const formData = new FormData();
    formData.append('projectId', projectId);

    const result = await deleteProject({ projectId: null }, formData);
    
    if (result.success) {
      // Trigger sidebar refresh after successful project deletion
      refreshProjects();
    }
    
    return result;
  };

  return { deleteProjectWithRefresh };
} 