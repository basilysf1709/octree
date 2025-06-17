export type Document = {
  id: string;
  title: string;
  updated_at: string;
};

export type DocumentsTableProps = {
  onDelete: (docId: string, title: string) => void;
};