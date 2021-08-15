export const cleanURL = (url: string): string => {
  const urlObject = new URL(url)
  return `${urlObject.hostname.replace(/^www\./, ``)}${urlObject.pathname}`
}

export const isArchiveLink = (url: string): boolean => (
  url.startsWith(`https://web.archive.org/web/`)
)