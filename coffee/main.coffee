electron      = require('electron')
app           = electron.app
BrowserWindow = electron.BrowserWindow
Tray          = electron.Tray
clipboard     = electron.clipboard
ipc           = electron.ipcMain
win           = undefined
buffers       = []

toggleWindow = () ->
    if win?
        if win.isVisible()
            # console.log 'hide'
            win.hide()
        else
            # console.log 'show'
            win.show()
    else
        # console.log 'new'
        createWindow()
        win.show()

listenClipboard = () ->
    text = clipboard.readText()
    if text != buffers[buffers.length-1]
        buffers.push text
        win?.webContents.send 'reload'
    setTimeout listenClipboard, 1000

ipc.on 'get-buffers', (event, arg) => event.returnValue = buffers

createWindow = ->
    win = new BrowserWindow
        width:           800
        height:          1200
        titleBarStyle:   'hidden'
        backgroundColor: '#181818'
        maximizable:     true
        minimizable:     false
        fullscreen:      false
        show:            false
    win.loadURL "file://#{__dirname}/../index.html"
    # mainWindow.webContents.openDevTools()
    win.on 'closed', -> 
        # console.log 'closed'
        win = null
    win

app.on 'window-all-closed', -> app.quit() if process.platform != 'darwin'
app.on 'activate',          -> createWindow() if win == null

app.on 'ready', () -> 
    
    tray = new Tray('./img/menu.png')
    tray.on 'click', toggleWindow
    app.dock.hide() if app.dock
    
    electron.globalShortcut.register 'Command+Alt+V', toggleWindow

    createWindow()
    listenClipboard()
    
        
