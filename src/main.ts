import { app, BrowserWindow, ipcMain } from 'electron'
import isDev from 'electron-is-dev'

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
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
}

app.on(`ready`, createWindow)
  .whenReady()
  .then(registerListeners)

app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})
