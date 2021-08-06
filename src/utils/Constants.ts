export const MessageType: Record<string, MessageType> = {
  ARCHIVE_URL: `archive-url`,
  CLOSE: `close`,
  HANDLE_FILE: `handleFile`,
  MESSAGE: `message`,
  MINIMISE: `minimise`,
  OS: `os`,
  TOGGLE_MAXIMISE: `toggle-maximise`,
} as const

export const URL_MAX_AGE = 30 // (in days)