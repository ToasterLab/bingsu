import fs from 'fs'
import path from 'path'
import unzip from 'adm-zip'
import { js2xml, xml2js } from 'xml-js'
import crypto from 'crypto'
import Logger from './Logger'
import { isArchiveLink } from './Utils'

const NODE = {
  Relationship: { name: `Relationship`, type: `element` },
  footnote: { name: `w:footnote`, type: `element` },
  footnoteRef: { name: `w:footnoteRef`, type: `element` },
  footnoteReference: { name: `w:footnoteReference`, type: `element` },
  hyperlink: { name: `w:hyperlink`, type: `element` },
  p: { name: `w:p`, type: `element` },
  pPr: { name: `w:pPr`, type: `element` },
  pStyle: { name: `w:pStyle`, type: `element` },
  r: { name: `w:r`, type: `element` },
  rPr: { name: `w:rPr`, type: `element` },
  rStyle: { name: `w:rStyle`, type: `element` },
  t: { name: `w:t`, type: `element` },
  text: { type: `text` },
} as const

const ATTRIBUTES = {
  footnoteReference: { 'w:val': `FootnoteReference` },
  footnoteText: { 'w:val': `FootnoteText` },
  spacePreserve: { 'xml:space': `preserve` },
} as const

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

const makeTextElement = (text: string) => ({
  ...NODE.t,
  elements: [ { ...NODE.text, text } ],
})
const makeRElementTextChild = (text: string) => ({
  ...NODE.r,
  elements: [makeTextElement(text)],
})

const makeHyperlinkRelationship = (id: string, url: string) => ({
  ...NODE.Relationship,
  attributes: {
    Id: id,
    Target: url,
    TargetMode: `External`,
    Type: `http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink`,
  },
})

// note that this mutates word/_rels/footnotes.xml.rels
const addFootnoteHyperlinkRelationship = (
  zipFile: unzip,
  zipEntries: unzip.IZipEntry[],
  url: string,
) => {
  const footnoteRelationshipFile = getFileInZip(
    zipEntries,
    footnotesLinksFile,
  )
  const footnoteRelationshipFileContents = zipFile.readAsText(
    footnoteRelationshipFile,
  )
  const xmlContent = xml2js(footnoteRelationshipFileContents)
  const relationships = xmlContent.elements[0].elements
  const allIds = relationships.map(relationship => (
    relationship?.attributes?.Id ? relationship.attributes.Id : null
  )).filter(relationship => relationship !== null)
  const newIdValue = Math.max(...allIds.map(id => Number.parseInt(id.slice(3)))) + 1
  const newId = `rId${newIdValue}`
  xmlContent.elements[0].elements = [
    makeHyperlinkRelationship(newId, url),
    ...relationships,
  ]
  saveContentToFile(
    zipFile,
    xmlContent,
    footnotesLinksFile,
  )
  return newId
}

const makeHyperlinkElement = (id: string, text: string) => ({
  ...NODE.hyperlink,
  attributes: {
    "r:id": id,
  },
  elements: [
    {
      ...NODE.r,
      elements: [
        {
          ...NODE.rPr,
          elements: [
            {
              ...NODE.rStyle,
              attributes: {
                "w:val": `Hyperlink`,
              },
            },
          ],
        },
        makeTextElement(text),
      ],
    },
  ],
})

const randomParaId = (): string => crypto.randomBytes(4).toString(`hex`).toUpperCase()

// the footnote in the footnotes.xml file
const makeFootnote = (footnoteId: string, content: any[]) => ({
  ...NODE.footnote,
  attributes: {
    'w:id': footnoteId,
  },
  elements: [
    {
      ...NODE.p,
      elements: [
        {
          ...NODE.pPr,
          elements: [
            { ...NODE.pStyle, attributes: { ...ATTRIBUTES.footnoteText } },
          ],
        },
        {
          ...NODE.r,
          elements: [
            {
              ...NODE.rPr,
              elements: [
                { ...NODE.rStyle, attributes: { ...ATTRIBUTES.footnoteReference } },
              ],
            },
            { ...NODE.footnoteRef },
          ],
        },
        {
          ...NODE.r,
          elements: [
            { ...NODE.t, attributes: { ...ATTRIBUTES.spacePreserve } },
          ],
        },
        ...content,
      ],
    },
  ],
})

// the referece in the document.xml file
const makeFootnoteReference = (footnoteId: string) => ({
  ...NODE.r,
  elements: [
    {
      ...NODE.rPr,
      elements: [
        { ...NODE.rStyle, attributes: { ...ATTRIBUTES.footnoteReference } },
      ],
    },
    { ...NODE.footnoteReference, attributes: { 'w:id': footnoteId } },
  ],
})
const getFootnoteId = (element): number => {
  if (element.name === NODE.r.name && hasElements(element)) {
    const lastElement = element.elements[element.elements.length - 1]
    if (lastElement.name === NODE.footnoteReference.name &&
      `attributes` in lastElement && `w:id` in lastElement.attributes) {
      return Number(lastElement.attributes[`w:id`])
    }
  }
  return -1
}

