electron      = require 'electron'
proc          = require 'child_process'
app           = electron.app
BrowserWindow = electron.BrowserWindow
Tray          = electron.Tray
clipboard     = electron.clipboard
ipc           = electron.ipcMain
win           = undefined
tray          = undefined
buffers       = []
activeApp     = ""

log = () -> console.log ([].slice.call arguments, 0).join " "

updateActiveApp = () ->
    activeApp = proc.execSync "osascript -e \"tell application \\\"System Events\\\"\" -e \"set n to name of first application process whose frontmost is true\" -e \"end tell\" -e \"do shell script \\\"echo \\\" & n\""
    activeApp = String(activeApp).trim()

activateApp = () ->
    # http://apple.stackexchange.com/questions/36943/how-do-i-automate-a-key-press-in-applescript
    # proc.execSync "osascript -e \"tell application \\\"System Events\\\" to key code 48 using command down\""
    proc.execSync "osascript -e \"tell application \\\"#{activeApp}\\\" to activate\""

toggleWindow = () ->
    if win?.isVisible()
        win.hide()    
        app.dock.hide()        
    else
        showWindow()

showWindow = () ->
    updateActiveApp()
    if win?
        win.show()
        app.dock.show()
    else
        createWindow()

listenClipboard = () ->
    text = clipboard.readText()
    if text != buffers[buffers.length-1]
        buffers.push text
        win?.webContents.send 'reload'
    setTimeout listenClipboard, 500

ipc.on 'get-buffers', (event, arg) => event.returnValue = buffers
ipc.on 'paste', (event, arg) => 
    # activateApp()
    clipboard.writeText arg
    win.close()
    paste = () ->
        proc.exec "osascript -e \"tell application \\\"System Events\\\" to keystroke \\\"v\\\" using command down\""
    setTimeout paste, 200
    
createWindow = ->
    log 'create'
    win = new BrowserWindow
        width:           800
        height:          1200
        titleBarStyle:   'hidden'
        backgroundColor: '#181818'
        maximizable:     true
        minimizable:     false
        fullscreen:      false
        show:            true
    win.loadURL "file://#{__dirname}/../index.html"
    # win.webContents.openDevTools()
    app.dock.show()
    # app.dock.setIcon "#{__dirname}/../../img/clippo.png"
    win.on 'close', (event) ->
        log 'close!'
        activateApp()
        win.hide()
        app.dock.hide()
        event.preventDefault()
    win.on 'closed', -> 
        log 'closed'
        win = null
    win

updateActiveApp()

app.on 'ready', -> 
    
    # tray = new Tray "#{__dirname}/../../img/menu.png"
    tray = new Tray "#{__dirname}/../img/menu.png"
    tray.on 'click', toggleWindow
    app.dock.hide() if app.dock
    electron.globalShortcut.register 'Command+Alt+V', showWindow
    listenClipboard()
    
    
        
