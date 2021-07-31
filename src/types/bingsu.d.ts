type MessageType = `message` | `toggle-maximise` |
  `minimise` | `close` | `handleFile` | `os` |
  `archive-url`

type OS = `WSL` | `Linux` | `macOS` | `Windows`

interface BridgeApi {
  sendMessage: (message: MessageType, data?: Record<string, unknown>) => void,
  on: (channel: MessageType, callback: Function) => void,
  removeListener: (channel: MessageType, callback: (...arguments_: any[]) => void) => void,
}

declare const bridgeApi: BridgeApi

type DOCXFile = {
  fileName: string,
  directoryName: string,
  filePath: string,
  tempPath: string
}

type HyperlinkLocation = `document` | `footnotes`
type HyperlinkStatus = `UNPROCESSED` | `PROCESSING` | ArchiveURLStatus

type Hyperlink = {
  id: string,
  url: string,
  location: HyperlinkLocation,
  text: string,
  status: HyperlinkStatus,
  archivedURL?: string,
}

type BingsuFile = {
  // use original path as unique ID
  file: DOCXFile,
  hyperlinks?: Hyperlink[]
}

type ArchiveURLStatus = `EXISTS` | `ERROR` | `NEW`

type ArchiveURLPayload = {
  status: ArchiveURLStatus,
  error?: string,
  url?: string,
}