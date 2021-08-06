import type { BrowserWindow } from "electron"
import Logger from '../utils/Logger'
import DOCX from '../utils/DOCX'
import { MessageType } from '../utils/Constants'
import { getOS } from '../utils/System'
import Archiver from "../utils/Archiver"


const handleFile = async (data: { filePath?: string }) => {
  Logger.log(`Controller`, data)
  if (data && `filePath` in data) {
    const { filePath } = data
    const docxFile = await DOCX.readFile(filePath as File[`path`])
    try {
      const links = await DOCX.getAllHyperlinks(docxFile)
      return { file: docxFile, hyperlinks: links }
    } catch (error) {
      Logger.error(`Controller handleFile`, error)
    } finally {
      await DOCX.closeFile(docxFile)
    }
  }
}

const archiveURL = async (data: { url?: string, maxAge?: number }): Promise<ArchiveURLPayload> => {
  if (data && `url` in data && `maxAge` in data) {
    const { url, maxAge } = data
    try {
      const existingArchive = await Archiver.getArchive(url)
      if (existingArchive) {
        const { date, url } = existingArchive
        const maxAgeInMilliseconds = maxAge * 24 * 60 * 60 * 1000
        Logger.log(`Compare dates: `, date, new Date(date.getTime() + maxAgeInMilliseconds))
        if (url && ((date.getTime() + maxAgeInMilliseconds) >= Date.now())) {
          return { lastArchiveDate: date, status: `EXISTS`, url }
        }
      }

      const newArchive = await Archiver.archiveURL(url)
      if (newArchive) {
        const { url } = newArchive
        if (url) {
          return { status: `NEW`, url }
        }
      }

      throw new Error(`Archiving failed for unknown reason`)
    } catch (error) {
      return { error: error.message, status: `ERROR` }
    }
  }
}

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
      event.reply(MessageType.HANDLE_FILE, await handleFile(data))
      break
    }

    case MessageType.OS: {
      event.reply(MessageType.OS, { os: getOS() })
      break
    }
      
    case MessageType.ARCHIVE_URL: {
      event.reply(MessageType.ARCHIVE_URL, await archiveURL(data))
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