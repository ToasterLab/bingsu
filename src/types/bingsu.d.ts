type MessageType = `message` | `toggle-maximise` | `minimise` | `close` | `handleFile`

declare const bridgeApi: {
  sendMessage: (message: MessageType, data?: Record<string, unknown>) => void,
  on: (channel: MessageType, callback: Function) => void,
}