// note that this mutates word/footnotes.xml
const addFootnoteRelationship = (
  zipFile: unzip,
  zipEntries: unzip.IZipEntry[],
  content: any[],
): string => {
  const footnoteFileContents = zipFile.readAsText(
    getFileInZip(zipEntries, footnotesFile),
  )
  const xmlContent = xml2js(footnoteFileContents)
  const footnotes = xmlContent.elements[0].elements
  const allIds = footnotes.map(footnote => (
    footnote?.attributes[`w:id`] ? footnote.attributes[`w:id`] : null
  )).filter(footnote => footnote !== null)
  const newId = Math.max(...allIds.map(id => Number.parseInt(id))) + 1
  xmlContent.elements[0].elements = [
    ...footnotes,
    makeFootnote(`${newId}`, content),
  ]
  saveContentToFile(
    zipFile,
    xmlContent,
    footnotesFile,
  )
  return `${newId}`
}

const updateFootnoteRelationship = (
  zipFile: unzip,
  zipEntries: unzip.IZipEntry[],
  footnoteId: string,
  content: any[],
) => {
  const footnoteFileContents = zipFile.readAsText(
    getFileInZip(zipEntries, footnotesFile),
  )
  const xmlContent = xml2js(footnoteFileContents)
  const footnotes = xmlContent.elements[0].elements
  const footnoteIndex = footnotes.findIndex(element => {
    if (element.name === NODE.footnote.name && `attributes` in element &&
      hasElements(element)) {
      // check ID
    }
  })
  xmlContent.elements[0].elements = [
    ...footnotes,
  ]
}

// TODO: make addArchivedLink idempotent
const addArchivedLink = async (DOCXFile: DOCXFile, hyperlink: Hyperlink, url: string) => {
  const { zipFile, zipEntries } = openZipFile(DOCXFile)

  const { id, location } = hyperlink

  const filePath = location === `document` ? documentTextFile : footnotesFile
  const file = getFileInZip(zipEntries, filePath)
  const fileContent = xml2js(zipFile.readAsText(file))

  if (location === `document`) {
    const elements = fileContent.elements[0].elements[0].elements
    const elementIndex = elements.findIndex(element => {
      if (element?.name === NODE.p.name && hasElements(element)) {
        return element.elements.some(child => (child.name === NODE.hyperlink.name && child.attributes[`r:id`] === id))
      }
      return false
    })
    if (elementIndex === -1) {
      console.log(`No such hyperlink ID`)
      console.log(JSON.stringify(elements, null, 2))
      return
    }
    const hyperlinkIndex = elements[elementIndex].elements.findIndex(({ name }) => name === NODE.hyperlink.name)
    
    const existingFootnoteReference = [
      ...elements[elementIndex].elements.slice(hyperlinkIndex + 1, hyperlinkIndex + 2),
    ]
    if (existingFootnoteReference.length === 1) {
      const footnoteId = getFootnoteId(existingFootnoteReference[0])
      if (footnoteId !== -1) {
        // just update the footnote
        updateFootnoteRelationship(zipFile, zipEntries, `${footnoteId}`, [])
        return
      }
    }
    const hyperlinkId = addFootnoteHyperlinkRelationship(zipFile, zipEntries, url)
    const footnoteContent = [
      makeHyperlinkElement(hyperlinkId, `[archive]`),
    ]
    const footnoteId = addFootnoteRelationship(
      zipFile,
      zipEntries,
      footnoteContent,
    )
    elements[elementIndex].elements = [
      ...elements[elementIndex].elements.slice(0, hyperlinkIndex + 1),
      makeFootnoteReference(footnoteId),
      ...elements[elementIndex].elements.slice(hyperlinkIndex + 1),
    ]
  } else if (location === `footnotes`) {
    const elements = fileContent.elements[0].elements
    for (const footnote of elements) {
      if (footnote?.name === `w:footnote` && hasElements(footnote)) {
        for (const paragraph of footnote.elements) {
          if (paragraph?.name === `w:p` && hasElements(paragraph)) {
            for (const [childIndex, child] of paragraph.elements.entries()) {
              if (child?.name === `w:hyperlink` && child?.attributes[`r:id`] === id) {
                const hyperlinkId = addFootnoteHyperlinkRelationship(
                  zipFile,
                  zipEntries,
                  url,
                )

                const existingHyperlink = [...paragraph.elements.slice(childIndex + 2, childIndex + 3)]
                if (existingHyperlink.length === 1 && existingHyperlink[0].name === `w:hyperlink` && assembleHyperlinkText(existingHyperlink[0]) === `[archive]`) {
                  // exists, so do nothing
                } else {
                  paragraph.elements = [
                    ...paragraph.elements.slice(0, childIndex + 1),
                    makeRElementTextChild(` `),
                    makeHyperlinkElement(hyperlinkId, `[archive]`),
                    ...paragraph.elements.slice(childIndex + 1),
                  ]
                }
              } 
            }
          }
        }
      }
    }
  }
  
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

  await addArchivedLink(file, hyperlink, `https://example.org`)

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