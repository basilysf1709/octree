export const validateDocument = {
  name: (name: string) => {
    if (!name) return 'Name is required'
    if (name.length < 3) return 'Name must be at least 3 characters'
    if (name.length > 100) return 'Name must be less than 100 characters'
    return null
  },
  content: (content: string) => {
    if (!content) return 'Content is required'
    if (content.length > 1000000) return 'Content must be less than 1MB'
    return null
  }
} 