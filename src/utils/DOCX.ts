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

const documentLinksFile = `word/_rels/document.xml.rels` as const
const footnotesLinksFile = `word/_rels/footnotes.xml.rels` as const
const footnotesFile = `word/footnotes.xml`
const documentTextFile = `word/document.xml`

const assembleHyperlinkText = (elementList) => elementList.map((element) => {
  if (`w:t` in element) {
    return (
      element[`w:t`]
        .map((value) => typeof value === `string` ? value : ``)
        .join(``)
    )
  }
  return ``
}).join(``)

const getFootnoteText = async (footnoteContents: string) => {
  const footnotes = {}
  const footnoteXmlContent = await xml2js.parseStringPromise(footnoteContents)
  for (const footnote of footnoteXmlContent[`w:footnotes`][`w:footnote`]) {
    if (`w:p` in footnote) {
      const contents = footnote[`w:p`][0]
      if (`w:hyperlink` in contents) {
        const id = contents[`w:hyperlink`][0][`$`][`r:id`]
        const text = assembleHyperlinkText(contents[`w:hyperlink`][0][`w:r`])
        footnotes[id] = text
      }
    }
  }
  return footnotes
}

const getDocumentText = async (documentContents: string) => {
  const documentHyperlinks = {}
  const documentXmlContent = await xml2js.parseStringPromise(documentContents)
  for (const element of documentXmlContent[`w:document`][`w:body`][0][`w:p`]) {
    if (`w:hyperlink` in element) {
      const id = element[`w:hyperlink`][0][`$`][`r:id`]
      const text = assembleHyperlinkText(element[`w:hyperlink`][0][`w:r`])
      documentHyperlinks[id] = text
    }
  }
}

const getZipFile = (zipEntries: unzip.IZipEntry[], fileName: string) => zipEntries.find(
  ({ entryName }) => (
    entryName === fileName
  ),
)

const isEmptyString = (variable: null | string): boolean => (variable === null || variable.length === 0)

const getAllHyperlinks = async (
  DOCXFile: DOCXFile,
  { document, footnotes = true } = {} as getAllHyperlinksOptions,
// eslint-disable-next-line sonarjs/cognitive-complexity
): Promise<Hyperlink[]> => {
  const { tempPath } = DOCXFile
  const zipFile: unzip = new unzip(tempPath)
  const zipEntries = zipFile.getEntries()

  const footnoteFile = getZipFile(zipEntries, footnotesFile)
  const documentFile = getZipFile(zipEntries, documentTextFile)

  const footnotesObject = footnoteFile
    ? await getFootnoteText(zipFile.readAsText(footnoteFile))
    : {}
  
  const documentObject = documentTextFile
    ? await getDocumentText(zipFile.readAsText(documentFile))
    : {}

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
          const text = file.entryName === documentLinksFile
            ? documentObject[id]
            : footnotesObject[id]
          
          if (isEmptyString(id) || isEmptyString(url) || isEmptyString(text)) {
            return null
          }
          
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
      .filter((hyperlink: Hyperlink | null) => (
        hyperlink !== null
      ))

    hyperlinks.push(...links)
  }

  Logger.log(`Found hyperlinks:`, hyperlinks)

  return hyperlinks
}

const DocumentConvert = {
  closeFile,
  getAllHyperlinks,
  readFile,
}

export default DocumentConvert