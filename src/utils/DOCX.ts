import fs from 'fs'
import path from 'path'
import unzip from 'adm-zip'
import xml2js from 'xml2js'
import crypto from 'crypto'
import Logger from './Logger'

interface DOCXFile {
  filePath: string,
  tempPath: string,
  zipFile: unzip
}

const readFile = async (filePath: string): Promise<DOCXFile> => {
  const ext = path.extname(filePath)
  if (ext !== `.docx`) {
    throw new Error(`readFile only supports .docx files`)
  }

  const dirName = path.dirname(filePath)
  const tempName = crypto.randomBytes(10).toString(`hex`)
  const tempPath = path.join(dirName, `${tempName}.docx`)

  await fs.promises.rename(filePath, tempPath)

  try {

    const zipFile = new unzip(tempPath)

    return {
      filePath,
      tempPath,
      zipFile,
    }
  } catch (error) {
    Logger.log(error)
  }
}

interface getAllHyperlinksOptions {
  document: true,
  footnotes: true
}

type HyperlinkLocation = `document` | `footnotes`

interface Hyperlink {
  id: string,
  url: string,
  location: HyperlinkLocation,
}

const documentLinksFile = `word/_rels.document.xml.rels` as const
const footnotesLinksFile = `word/_rels/footnotes.xml.rels` as const

const getAllHyperlinks = async (
  DOCXFile: DOCXFile,
  { document, footnotes = true } = {} as getAllHyperlinksOptions
): Promise<Hyperlink[]> => {
  const { zipFile } = DOCXFile
  const zipEntries = zipFile.getEntries()

  const files = zipEntries.filter(({ entryName }) => (
    (document && entryName === documentLinksFile) ||
    (footnotes && entryName === footnotesLinksFile)
  ))

  let hyperlinks: Hyperlink[] = []
  for (const file of files) {
    const fileContents = zipFile.readAsText(file)
    const links: Hyperlink[] = (await xml2js.parseStringPromise(fileContents))[`Relationships`].map(
      (relationship): Hyperlink | null => {
        const targetMode = relationship[`$`][`TargetMode`]
        if (targetMode === `External`) {
          const id = relationship[`$`][`Id`]
          const url = relationship[`$`][`Target`]
          return {
            location: file.entryName === documentLinksFile ? `document` : `footnotes`,
            id,
            url
          }
        }
        return null
      })
    .filter((url: Hyperlink | null) => url !== null)
    hyperlinks.push(...links)
  }

  return hyperlinks
}

const DocConvert = {
  readFile,
  getAllHyperlinks,
}

export default DocConvert