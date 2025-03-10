// Move existing types content here 

export interface Document {
  id: string
  name: string
  content: string
  author_id: string
  created_at: string
  last_edited: string
}

export interface Version {
  id: string
  documentId: string
  message: string
  author: string
  time: string
  changes: Change[]
}

export interface Change {
  type: 'added' | 'removed' | 'modified' | 'context'
  content: string
  lineNumber?: number
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
} 