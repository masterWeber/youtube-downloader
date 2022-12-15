import {StreamSelector} from './StreamSelector'
import {app, BrowserWindow, dialog, ipcMain, shell} from 'electron'
import {release} from 'os'
import {join} from 'path'
import youtubeDl from 'youtube-dl-exec'
import {Info} from './Info'
import {DownloadOptions} from './DownloadOptions'
import {Channel} from '../common/Channel'
import {DownloadManager} from '../download/DownloadManager'
import {DownloadTask} from '../download/DownloadTask'
import {YouTubeApiClient} from '../download/client/YouTubeApiClient'
import {DownloadTaskId} from '../download/DownloadTaskId'

process.env.DIST_ELECTRON = join(__dirname, '..')
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist')
process.env.PUBLIC = app.isPackaged ? process.env.DIST : join(process.env.DIST_ELECTRON, '../public')

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
    mainWin.webContents.openDevTools()
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

ipcMain.handle(Channel.DIALOG_OPEN_DIRECTORY, async () => {
  let {canceled, filePaths} = await dialog.showOpenDialog(mainWin, {
    properties: ['openDirectory'],
  })

  return {
    canceled,
    path: filePaths[0] ?? null,
  }
})

ipcMain.handle(Channel.SYSTEM_GET_PATH, (event, name) => {
  return app.getPath(name)
})

ipcMain.on(Channel.SYSTEM_SHOW_ITEM_IN_FOLDER, (event, fullPath) => {
  return shell.showItemInFolder(fullPath)
})

ipcMain.handle(Channel.STREAM_INFO, async (event, options: DownloadOptions) => {
  const result = await youtubeDl(options.url, {
    dumpSingleJson: true,
    noCheckCertificates: true,
    noWarnings: true,
  })

  const formatSelector = new StreamSelector()
  const muxedStreamInfo = formatSelector.selectFormat(result.formats, options)

  return new Info(
      result.id,
      result.title,
      result.description,
      result.thumbnail,
      muxedStreamInfo,
  )
})

const downloadManager = new DownloadManager(1)
downloadManager.onProgress = (progress: number, task: DownloadTask) => {
  mainWin.webContents.send(Channel.DM_PROGRESS, {
    id: task.id.value,
    value: progress,
  })
}

downloadManager.onFinished = (output: string, task: DownloadTask) => {
  mainWin.webContents.send(Channel.DM_FINISHED, {
    id: task.id.value,
    output: output,
  })
}

ipcMain.on(Channel.DM_MAX_ACTIVE_DOWNLOADS, async (event, maxActiveDownloads) => {
  downloadManager.maxActiveDownloads = maxActiveDownloads
})

ipcMain.on(Channel.DM_START, async (event, taskData) => {
  const task = DownloadTask.create(
      taskData.id,
      taskData.streamId,
      taskData.url,
      taskData.destination,
      new YouTubeApiClient(youtubeDl),
  )

  downloadManager.add(task)
})

ipcMain.on(Channel.DM_PAUSE, async (event, taskId) => {
  downloadManager.pause(
      new DownloadTaskId(taskId),
  )
})

ipcMain.on(Channel.DM_STOP, async (event, taskId) => {
  downloadManager.stop(
      new DownloadTaskId(taskId),
  )
})

let aboutWin: BrowserWindow | null = null

async function createAboutWindows() {
  if (aboutWin) return

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

ipcMain.on(Channel.DIALOG_ABOUT, createAboutWindows)