# 00     00   0000000   000  000   000
# 000   000  000   000  000  0000  000
# 000000000  000000000  000  000 0 000
# 000 0 000  000   000  000  000  0000
# 000   000  000   000  000  000   000

electron      = require 'electron'
chokidar      = require 'chokidar'
childp        = require 'child_process'
noon          = require 'noon'
path          = require 'path'
fs            = require 'fs-extra'
_             = require 'lodash'
osascript     = require './tools/osascript'
resolve       = require './tools/resolve'
appIconSync   = require './tools/appiconsync'
prefs         = require './tools/prefs'
about         = require './tools/about'
log           = require './tools/log'
pkg           = require '../package.json'
app           = electron.app
BrowserWindow = electron.BrowserWindow
Tray          = electron.Tray
Menu          = electron.Menu
clipboard     = electron.clipboard
ipc           = electron.ipcMain
nativeImage   = electron.nativeImage
sel           = null
win           = null
tray          = null
buffers       = []
iconDir       = ""
activeApp     = ""
originApp     = null
clippoWatch   = null
debug         = false

# 000  00000000    0000000
# 000  000   000  000     
# 000  00000000   000     
# 000  000        000     
# 000  000         0000000

ipc.on 'paste', (event, index) -> pasteIndex index 
ipc.on 'del',   (event, index) -> deleteIndex index 
ipc.on 'clearBuffer',          -> clearBuffer()
ipc.on 'getBuffers', (event)   -> event.returnValue = buffers
ipc.on 'toggleMaximize',       -> if win?.isMaximized() then win?.unmaximize() else win?.maximize()
ipc.on 'closeWin',             -> win?.close()

# 0000000    0000000  000000000  000  000   000  00000000
#000   000  000          000     000  000   000  000     
#000000000  000          000     000   000 000   0000000 
#000   000  000          000     000     000     000     
#000   000   0000000     000     000      0      00000000

getActiveApp = ->
    script = osascript """
    tell application "System Events"
        set n to name of first application process whose frontmost is true
    end tell
    do shell script "echo " & n
    """
    appName = childp.execSync "osascript #{script}"
    appName = String(appName).trim()    
    appName

updateActiveApp = -> 
    appName = getActiveApp()
    if appName != app.getName()
        activeApp = appName

activateApp = ->
    if activeApp.length
        try
            childp.execSync "osascript " + osascript """
            tell application "#{activeApp}" to activate
            """
        catch
            return

# 0000000   00000000   00000000   000   0000000   0000000   000   000
#000   000  000   000  000   000  000  000       000   000  0000  000
#000000000  00000000   00000000   000  000       000   000  000 0 000
#000   000  000        000        000  000       000   000  000  0000
#000   000  000        000        000   0000000   0000000   000   000
        
saveAppIcon = (appName) ->
    iconPath = "#{iconDir}/#{appName}.png"
    try 
        fs.accessSync iconPath, fs.R_OK
    catch
        png = appIconSync appName, iconDir, 128
        appName = "clippo" if not png
    appName

# 000   000   0000000   000000000   0000000  000   000
# 000 0 000  000   000     000     000       000   000
# 000000000  000000000     000     000       000000000
# 000   000  000   000     000     000       000   000
# 00     00  000   000     000      0000000  000   000

readPBjson = (path) ->

    obj = noon.load path
    
    isEmpty = buffers.length == 0
    
    return if not obj.text? and not obj.image?
    return if buffers.length and obj.count == buffers[buffers.length-1].count
                
    currentApp = getActiveApp()
    currentApp = 'clippo' if currentApp == 'Electron'
    originApp  = 'clippo' if (not originApp) and (not currentApp)
    saveAppIcon originApp ? currentApp

    if obj.image? 
        
        for b in buffers
            if b.image? and b.image == obj.image
                _.pull buffers, b
                break
        
        buffers.push 
            app:   currentApp
            image: obj.image
            count: obj.count

    if obj.text? 
        
        for b in buffers
            if b.text? and b.text == obj.text
                _.pull buffers, b
                break
        
        buffers.push 
            app:   currentApp
            text:  obj.text
            count: obj.count

    maxBuffers = prefs.get 'maxBuffers', 50
    while buffers.length > maxBuffers
        buffers.shift()

    originApp = undefined        
    reload buffers.length-1

