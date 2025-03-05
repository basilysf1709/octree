export const CONSTANTS = {
  MAX_DOCUMENT_SIZE: 1000000, // 1MB
  AUTO_SAVE_DELAY: 2000, // 2 seconds between saves
  VERSION_SAVE_INTERVAL: 10, // Creates a version every 10 saves
  MAX_VERSIONS: 50,
  SUPPORTED_FILE_TYPES: ['md', 'txt', 'doc'],
} as const 