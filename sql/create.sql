create table documents (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  author_id uuid references auth.users(id),
  created_at timestamp with time zone default now(),
  last_edited timestamp with time zone default now()
);

create table versions (
  id uuid primary key default uuid_generate_v4(),
  document_id uuid references documents(id),
  content text,
  created_at timestamp with time zone default now()
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