import { app, BrowserWindow, ipcMain, shell } from 'electron'
import isDev from 'electron-is-dev'
import { exec } from 'child_process'
import Controller from './controller'
import { isMacOS, isWSL } from './utils/System'

declare const MAIN_WINDOW_WEBPACK_ENTRY: string
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string

if (require(`electron-squirrel-startup`)) {
  app.quit()
}

let mainWindow: BrowserWindow

const createWindow = () => {
  const defaultConfig = {
    backgroundColor: `#fff`,
    frame: false,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
    width: 800,
  }
  mainWindow = new BrowserWindow({
    ...defaultConfig,
    ...(isWSL()
      ? {
        autoHideMenuBar: true,
        frame: true,
        menuBarVisible: false,
      } : {}),
  })

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isWSL()) {
      exec(`explorer.exe "${url}"`)
    } else {
      shell.openExternal(url)
    }
    return { action: `deny` }
  })

  // Open the DevTools.
  mainWindow.webContents.openDevTools()
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
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.on(`window-all-closed`, function () {
  if (!isMacOS()) {
    app.quit()
  }
})
