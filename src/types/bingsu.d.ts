type MessageType = `message` | `toggle-maximise` | `minimise` | `close` | `handleFile`

interface BridgeApi {
  sendMessage: (message: MessageType, data?: Record<string, unknown>) => void,
  on: (channel: MessageType, callback: Function) => void,
}

declare const bridgeApi: BridgeApi