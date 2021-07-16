import { app, BrowserWindow, ipcMain } from 'electron'
import isDev from 'electron-is-dev'

let mainWindow

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    backgroundColor: '#fff',
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
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
  ipcMain.on('message', (_, message) => {
    console.log(message)
  })

  ipcMain.on(`minimise`, () => {
    mainWindow.minimize()
  })

  ipcMain.on(`close`, () => {
    mainWindow.close()
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
