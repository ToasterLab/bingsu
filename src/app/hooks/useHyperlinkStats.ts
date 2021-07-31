import { useMemo } from 'react'

const useHyperlinkStats = (hyperlinks) => {
  const {
    erroredHyperlinks,
    progressPercentage,
    processedHyperlinks,
    totalHyperlinks,
  } = useMemo(() => {
    const processedHyperlinks = hyperlinks.filter(h => [`NEW`, `EXISTS`].includes(h.status)).length
    const erroredHyperlinks = hyperlinks.filter(h => h.status === `ERROR`).length
    const totalHyperlinks = hyperlinks.length
    return {
      erroredHyperlinks,
      processedHyperlinks,
      progressPercentage: (((processedHyperlinks + erroredHyperlinks) / totalHyperlinks) * 100) || 0,
      totalHyperlinks,
    }
  }, [hyperlinks])

  return {
    erroredHyperlinks,
    processedHyperlinks,
    progressPercentage,
    totalHyperlinks,
  }
}

export default useHyperlinkStats