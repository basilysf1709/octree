export interface EditSuggestion {
  id: string;
  original: string;
  suggested: string;
  startLine: number;
  endLine: number;
  status: 'pending' | 'accepted' | 'rejected';
} 