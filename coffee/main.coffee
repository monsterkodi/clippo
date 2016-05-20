# 00     00   0000000   000  000   000
# 000   000  000   000  000  0000  000
# 000000000  000000000  000  000 0 000
# 000 0 000  000   000  000  000  0000
# 000   000  000   000  000  000   000

electron      = require 'electron'
proc          = require 'child_process'
app           = electron.app
BrowserWindow = electron.BrowserWindow
Tray          = electron.Tray
Menu          = electron.Menu
clipboard     = electron.clipboard
ipc           = electron.ipcMain
win           = undefined
tray          = undefined
buffers       = [] # ( String(a) for a in [0...22] )
activeApp     = ""

log = () -> console.log ([].slice.call arguments, 0).join " "

# 0000000    0000000  000000000  000  000   000  00000000
#000   000  000          000     000  000   000  000     
#000000000  000          000     000   000 000   0000000 
#000   000  000          000     000     000     000     
#000   000   0000000     000     000      0      00000000

getActiveApp = () ->
    appName = proc.execSync "osascript -e \"tell application \\\"System Events\\\"\" -e \"set n to name of first application process whose frontmost is true\" -e \"end tell\" -e \"do shell script \\\"echo \\\" & n\""
    appName = String(appName).trim()    

updateActiveApp = () -> 
    appName = getActiveApp()
    if appName != app.getName() and appName != "Electron"
        activeApp = appName

activateApp = () ->
    # http://apple.stackexchange.com/questions/36943/how-do-i-automate-a-key-press-in-applescript
    # proc.execSync "osascript -e \"tell application \\\"System Events\\\" to key code 48 using command down\""
    if activeApp.length
        proc.execSync "osascript -e \"tell application \\\"#{activeApp}\\\" to activate\""
        
#000      000   0000000  000000000  00000000  000   000
#000      000  000          000     000       0000  000
#000      000  0000000      000     0000000   000 0 000
#000      000       000     000     000       000  0000
#0000000  000  0000000      000     00000000  000   000

listenClipboard = () ->
    text = clipboard.readText()
    if text != buffers[buffers.length-1]
        # log "copyApp #{getActiveApp()}"
        buffers.push text
        win?.webContents.send 'reload'
    setTimeout listenClipboard, 500

ipc.on 'get-buffers', (event, arg) => event.returnValue = buffers

#00000000    0000000    0000000  000000000  00000000
#000   000  000   000  000          000     000     
#00000000   000000000  0000000      000     0000000 
#000        000   000       000     000     000     
#000        000   000  0000000      000     00000000

ipc.on 'paste', (event, arg) => 
    clipboard.writeText buffers[arg]
    buffers.splice arg, 1
    win.close()
    paste = () ->
        proc.exec "osascript -e \"tell application \\\"System Events\\\" to keystroke \\\"v\\\" using command down\""
    setTimeout paste, 10

#000   000  000  000   000  0000000     0000000   000   000
#000 0 000  000  0000  000  000   000  000   000  000 0 000
#000000000  000  000 0 000  000   000  000   000  000000000
#000   000  000  000  0000  000   000  000   000  000   000
#00     00  000  000   000  0000000     0000000   00     00

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
    
createWindow = ->
    # log 'create'
    win = new BrowserWindow
        width:           1000
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
    win.on 'closed', -> win = null
    win.on 'close', (event) ->
        # log 'close'
        activateApp()
        win.hide()
        app.dock.hide()
        event.preventDefault()
    win

#00000000   00000000   0000000   0000000    000   000
#000   000  000       000   000  000   000   000 000 
#0000000    0000000   000000000  000   000    00000  
#000   000  000       000   000  000   000     000   
#000   000  00000000  000   000  0000000       000   

app.on 'ready', -> 
    
    tray = new Tray "#{__dirname}/../img/menu.png"
    tray.on 'click', toggleWindow
    app.dock.hide() if app.dock
    electron.globalShortcut.register 'Command+Alt+V', showWindow
    
    Menu.setApplicationMenu Menu.buildFromTemplate [
        label: app.getName()
        submenu: [
            label: 'Close Window'
            accelerator: 'Command+W'
            click: () -> win.close()
        ,
            label: 'Quit'
            accelerator: 'Command+Q'
            click: () -> app.exit 0
        ]
    ]
    
    listenClipboard()
    
    
    
    
    
    
