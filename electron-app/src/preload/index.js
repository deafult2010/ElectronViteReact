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
  }
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