watchClipboard = ->

    clippoWatch = childp.spawn "#{__dirname}/../bin/clippo-watch", [], 
        cwd: "#{__dirname}/../bin"
        detached: false

    watcher = chokidar.watch "#{__dirname}/../bin/pb.json", persistent: true
    watcher.on 'add',    (path) => readPBjson path
    watcher.on 'change', (path) => readPBjson path
        
# 0000000   0000000   00000000   000   000
#000       000   000  000   000   000 000 
#000       000   000  00000000     00000  
#000       000   000  000           000   
# 0000000   0000000   000           000   

copyIndex = (index) ->
    return if (index < 0) or (index > buffers.length-1)
    if buffers[index].image
        image = nativeImage.createFromBuffer new Buffer buffers[index].image, 'base64'
        if not image.isEmpty() and (image.getSize().width * image.getSize().height > 0)
            clipboard.writeImage image,  'image/png'
    if buffers[index].text? and (buffers[index].text.length > 0) 
        clipboard.writeText buffers[index].text, 'text/plain' 

#00000000    0000000    0000000  000000000  00000000
#000   000  000   000  000          000     000     
#00000000   000000000  0000000      000     0000000 
#000        000   000       000     000     000     
#000        000   000  0000000      000     00000000

pasteIndex = (index) ->
    copyIndex index
    originApp = buffers.splice(index, 1)[0].app
    win.close()
    paste = () ->
        childp.exec "osascript " + osascript """
        tell application "System Events" to keystroke "v" using command down
        """
    setTimeout paste, 10
    
#0000000    00000000  000    
#000   000  000       000    
#000   000  0000000   000    
#000   000  000       000    
#0000000    00000000  0000000

deleteIndex = (index) ->
    buffers.splice index, 1 
    reload index-1
    
#000   000  000  000   000  0000000     0000000   000   000
#000 0 000  000  0000  000  000   000  000   000  000 0 000
#000000000  000  000 0 000  000   000  000   000  000000000
#000   000  000  000  0000  000   000  000   000  000   000
#00     00  000  000   000  0000000     0000000   00     00

toggleWindow = ->
    if win?.isVisible()
        win.hide()    
        app.dock.hide()
    else
        showWindow()

showWindow = ->
    updateActiveApp()
    if win?
        win.show()
    else
        createWindow()
    app.dock.show()
    
createWindow = ->
    win = new BrowserWindow
        width:           1000
        height:          1200
        titleBarStyle:   'hidden'
        backgroundColor: '#181818'
        maximizable:     true
        minimizable:     true
        fullscreen:      false
        show:            true
        
    bounds = prefs.get 'bounds'
    win.setBounds bounds if bounds?
        
    win.loadURL "file://#{__dirname}/index.html"
    win.webContents.openDevTools() if debug
    win.on 'ready-to-show', -> win.show()
    win.on 'closed', -> win = null
    win.on 'resize', saveBounds
    win.on 'move', saveBounds
    win.on 'close',  ->
        activateApp()
        app.dock.hide()
    app.dock.show()
    win

saveBounds = -> if win? then prefs.set 'bounds', win.getBounds()

showAbout = ->
    about 
        img:        "#{__dirname}/../img/about.png"
        color:      "#080808"
        background: "#282828"
    
reload = (index=0) -> win?.webContents.send 'loadBuffers', buffers, index
    
clearBuffer = ->
    buffers = []
    saveBuffer()
    reload()
        
saveBuffer = ->
    noon.save "#{app.getPath('userData')}/clippo-buffers.noon", buffers.slice(- prefs.get('maxBuffers', 50))
    
readBuffer = ->
    try
        buffers = noon.load "#{app.getPath('userData')}/clippo-buffers.noon"
        buffers = buffers ? []
    catch
        buffers = [] 
        
app.on 'window-all-closed', (event) -> event.preventDefault()

#  0000000   00000000   00000000    0000000  00000000  000      
# 000   000  000   000  000   000  000       000       000      
# 000000000  00000000   00000000   0000000   0000000   000      
# 000   000  000        000             000  000       000      
# 000   000  000        000        0000000   00000000  0000000  

