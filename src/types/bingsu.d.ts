type MessageType = `message` | `toggle-maximise` | `minimise` | `close` | `handleFile` | `os`

type OS = `WSL` | `Linux` | `macOS` | `Windows`

interface BridgeApi {
  sendMessage: (message: MessageType, data?: Record<string, unknown>) => void,
  on: (channel: MessageType, callback: Function) => void,
}

declare const bridgeApi: BridgeApi

type DOCXFile = {
  fileName: string,
  directoryName: string,
  filePath: string,
  tempPath: string
}

type HyperlinkLocation = `document` | `footnotes`

type Hyperlink = {
  id: string,
  url: string,
  location: HyperlinkLocation,
  text: string,
}

type BingsuFile = {
  // use original path as unique ID
  file: DOCXFile,
  hyperlinks?: Hyperlink[]
}