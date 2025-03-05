create table documents (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  author_id uuid references auth.users(id),
  created_at timestamp with time zone default now(),
  last_edited timestamp with time zone default now(),
  content text
);

create table versions (
  id uuid primary key default uuid_generate_v4(),
  document_id uuid references documents(id),
  content text,
  created_at timestamp with time zone default now(),
  version_number integer not null default 0,
  created_by uuid references auth.users(id)
);

-- Enable RLS (Row Level Security)
alter table documents enable row level security;

-- Create policy to allow users to read their own documents
create policy "Users can read their own documents"
  on documents for select
  using (auth.uid() = author_id);

-- Create policy to allow users to insert their own documents
create policy "Users can create their own documents"
  on documents for insert
  with check (auth.uid() = author_id);

-- Create policy to allow users to update their own documents
create policy "Users can update their own documents"
  on documents for update
  using (auth.uid() = author_id);

-- Add RLS for versions table
alter table versions enable row level security;

-- Create policy for versions
create policy "Users can read versions of their documents"
  on versions for select
  using (
    exists (
      select 1 from documents
      where documents.id = versions.document_id
      and documents.author_id = auth.uid()
    )
  );

create policy "Users can create versions of their documents"
  on versions for insert
  with check (
    exists (
      select 1 from documents
      where documents.id = versions.document_id
      and documents.author_id = auth.uid()
    )
  );

-- Add content column to documents table
alter table documents add column content text;

-- Add version_number to versions table
alter table versions add column version_number integer not null default 0;

-- Function to update last_edited
create function update_last_edited()
returns trigger as $$
begin
  new.last_edited = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to update last_edited
create trigger update_last_edited_trigger
before update on documents
for each row
execute function update_last_edited();