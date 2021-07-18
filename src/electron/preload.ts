import { contextBridge } from 'electron'
import bridgeApi from './bridge'

contextBridge.exposeInMainWorld('bridgeApi', bridgeApi)