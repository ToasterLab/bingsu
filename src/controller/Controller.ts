import type { BrowserWindow } from "electron"
import Logger from '../utils/Logger'
import DOCX from '../utils/DOCX'

const handle = async (
  mainWindow: BrowserWindow,
  event: Electron.IpcMainEvent,
  message: MessageType,
  data: Record<string, unknown>
) => {
  switch (message) {
    case `minimise`: {
      mainWindow.minimize()
      break
    }
      
    case `close`: {
      mainWindow.close()
      break
    }

    case `toggle-maximise`: {
      if(mainWindow.isMaximized()){
        mainWindow.unmaximize()
      } else {
        mainWindow.maximize()
      }
    }

    case `handleFile`: {
      const { file }: { file?: File } = data
      const docxFile = await DOCX.readFile(file.path)
      const links = await DOCX.getAllHyperlinks(docxFile)
      event.reply(`handleFile`, { links })
      break
    }

    default: {
      Logger.log(`ipcMain message`, message)
    }
  }
}

const Controller = {
  handle
}

export default Controller