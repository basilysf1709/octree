import { Tables } from '@/database.types';

export type Document = Tables<'documents'> & {
  projects?: {
    id: string;
    title: string;
  } | null;
};
