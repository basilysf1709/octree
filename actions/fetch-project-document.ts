'use server';

import { createClient } from '@/lib/supabase/server';
import { DEFAULT_LATEX_CONTENT } from '@/data/constants';

export interface ProjectDocumentData {
  project: any;
  document: any;
}

export interface FetchProjectDocumentResult {
  data: ProjectDocumentData | null;
  error: string | null;
}

export async function fetchProjectAndDocument(
  projectId: string
): Promise<FetchProjectDocumentResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        data: null,
        error: 'User not authenticated',
      };
    }

    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (projectError) {
      return {
        data: null,
        error: 'Project not found',
      };
    }

    const { data: documentData, error: documentError } = await supabase
      .from('documents')
      .select('content, title')
      .eq('project_id', projectId)
      .eq('filename', 'main.tex')
      .eq('owner_id', user.id)
      .single();

    if (documentError) {
      const defaultContent = DEFAULT_LATEX_CONTENT(projectData.title);

      const { data: newDocument, error: createError } = await supabase
        .from('documents')
        .insert({
          title: projectData.title,
          content: defaultContent,
          owner_id: user.id,
          project_id: projectId,
          filename: 'main.tex',
          document_type: 'article',
        })
        .select('content, title')
        .single();

      if (createError) {
        return {
          data: null,
          error: 'Failed to create document',
        };
      }

      return {
        data: {
          project: projectData,
          document: newDocument,
        },
        error: null,
      };
    }

    return {
      data: {
        project: projectData,
        document: documentData,
      },
      error: null,
    };
  } catch (error) {
    console.error('Error loading project:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to load project',
    };
  }
}
