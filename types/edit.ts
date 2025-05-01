export interface EditSuggestion {
  id: string;
  original: string;
  suggested: string;
  startLine: number;
  originalLineCount: number;
  status: 'pending' | 'accepted' | 'rejected';
}
