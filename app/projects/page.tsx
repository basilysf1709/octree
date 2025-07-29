import { redirect } from 'next/navigation';
import Navbar from '@/components/navbar';
import { DataTable } from '@/components/projects/data-table';
import { columns } from '@/components/projects/columns';
import { createClient } from '@/lib/supabase/server';
import { CreateProjectDialog } from '@/components/projects/create-project-dialog';
import { ProjectsTable } from '@/components/projects/projects-table';

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data } = await supabase
    .from('projects')
    .select('*')
    .order('updated_at', { ascending: false });

  if (!data) {
    return <div>No data</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-neutral-900">Projects</h1>
            <p className="text-sm text-neutral-500">
              Manage and edit your projects
            </p>
          </div>

          <CreateProjectDialog />
        </div>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        <ProjectsTable data={data} />
      </div>
    </div>
  );
}
