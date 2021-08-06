import axios from 'axios'

const getArchive = async (url) => {
  try {
    const { data } = await axios.get(`https://archive.org/wayback/available/?url=${url}`)
    const { archived_snapshots } = data
    if(!!archived_snapshots?.closest && !!archived_snapshots?.closest?.url){
      const url = archived_snapshots?.closest?.url
      const timestamp = archived_snapshots?.closest?.timestamp
      const date = new Date(
        Date.UTC(
          timestamp.slice(0, 4),
          timestamp.slice(4, 6)-1,
          timestamp.slice(6, 8),
          timestamp.slice(8, 10),
          timestamp.slice(10, 12),
          timestamp.slice(12),
        ),
      )
      return {
        date,
        url,
      }
    }
  } catch (error){
    console.error(error)
    return false
  }
}

const archiveURL = async (url) => {
  try {
    const { request, status, headers } = await axios.head(`https://web.archive.org/save/${url}`)
    if(status === 200){
      const date = new Date(headers[`x-archive-orig-date`])
      return {
        date,
        url: request.res.responseUrl,
      }
    }
  } catch (error) {
    console.error(error)
    return false
  }
}

const Archiver = {
  archiveURL,
  getArchive,
}

export default Archiver