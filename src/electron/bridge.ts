import { ipcRenderer } from 'electron'

const api = {
  

  /**
   * Provide an easier way to listen to events
   */
on: (channel: MessageType, callback: Function) => {
    ipcRenderer.on(channel, (event, data: Record<string, unknown>) => callback(data))
  },

  
  /**
   * Here you can expose functions to the renderer process
   * so they can interact with the main (electron) side
   * without security problems.
   *
   * The function below can accessed using `window.Main.sayHello`
   */
sendMessage: (message: MessageType, data?: Record<string, unknown>) => {
    ipcRenderer.send(`message`, message, data)
  },
}

export default api
