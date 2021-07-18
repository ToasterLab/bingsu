import { app, BrowserWindow, ipcMain } from 'electron'
import isDev from 'electron-is-dev'
import Logger from './utils/Logger'

let mainWindow: BrowserWindow

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    backgroundColor: '#fff',
    // transparent: true,
    webPreferences: {
      nodeIntegration: true,
      preload: `${app.getAppPath()}/preload.js`,
    }
  })

  const url = isDev
    ? 'http://localhost:9000'
    : `file://${app.getAppPath()}/index.html`

  mainWindow.loadURL(url)

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

const registerListeners = () => {
  Logger.log(`registerListeners`)

  ipcMain.on('message', (_, message) => {
    switch (message) {
      case `minimise`: {
        mainWindow.minimize()
        break
      }
        
      case `close`: {
        mainWindow.close()
        break
      }

      default:
        Logger.log(`ipcMain message`, message)
    }
  })
}

app.on(`ready`, createWindow)
  .whenReady()
  .then(registerListeners)

app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
