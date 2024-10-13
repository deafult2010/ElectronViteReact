import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  openCoderJeet: async () => {
    await ipcRenderer.invoke("openCoderJeet");
  },
  openExplorer: async () => {
    await ipcRenderer.invoke("openExplorer");
  },
  runBat: async (fileName) => {
    await ipcRenderer.invoke("runBat", fileName);
  },
  saveBlob: async (blob, fileName) => {
    let reader = new FileReader()
    reader.onload = function () {
      if (reader.readyState == 2) {
        console.log(reader.result)
        var buffer = new Buffer.from(reader.result)
        ipcRenderer.invoke("saveFile", fileName, buffer)
        console.log(`Saving ${JSON.stringify({ fileName, size: blob.size })}`)
      }
    }
    reader.readAsArrayBuffer(blob)
  },
  uploadBlob: async (blob, fileName, host, remote, user, pass) => {
    let reader = new FileReader()
    reader.onload = function () {
      if (reader.readyState == 2) {
        var buffer = new Buffer.from(reader.result)
        ipcRenderer.invoke("uploadFile", fileName, buffer, host, remote, user, pass)
        console.log(`Saving ${JSON.stringify({ fileName, size: blob.size })}`)
      }
    }
    reader.readAsArrayBuffer(blob)
  },
  // not sure if I need to run these axios requests in main or if I could just run them here in preload
  // TABLEAU SERVER
  login: async (user, pass, url) => {
    const res = await ipcRenderer.invoke('login', user, pass, url)
    return res
  },
  refresh: async (token, url) => {
    const res = await ipcRenderer.invoke('refresh', token, url)
    return res
  },
  data: async (token, url) => {
    const res = await ipcRenderer.invoke('data', token, url)
    return res
  },
  // IRM ICA
  authenicate: async (user, pass, url) => {
    const res = await ipcRenderer.invoke('authenticate', user, pass, url)
    return res
  },
  calcIRM: async (pf, token, url) => {
    const res = await ipcRenderer.invoke('calcIRM', pf, token, url)
    return res
  },
  invokeIRM: async (pf, token, url) => {
    const res = await ipcRenderer.invoke('invokeIRM', pf, token, url)
    return res
  },
  getIRM: async (id, token, url) => {
    const res = await ipcRenderer.invoke('getIRM', id, token, url)
    return res
  },
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}