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

  const fileName = path.basename(filePath)
  const directoryName = path.dirname(filePath)
  const temporaryName = crypto.randomBytes(10).toString(`hex`)
  const temporaryPath = path.join(directoryName, `${temporaryName}.docx`)

  await fs.promises.rename(filePath, temporaryPath)

  try {
    return {
      directoryName,
      fileName,
      filePath,
      tempPath: temporaryPath,
    }
  } catch (error) {
    Logger.log(error)
  }
}

const closeFile = async (DOCXFile: DOCXFile): Promise<void> => {
  const { filePath, tempPath } = DOCXFile
  await fs.promises.copyFile(tempPath, filePath)
  await fs.promises.unlink(tempPath)
  // await zipFile.writeZip(filePath)
  // const zipFile: unzip = new unzip(temporaryPath)
}

interface getAllHyperlinksOptions {
  document: true,
  footnotes: true
}

const documentLinksFile = `word/_rels.document.xml.rels` as const
const footnotesLinksFile = `word/_rels/footnotes.xml.rels` as const
const footnotesFile = `word/footnotes.xml`

const getAllHyperlinks = async (
  DOCXFile: DOCXFile,
  { document, footnotes = true } = {} as getAllHyperlinksOptions,
): Promise<Hyperlink[]> => {
  const { tempPath } = DOCXFile
  const zipFile: unzip = new unzip(tempPath)
  const zipEntries = zipFile.getEntries()

  const footnotesObject = {}
  const footnoteFile = zipEntries.find(({ entryName }) => (
    entryName === footnotesFile
  ))
  if (footnoteFile) {
    const footnoteContents = zipFile.readAsText(footnoteFile)
    const footnoteXmlContent = await xml2js.parseStringPromise(footnoteContents)
    for (const footnote of footnoteXmlContent[`w:footnotes`][`w:footnote`]) {
      if (`w:p` in footnote) {
        const contents = footnote[`w:p`][0]
        if (`w:hyperlink` in contents) {
          const id = contents[`w:hyperlink`][0][`$`][`r:id`]
          const text = contents[`w:hyperlink`][0][`w:r`].map((element) => {
            if (`w:t` in element) {
              return (
                element[`w:t`]
                  .map((value) => typeof value === `string` ? value : ``)
                  .join(``)
              )
            }
          }).join(``)
          footnotesObject[id] = text
        }
      }
    }
  }

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
          const text = footnotesObject[id]
          return {
            id,
            location: file.entryName === documentLinksFile ? `document` : `footnotes`,
            status: `UNPROCESSED`,
            text,
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