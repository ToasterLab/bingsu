import { ipcRenderer } from 'electron'

const api = {
  on: (channel: MessageType, callback: Function) => {
    ipcRenderer.on(channel, (event, data: Record<string, unknown>) => callback(data))
  },
  removeAllListeners: (channel: MessageType) => {
    ipcRenderer.removeAllListeners(channel)
  },
  removeListener: (channel: MessageType, callback: (...arguments_: any[]) => void) => {
    ipcRenderer.removeListener(channel, callback)
  },
  sendMessage: (message: MessageType, data?: Record<string, unknown>) => {
    ipcRenderer.send(`message`, message, data)
  },
}

export default api
