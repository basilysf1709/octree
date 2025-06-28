'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { TablesInsert } from '@/database.types';
import { z } from 'zod';

const CreateProject = z.object({
  title: z.string().min(1, 'Project title is required').trim(),
});

export type State = {
  projectId: string | null;
  message?: string | null;
  success?: boolean;
};

export async function createProject(prevState: State, formData: FormData) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      redirect('/auth/login');
    }

    const validatedFields = CreateProject.safeParse({
      title: formData.get('title') as string,
    });

    if (!validatedFields.success) {
      throw new Error(validatedFields.error.errors[0].message);
    }

    const { title } = validatedFields.data;

    const projectData: TablesInsert<'projects'> = {
      title,
      user_id: user.id,
    };

    const { data, error } = await supabase
      .from('projects')
      .insert(projectData)
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      throw new Error('Failed to create project');
    }

    const { error: fileError } = await supabase.from('files').insert({
      project_id: data.id,
      name: 'main.tex',
    });

    if (fileError) {
      throw new Error(`Failed to insert file record: ${fileError.message}`);
    }

    const latexSource = `\\documentclass{article}\\begin{document}Hello, world!\\end{document}`;

    const { error: uploadError } = await supabase.storage
      .from('octree')
      .upload(
        `projects/${data.id}/main.tex`,
        new Blob([latexSource], { type: 'text/plain' })
      );

    if (uploadError) {
      throw new Error(`Failed to upload main.tex: ${uploadError.message}`);
    }

    revalidatePath('/projects');

    return {
      projectId: data.id,
      message: null,
      success: true,
    };
  } catch (error) {
    console.error('Error creating project:', error);
    return {
      projectId: null,
      message:
        error instanceof Error ? error.message : 'Failed to create project',
    };
  }
}
