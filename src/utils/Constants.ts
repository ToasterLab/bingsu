export const MessageType: Record<string, MessageType> = {
  CLOSE: `close`,
  HANDLE_FILE: `handleFile`,
  MESSAGE: `message`,
  MINIMISE: `minimise`,
  OS: `os`,
  TOGGLE_MAXIMISE: `toggle-maximise`,
} as const
