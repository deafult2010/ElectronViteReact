import { app, shell, BrowserWindow, ipcMain, webContents } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import child from 'child_process'
import fs from 'fs-extra'
import SFTPClient from 'ssh2-sftp-client'

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      nodeIntegration: true,
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  // //If you need devtools in production uncomment the below four lines:
  // const devtools = new BrowserWindow()
  // mainWindow.loadURL('https://github.com')
  // mainWindow.webContents.setDevToolsWebContents(devtools.webContents)
  // mainWindow.webContents.openDevTools({ mode: 'detach' })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

ipcMain.handle("openCoderJeet", () => {
  shell.openExternal("https://youtube.com")
});
ipcMain.handle("openExplorer", () => {
  // shell.openExternal("file://c:/windows/explorer.exe")
  child.execFile("c:\\windows\\explorer.exe", ["c:\\"], (err, data) => {
    if (err) {
      console.log(err)
      return
    }
    console.log(data.toString())
  })
});

// code to copy a file
ipcMain.handle("runBat", (e, fileName) => {
  console.log('123')
  console.log(fileName)
  const sourcePath = `C:\\Users\\thoma\\Downloads\\${fileName}`;
  const destinationPath = 'C:\\Users\\thoma\\OneDrive\\Desktop\\Projects';
  child.execFile('cmd', ['/c', 'copy', sourcePath, destinationPath], (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return;
    }

    console.log('File copied successfully!');
  })
});

ipcMain.handle("saveFile", (event, path, buffer) => {
  fs.outputFile(path, buffer, err => {
    if (err) {
      console.log(err.message)
    } else {
      console.log(`file saved here ${path}`)
    }
  })
})

ipcMain.handle("uploadFile", (event, path, buffer, host, remote, user, pass) => {
  fs.outputFile(path, buffer, err => {
    if (err) {
      console.log(err.message)
    } else {
      console.log(`file saved here ${path}`)
      // add ssh code here
      const config = {
        host: host,
        port: 22,
        username: user,
        password: pass
      };
      const client = new SFTPClient();
      client.connect(config)
        .then(() => {
          return client.put(path, remote);
        })
        .then(() => {
          return client.end();
        })
        .catch(err => {
          console.error(err.message);
        });
    }
  })
})