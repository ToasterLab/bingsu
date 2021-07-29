// to be used only on the browser side
// this decision has been made to avoid the
// need to write getter and setter code that goes
// through electron's IPC communication

import Logger from './Logger'

interface BingsuFile {
  // use original path as unique ID
  file: DOCXFile,
  hyperlinks?: Hyperlink[]
}

type Data = {
  files: BingsuFile[],
}

const initialData: Data = {
  files: [],
}

const databaseName = `bingsu_db`

let database = {} as Data

const init = () => {
  const data = localStorage.getItem(databaseName)
  database = data === null ? initialData : JSON.parse(data)
}

const save = () => localStorage.setItem(databaseName, JSON.stringify(database))

const findExistingFileIndex = (
  files: Data[`files`],
  originalFilePath: DOCXFile[`filePath`],
) => files.findIndex(f => f.file.filePath === originalFilePath)

const getFile = (originalFilePath) => database.files.find(f => f.file.filePath === originalFilePath)

const setFile = async (file: DOCXFile, hyperlinks: Hyperlink[]) => {
  const { files } = database
  const { filePath } = file
  const existingIndex = findExistingFileIndex(files, filePath)
  if (existingIndex) {
    files[existingIndex] = {
      ...files[existingIndex],
      file,
      hyperlinks,
    }
  } else {
    files.push({ file, hyperlinks })
  }
  Logger.log(`setFile`, database)
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

const Storage = {
  getFile,
  init,
  setFile,
  setHyperlinks,
}

export default Storage