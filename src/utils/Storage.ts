// to be used only on the browser side
// this decision has been made to avoid the
// need to write getter and setter code that goes
// through electron's IPC communication

import { URL_MAX_AGE } from './Constants'
import Logger from './Logger'

type Data = {
  files: BingsuFile[],
  maxArchiveAge: number,
}

const initialData: Data = {
  files: [],
  maxArchiveAge: URL_MAX_AGE,
}

const databaseName = `bingsu_db`

let database = {...initialData} as Data

const init = (): void => {
  const data = localStorage.getItem(databaseName)
  database = data === null ? initialData : JSON.parse(data)
}

const save = () => localStorage.setItem(databaseName, JSON.stringify(database))

const findExistingFileIndex = (
  files: Data[`files`],
  originalFilePath: DOCXFile[`filePath`],
) => files.findIndex(f => f.file.filePath === originalFilePath)

const getFile = (originalFilePath): BingsuFile | null => database.files.find(f => f.file.filePath === originalFilePath)
const getFiles = (): BingsuFile[] => database.files

const setFile = async (file: DOCXFile, hyperlinks: Hyperlink[]) => {
  const { files } = database
  const { filePath } = file
  const existingIndex = findExistingFileIndex(files, filePath)
  database = {
    ...database,
    files: existingIndex !== -1 ? [
      ...files.slice(0, existingIndex),
      {
        ...files[existingIndex],
        file,
        hyperlinks,
      },
      ...files.slice(existingIndex + 1),
    ] : [
      ...files,
      { file, hyperlinks },
    ],
  }
  Logger.log(`setFile`, database, files)
  save()
}

const setHyperlinks = async (
  originalFilePath: DOCXFile[`filePath`],
  hyperlinks: Hyperlink[],
) => {
  // assumes file already exists in database
  const { files } = database
  const existingIndex = findExistingFileIndex(files, originalFilePath)
  files[existingIndex] = {
    ...files[existingIndex],
    hyperlinks,
  }
  save()
}

const setMaxArchiveAge = (newValue: number) => {
  database = {
    ...database,
    maxArchiveAge: newValue,
  }
  save()
}
const getMaxArchiveAge = () => database.maxArchiveAge

const clear = () => {
  database = { ...initialData }
  save()
}

const Storage = {
  clear,
  getFile,
  getFiles,
  getMaxArchiveAge,
  init,
  setFile,
  setHyperlinks,
  setMaxArchiveAge,
}

export default Storage