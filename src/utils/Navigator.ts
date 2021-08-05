const navigateTo = (path: string) => {
  window.location.replace(`#/${path}/`)
}

const Navigator = {
  navigateTo,
}

export default Navigator