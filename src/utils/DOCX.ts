import fs from 'fs'
import path from 'path'
import unzip from 'adm-zip'
import xml2js from 'xml2js'
import crypto from 'crypto'
import Logger from './Logger'

const readFile = async (filePath: string): Promise<DOCXFile> => {
  const extension = path.extname(filePath)
  if (extension !== `.docx`) {
    throw new Error(`readFile only supports .docx files`)
  }

  const directoryName = path.dirname(filePath)
  const temporaryName = crypto.randomBytes(10).toString(`hex`)
  const temporaryPath = path.join(directoryName, `${temporaryName}.docx`)

  await fs.promises.rename(filePath, temporaryPath)

  try {

    const zipFile = new unzip(temporaryPath)

    return {
      filePath,
      tempPath: temporaryPath,
      zipFile,
    }
  } catch (error) {
    Logger.log(error)
  }
}

const closeFile = async (DOCXFile: DOCXFile): Promise<void> => {
  const { tempPath, zipFile, filePath } = DOCXFile
  await fs.promises.unlink(tempPath)
  await zipFile.writeZip(filePath)
}

interface getAllHyperlinksOptions {
  document: true,
  footnotes: true
}

const documentLinksFile = `word/_rels.document.xml.rels` as const
const footnotesLinksFile = `word/_rels/footnotes.xml.rels` as const

const getAllHyperlinks = async (
  DOCXFile: DOCXFile,
  { document, footnotes = true } = {} as getAllHyperlinksOptions,
): Promise<Hyperlink[]> => {
  const { zipFile } = DOCXFile
  const zipEntries = zipFile.getEntries()

  const files = zipEntries.filter(({ entryName }) => (
    (document && entryName === documentLinksFile) ||
    (footnotes && entryName === footnotesLinksFile)
  ))

  const hyperlinks: Hyperlink[] = []
  for (const file of files) {
    const fileContents = zipFile.readAsText(file)
    const xmlContent = await xml2js.parseStringPromise(fileContents)
    const links: Hyperlink[] = xmlContent[`Relationships`][`Relationship`].map(
      (relationship): Hyperlink | null => {
        const targetMode = relationship[`$`][`TargetMode`]
        if (targetMode === `External`) {
          const id = relationship[`$`][`Id`]
          const url = relationship[`$`][`Target`]
          return {
            id,
            location: file.entryName === documentLinksFile ? `document` : `footnotes`,
            url,
          }
        }
        return null
      })
    .filter((url: Hyperlink | null) => url !== null)
    hyperlinks.push(...links)
  }

  return hyperlinks
}

const DocumentConvert = {
  closeFile,
  getAllHyperlinks,
  readFile,
}

export default DocumentConvert