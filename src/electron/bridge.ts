import { contextBridge, ipcRenderer } from 'electron'

type channels = `minimize` | `close`

export const api = {
  /**
   * Here you can expose functions to the renderer process
   * so they can interact with the main (electron) side
   * without security problems.
   *
   * The function below can accessed using `window.Main.sayHello`
   */

  sendMessage: (message: string) => { 
    ipcRenderer.send('message', message)
  },

  /**
   * Provide an easier way to listen to events
   */
  on: (channel: channels, callback: Function) => {
    ipcRenderer.on(channel, (_, data) => callback(data))
  },
}

export type bridgeApiType = typeof api

contextBridge.exposeInMainWorld('bridgeApi', api)