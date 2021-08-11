import fs from 'fs'
import path from 'path'
import unzip from 'adm-zip'
import { js2xml, xml2js } from 'xml-js'
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

const hasElements = (element) => Array.isArray(element?.elements) && element.elements.length > 0
const assembleHyperlinkText = (elementList): string => elementList.map(wR => (hasElements(wR)
  ? (wR.elements.filter(element => element?.name === `w:t`).map(element => {
    if (!hasElements(element)) {
      return ``
    }
    return element.elements.map(child => {
      if (child?.type === `text`) {
        return child?.text
      }
      console.log(child)
      return ``
    }).join(``)
  }))
  : ``),
).join(``)

const getHyperlinkText = (hyperlinkElement): string => {
  if (!hasElements(hyperlinkElement)) {
    return ``
  }
  return assembleHyperlinkText(
    hyperlinkElement.elements.filter(
      child => child.name === `w:r` && Array.isArray(child?.elements),
    ),
  )
}

const findElement = (elements, elementName: string) => elements.find(element => element.name === elementName)
const findParagraphElement = (elements) => elements.find(element => element?.name === `w:p`)
const findHyperlinkElement = (elements) => elements.find(element => element?.name === `w:hyperlink`)
const getFootnoteText = (footnoteContents: string) => {
  const footnotes = {}
  const footnoteXmlContent = xml2js(footnoteContents)
  for (const footnote of footnoteXmlContent.elements[0].elements) {
    if (hasElements(footnote)) {
      const wpElement = findParagraphElement(footnote.elements)
      if (wpElement && hasElements(wpElement)) {
        const hyperlinkElement = findHyperlinkElement(wpElement.elements)
        if (hyperlinkElement) {
          const id: string = hyperlinkElement?.attributes[`r:id`]
          const text = getHyperlinkText(hyperlinkElement)
          footnotes[id] = text
        }
      }
    }
  }
  return footnotes
}

const getDocumentText = (documentContents: string) => {
  const documentHyperlinks = {}
  const documentXmlContent = xml2js(documentContents)
  const paragraphElements = documentXmlContent.elements[0].elements[0].elements.filter(
    element => element.name === `w:p` && hasElements(element),
  )
  for (const element of paragraphElements) {
    const hyperlinkElement = findHyperlinkElement(element.elements)
    if (hyperlinkElement) {
      const id: string = hyperlinkElement?.attributes[`r:id`]
      const text = getHyperlinkText(hyperlinkElement)
      documentHyperlinks[id] = text
    }
  }
  return documentHyperlinks
}

const getFileInZip = (zipEntries: unzip.IZipEntry[], fileName: string) => zipEntries.find(
  ({ entryName }) => (
    entryName === fileName
  ),
)

const isEmptyString = (variable: undefined | null | string): boolean => (typeof variable == `undefined` || variable === null || variable.length === 0)
const openZipFile = (file: DOCXFile) => {
  const zipFile = new unzip(file.tempPath)
  const zipEntries = zipFile.getEntries()
  return { zipEntries, zipFile }
}

const getAllHyperlinks = (
  DOCXFile: DOCXFile,
  { document, footnotes = true } = {} as getAllHyperlinksOptions,
// eslint-disable-next-line sonarjs/cognitive-complexity
): Hyperlink[] => {
  const { zipFile, zipEntries } = openZipFile(DOCXFile)
  const footnoteFile = getFileInZip(zipEntries, footnotesFile)
  const documentFile = getFileInZip(zipEntries, documentTextFile)

  const footnotesObject = footnoteFile
    ? getFootnoteText(zipFile.readAsText(footnoteFile))
    : {}
  
  const documentObject = documentTextFile
    ? getDocumentText(zipFile.readAsText(documentFile))
    : {}

  const files = zipEntries.filter(({ entryName }) => (
    (document && entryName === documentLinksFile) ||
    (footnotes && entryName === footnotesLinksFile)
  ))

  const hyperlinks: Hyperlink[] = []
  for (const file of files) {
    const fileContents = zipFile.readAsText(file)
    const xmlContent = xml2js(fileContents)
    const links: Hyperlink[] = xmlContent.elements[0].elements.map(
      (relationship): Hyperlink | null => {
        const { attributes: { Target, TargetMode } } = relationship
        if (TargetMode === `External` && Target) {
          const { attributes: { Id } } = relationship
          const isDocumentFile = file.entryName === documentLinksFile
          const text = isDocumentFile
            ? documentObject[Id]
            : footnotesObject[Id]

          if (!isEmptyString(Id) && !isEmptyString(Target) && !isEmptyString(text)) {
            return {
              id: Id,
              location: isDocumentFile ? `document` : `footnotes`,
              status: `UNPROCESSED`,
              text,
              url: Target,
            }
          }
        }
        return null
    }).filter((hyperlink: Hyperlink | null) => (hyperlink !== null))

    hyperlinks.push(...links)
  }

  Logger.log(`Found hyperlinks:`, hyperlinks)

  return hyperlinks
}

const saveContentToFile = (zipFile: unzip, content, filePath: string): void => {
  const xml = js2xml(content)
  zipFile.addFile(filePath, Buffer.from(xml, `utf-8`))
}

const addArchivedLink = async (DOCXFile: DOCXFile, hyperlink: Hyperlink, url: string) => {
  const { zipFile, zipEntries } = openZipFile(DOCXFile)

  const { id, location } = hyperlink

  const filePath = location === `document` ? documentTextFile : footnotesFile
  const file = getFileInZip(zipEntries, filePath)
  const fileContent = xml2js(zipFile.readAsText(file))

  if (location === `document`) {
    const elements = fileContent.elements[0].elements[0].elements
    const elementIndex = elements.findIndex(element => {
      if (element?.name === `w:p` && hasElements(element)) {
        return element.elements.some(child => (child.name === `w:hyperlink` && child.attributes[`r:id`] === id))
      }
      return false
    })
    if (elementIndex === -1) {
      console.log(`No such hyperlink ID`)
      console.log(JSON.stringify(elements, null, 2))
      return
    }
    const hyperlinkIndex = elements[elementIndex].elements.findIndex(({ name }) => name === `w:hyperlink`)
    // TODO: insert footnote
    // elements[elementIndex].elements = [
    //   ...elements[elementIndex].elements.slice(0, hyperlinkIndex+1),
    //   {
    //     elements: [
    //       {
    //         attributes: { 'xml:space': `preserve` },
    //         elements: [ { text: ` (archive)`, type: `text` } ],
    //         name: `w:t`,
    //         type: `element`,
    //       },
    //     ],
    //     name: `w:r`,
    //     type: `element`,
    //   },
    //   ...elements[elementIndex].elements.slice(hyperlinkIndex + 1),
    // ]
  } else if (location === `footnotes`) {}
  
  saveContentToFile(zipFile, fileContent, filePath)
  await zipFile.writeZip(DOCXFile.tempPath)
}

const test = async () => {
  const file = await readFile(`./playground/Test.docx`)
  const hyperlink = {
    id: `rId6`,
    location: `document`,
  } as Hyperlink
  
  // const { zipFile, zipEntries } = openZipFile(file)
  // const documentXmlContent = zipFile.readAsText(
  //   getFileInZip(zipEntries, documentTextFile),
  // )
  // return xml2js(documentXmlContent)

  await addArchivedLink(file, hyperlink, `test`)

  await closeFile(file)

  // return getAllHyperlinks(file)
}

const DocumentConvert = {
  addArchivedLink,
  closeFile,
  getAllHyperlinks,
  readFile,
  saveContentToFile,
  test,
}

export default DocumentConvert