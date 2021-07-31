// to be used only on the browser side
// this decision has been made to avoid the
// need to write getter and setter code that goes
// through electron's IPC communication

import Logger from './Logger'

type Data = {
  files: BingsuFile[],
}

const initialData: Data = {
  files: [],
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
  if (existingIndex !== -1) {
    database = {
      ...database,
      files: [
        ...files.slice(0, existingIndex),
        {
          ...files[existingIndex],
          file,
          hyperlinks,
        },
        ...files.slice(existingIndex + 1),
      ],
    }
  } else {
    database.files = [
      ...files,
      { file, hyperlinks },
    ]
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

const clear = () => {
  database = { ...initialData }
  save()
}

const Storage = {
  clear,
  getFile,
  getFiles,
  init,
  setFile,
  setHyperlinks,
}

export default Storage