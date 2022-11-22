process.env.DIST_ELECTRON = join(__dirname, '..')
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist')
process.env.PUBLIC = app.isPackaged ? process.env.DIST : join(process.env.DIST_ELECTRON, '../public')

import {app, BrowserWindow, dialog, ipcMain, shell} from 'electron'
import {release} from 'os'
import {join} from 'path'
import youtubeDl from 'youtube-dl-exec'

if (release().startsWith('6.1')) app.disableHardwareAcceleration()

if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

let mainWin: BrowserWindow | null = null
const preload = join(__dirname, '../preload/index.js')
const url = process.env.VITE_DEV_SERVER_URL
const indexHtml = join(process.env.DIST, 'index.html')

async function createMainWindow() {
  mainWin = new BrowserWindow({
    title: 'Youtube Downloader',
    icon: join(process.env.PUBLIC, 'icon.png'),
    show: false,
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
    width: 800,
    height: app.isPackaged ? 550 : 850,
    minWidth: 700,
    minHeight: 450,
  })

  mainWin.setMenu(null)

  if (app.isPackaged) {
    mainWin.loadFile(indexHtml)
  } else {
    mainWin.loadURL(url)
    mainWin.webContents.openDevTools();
  }

  // Make all links open with the browser, not with the application
  mainWin.webContents.setWindowOpenHandler(({url}) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return {action: 'deny'}
  })

  mainWin.on('ready-to-show', () => mainWin.show())
}

app.whenReady().then(createMainWindow)

app.on('window-all-closed', () => {
  mainWin = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (mainWin) {
    // Focus on the main window if the user tried to open another
    if (mainWin.isMinimized()) mainWin.restore()
    mainWin.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createMainWindow()
  }
})

ipcMain.handle('open-win', (event, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (app.isPackaged) {
    childWindow.loadFile(indexHtml, {hash: arg})
  } else {
    childWindow.loadURL(`${url}#${arg}`)
    // childWindow.webContents.openDevTools({ mode: "undocked", activate: true })
  }
})

ipcMain.handle('open-directory', async () => {
  let {canceled, filePaths} = await dialog.showOpenDialog(mainWin, {
    properties: ['openDirectory']
  })

  return {
    canceled,
    path: filePaths[0] ?? null
  };
});

ipcMain.handle('get-path', (event, name) => {
  return app.getPath(name)
});

ipcMain.handle('get-video-info', async (event, url) => {
  const result = await youtubeDl(url, {
    dumpSingleJson: true,
    noCheckCertificates: true,
    noWarnings: true,
  })

  // @ts-ignore
  const video = result.requested_formats[0];
  // @ts-ignore
  const audio = result.requested_formats[1];

  return {
    id: result.id,
    title: result.title,
    description: result.description,
    thumbnail: result.thumbnail,
    video: {
      codec: video.vcodec,
      fileSize: video.filesize,
      formatNote: video.format_note,
    },
    audio: {
      codec: audio.acodec,
      fileSize: audio.filesize,
      bitRate: audio.abr,
    }
  }
});

ipcMain.on('download-video', async (event, options) => {
  const process = youtubeDl.exec(options.url, {
    output: options.downloadDirectory + '/v'
  })
  process.stdout.addListener('data', (chunk) => {
    mainWin.webContents.send('download-process', chunk.toString())
  })
})

let aboutWin: BrowserWindow | null = null;

async function createAboutWindows() {
  if (aboutWin) return;

  const modalPath = app.isPackaged
      ? `file://${indexHtml}#about`
      : `${url}#/about`

  aboutWin = new BrowserWindow({
    parent: mainWin,
    title: 'О программе',
    show: false,
    modal: true,
    movable: false,
    width: 400,
    height: 350,
    resizable: false,
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  aboutWin.on('close', function () {
    aboutWin = null
  })

  aboutWin.setMenu(null)
  aboutWin.loadURL(modalPath)

  // Make all links open with the browser, not with the application
  aboutWin.webContents.setWindowOpenHandler(({url}) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return {action: 'deny'}
  })

  aboutWin.on('ready-to-show', () => aboutWin.show())
}

ipcMain.on('show-about', createAboutWindows)