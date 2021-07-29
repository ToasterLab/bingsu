import os from 'os'

export const isWSL = () => os.platform() === `linux` && os.release().includes(`microsoft`)

export const isMacOS = () => process.platform === `darwin`

export const isWindows = () => process.platform === `win32`

export const isLinux = () => process.platform === `linux`

export const getOS = (): OS => {
  if (isWSL()) {
    return `WSL`
  } else if (isMacOS()) {
    return `macOS`
  } else if (isWindows()) {
    return `Windows`
  } else if(isLinux()) {
    return `Linux`
  }
}