showAppSelector = ->
    return if sel?
    sel = new BrowserWindow
        width:           300
        height:          300
        center:          true
        alwaysOnTop:     true
        movable:         true
        backgroundColor: '#181818'
        frame:           false
        resizable:       false
        maximizable:     false
        minimizable:     false
        fullscreen:      false
        show:            false
        
    bounds = prefs.get 'appSelector:bounds'
    sel.setBounds bounds if bounds?
    sel.loadURL "file://#{__dirname}/appsel.html"
    sel.on 'closed', -> sel = null
    sel.on 'resize', -> prefs.set 'appSelector:bounds', sel.getBounds()
    sel.on 'move',   -> prefs.set 'appSelector:bounds', sel.getBounds()
    sel.on 'close',  ->
    sel.on 'ready-to-show', -> 
        sel.webContents.send 'setWinID', sel.id
        sel.show()
    sel

#00000000   00000000   0000000   0000000    000   000
#000   000  000       000   000  000   000   000 000 
#0000000    0000000   000000000  000   000    00000  
#000   000  000       000   000  000   000     000   
#000   000  00000000  000   000  0000000       000   

app.on 'ready', -> 
    
    tray = new Tray "#{__dirname}/../img/menu.png"
    tray.on 'click', toggleWindow
    app.dock.hide() if app.dock
    
    app.setName 'clippo'
    
    # 00     00  00000000  000   000  000   000
    # 000   000  000       0000  000  000   000
    # 000000000  0000000   000 0 000  000   000
    # 000 0 000  000       000  0000  000   000
    # 000   000  00000000  000   000   0000000 
    
    Menu.setApplicationMenu Menu.buildFromTemplate [
        label: app.getName()
        submenu: [
            label: "About #{pkg.name}"
            accelerator: 'Command+.'
            click: -> showAbout()
        ,            
            label: 'Clear Buffer'
            accelerator: 'Command+K'
            click: -> clearBuffer()
        ,
            label: 'Save Buffer'
            accelerator: 'Command+S'
            click: -> saveBuffer()
        ,
            type: 'separator'
        ,
            label:       "Hide #{pkg.productName}"
            accelerator: 'Cmd+H'
            role:        'hide'
        ,
            label:       'Hide Others'
            accelerator: 'Cmd+Alt+H'
            role:        'hideothers'
        ,
            type: 'separator'
        ,
            label: 'Quit'
            accelerator: 'Command+Q'
            click: -> 
                saveBounds()
                saveBuffer()
                clippoWatch?.kill()
                app.exit 0
        ]
    ,
        # 000   000  000  000   000  0000000     0000000   000   000
        # 000 0 000  000  0000  000  000   000  000   000  000 0 000
        # 000000000  000  000 0 000  000   000  000   000  000000000
        # 000   000  000  000  0000  000   000  000   000  000   000
        # 00     00  000  000   000  0000000     0000000   00     00
        
        label: 'Window'
        submenu: [
            label:       'Minimize'
            accelerator: 'Alt+Cmd+M'
            click:       -> win?.minimize()
        ,
            label:       'Maximize'
            accelerator: 'Cmd+Shift+m'
            click:       -> if win?.isMaximized() then win?.unmaximize() else win?.maximize()
        ,
            type: 'separator'
        ,                            
            label:       'Close Window'
            accelerator: 'Cmd+W'
            click:       -> win?.close()
        ,
            type: 'separator'
        ,                            
            label:       'Bring All to Front'
            accelerator: 'Alt+Cmd+`'
            click:       -> win?.show()
        ,
            type: 'separator'
        ,   
            label:       'Reload Window'
            accelerator: 'Ctrl+Alt+Cmd+L'
            click:       -> win?.webContents.reloadIgnoringCache()
        ,                
            label:       'Toggle DevTools'
            accelerator: 'Cmd+Alt+I'
            click:       -> win?.webContents.openDevTools()
        ]
    ]
        
    prefs.init "#{app.getPath('userData')}/clippo.noon",
        maxBuffers: 50
        shortcut: 'Command+Alt+V'
        appSelector:
            shortcut: 'Command+F1'

    electron.globalShortcut.register prefs.get('shortcut'), showWindow
    electron.globalShortcut.register prefs.get('appSelector:shortcut'), showAppSelector

    readBuffer()

    iconDir = resolve "#{__dirname}/../icons"    
    try
        fs.accessSync iconDir, fs.R_OK
    catch
        try
            fs.mkdirSync iconDir
        catch
            log "can't create icon directory #{iconDir}"

    try
        fs.accessSync path.join(iconDir, 'clippo.png'), fs.R_OK
    catch    
        try
            fs.copySync "#{__dirname}/../img/clippo.png", path.join(iconDir, 'clippo.png')
        catch err
            log "can't copy clippo icon: #{err}"
    
    watchClipboard()
    