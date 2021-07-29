import { app, BrowserWindow, ipcMain } from 'electron'
import isDev from 'electron-is-dev'
import Controller from './controller'
import Logger from './utils/Logger'

let mainWindow: BrowserWindow

const createWindow = () => {
  mainWindow = new BrowserWindow({
    backgroundColor: `#fff`,
    frame: false,
    height: 600,
    // transparent: true,
webPreferences: {
      nodeIntegration: true,
      preload: `${app.getAppPath()}/preload.js`,
    },
    
    width: 800,
  })

  const url = isDev
    ? `http://localhost:9000`
    : `file://${app.getAppPath()}/index.html`

  mainWindow.loadURL(url)

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

const registerListeners = () => {
  ipcMain.on(`message`, (event, message: MessageType, data: Record<string, unknown>) => {
    Controller.handle(mainWindow, event, message, data)
  })
}

app.on(`ready`, createWindow)
  .whenReady()
  .then(registerListeners)

app.on(`activate`, function () {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.on(`window-all-closed`, function () {
  if (process.platform !== `darwin`) {
    app.quit()
  }
})
