export const cleanURL = (url: string): string => {
  const urlObject = new URL(url)
  return `${urlObject.hostname.replace(/^www\./, ``)}${urlObject.pathname}`
}