-- Enable RLS on the documents table if not already enabled
alter table documents enable row level security;

-- Create policy for deleting documents
create policy "Users can delete their own documents"
on documents
for delete
using (auth.uid() = author_id);