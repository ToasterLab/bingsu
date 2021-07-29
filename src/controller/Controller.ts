import type { BrowserWindow } from "electron"
import Logger from '../utils/Logger'
import DOCX from '../utils/DOCX'
import { MessageType } from '../utils/Constants'

// handles ipc messages from renderer received by Electron backend

const handle = async (
  mainWindow: BrowserWindow,
  event: Electron.IpcMainEvent,
  message: MessageType,
  data: Record<string, unknown>,
) => {
  switch (message) {
    case MessageType.MINIMISE: {
      mainWindow.minimize()
      break
    }
      
    case MessageType.CLOSE: {
      mainWindow.close()
      break
    }

    case MessageType.TOGGLE_MAXIMISE: {
      if(mainWindow.isMaximized()){
        mainWindow.unmaximize()
      } else {
        mainWindow.maximize()
      }
    }

    case MessageType.HANDLE_FILE: {
      Logger.log(`Controller`, data)
      if (data && `filePath` in data) {
        const { filePath } = data
        const docxFile = await DOCX.readFile(filePath as File[`path`])
        try {
          const links = await DOCX.getAllHyperlinks(docxFile)
          event.reply(MessageType.HANDLE_FILE, { file: docxFile, hyperlinks: links })
        } catch (error) {
          Logger.error(`Controller handleFile`, error)
        } finally {
          await DOCX.closeFile(docxFile)
        }
      }
      break
    }

    default: {
      Logger.log(`ipcMain message`, message)
    }
  }
}

const Controller = {
  handle,
}

export default Controller