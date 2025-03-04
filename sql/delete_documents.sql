-- Drop policies first
drop policy if exists "Users can read their own documents" on documents;
drop policy if exists "Users can create their own documents" on documents;
drop policy if exists "Users can update their own documents" on documents;

-- Drop versions table first since it references documents
drop table if exists versions;

-- Drop documents table
drop table if exists documents; 