# 00     00   0000000   000  000   000
# 000   000  000   000  000  0000  000
# 000000000  000000000  000  000 0 000
# 000 0 000  000   000  000  000  0000
# 000   000  000   000  000  000   000

{ osascript, resolve, prefs, slash, about, noon, childp, log, fs, _ } = require 'kxk'

if not slash.win()
    appIconSync = require './appiconsync'
electron      = require 'electron'
chokidar      = require 'chokidar'
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
    return if slash.win()
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
    if appName and appName != app.getName()
        activeApp = appName

activateApp = ->
    return if slash.win()
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
    if not slash.isFile iconPath
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
            app:   originApp ? currentApp
            image: obj.image
            count: obj.count

    if obj.text? 
        
        for b in buffers
            if b.text? and b.text == obj.text
                _.pull buffers, b
                break
        
        buffers.push 
            app:   originApp ? currentApp
            text:  obj.text
            count: obj.count

    maxBuffers = prefs.get 'maxBuffers', 50
    while buffers.length > maxBuffers
        buffers.shift()

    originApp = undefined        
    reload buffers.length-1

watchClipboard = ->

    if slash.win()
        cw = require 'clipboard-watch'
        cw.watcher ->
            activeWin = require 'active-win'
            appName = 'clippo'
            
            winInfo = activeWin.sync()
            if winInfo?.owner?
                appName = slash.base winInfo.owner.name
                iconPath = "#{iconDir}/#{appName}.png"
                if not slash.isFile iconPath
                    extractIcon = require 'win-icon-extractor'
                    extractIcon(winInfo.owner.path).then (result) ->
                        result = result.slice 'data:image/png;base64,'.length
                        try
                            fs.writeFileSync iconPath, result, encoding: 'base64'
                        catch err
                            log "write icon #{iconPath} failed"
                
            buffers.push 
                app:   appName
                text:  clipboard.readText()
                count: buffers.length
            reload buffers.length-1
    else
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
        if slash.win()
            log 'paste'
        else
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
        app.dock?.hide()
    else
        showWindow()

showWindow = ->
    updateActiveApp()
    if win?
        win.show()
    else
        createWindow()
    app.dock?.show()
    
createWindow = ->
    
    win = new BrowserWindow
        width:           1000
        height:          1200
        backgroundColor: '#181818'
        maximizable:     true
        minimizable:     true
        fullscreen:      false
        show:            false
        titleBarStyle:   'hidden'
        autoHideMenuBar: true
        
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
        app.dock?.hide()
    app.dock?.show()
    win

saveBounds = -> if win? then prefs.set 'bounds', win.getBounds()

showAbout = ->
    dark = 'dark' == prefs.get 'scheme', 'dark'
    about 
        img:        "#{__dirname}/../img/about.png"
        color:      dark and '#383838' or '#ddd'
        background: dark and '#282828' or '#fff'
        highlight:  dark and '#fff'    or '#000'
        pkg:        pkg
    
reload = (index=0) -> win?.webContents.send 'loadBuffers', buffers, index
    
clearBuffer = ->
    
    buffers = []
    saveBuffer()
    reload()
        
saveBuffer = ->
    
    noon.save "#{app.getPath('userData')}/buffers.noon", buffers.slice(- prefs.get('maxBuffers', 50))
    
readBuffer = ->
    
    try
        buffers = noon.load "#{app.getPath('userData')}/buffers.noon"
        buffers = buffers ? []
    catch
        buffers = [] 
        
app.on 'window-all-closed', (event) -> event.preventDefault()

#00000000   00000000   0000000   0000000    000   000
#000   000  000       000   000  000   000   000 000 
#0000000    0000000   000000000  000   000    00000  
#000   000  000       000   000  000   000     000   
#000   000  00000000  000   000  0000000       000   

app.on 'ready', -> 
        
    tray = new Tray "#{__dirname}/../img/menu.png"
    tray.on 'click', toggleWindow
    app.dock?.hide()
    
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
            accelerator: 'CmdOrCtrl+.'
            click: -> showAbout()
        ,            
            label: 'Clear Buffer'
            accelerator: 'CmdOrCtrl+K'
            click: -> clearBuffer()
        ,
            label: 'Save Buffer'
            accelerator: 'CmdOrCtrl+S'
            click: -> saveBuffer()
        ,
            type: 'separator'
        ,                            
            label:       'Close Window'
            accelerator: 'CmdOrCtrl+W'
            click:       -> win?.close()
        ,
            label: 'Quit'
            accelerator: 'CmdOrCtrl+Q'
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
            accelerator: 'CmdOrCtrl+Alt+M'
            click:       -> win?.minimize()
        ,
            label:       'Maximize'
            accelerator: 'CmdOrCtrl+Shift+m'
            click:       -> if win?.isMaximized() then win?.unmaximize() else win?.maximize()
        ,
            type: 'separator'
        ,   
            label:       'Reload Window'
            accelerator: 'CmdOrCtrl+Alt+L'
            click:       -> win?.webContents.reloadIgnoringCache()
        ,                
            label:       'Toggle DevTools'
            accelerator: 'CmdOrCtrl+Alt+I'
            click:       -> win?.webContents.openDevTools()
        ]
    ]
        
    prefs.init 
        maxBuffers: 50
        shortcut: 'CmdOrCtrl+Alt+V'

    electron.globalShortcut.register prefs.get('shortcut'), showWindow

    readBuffer()

    iconDir = resolve "#{app.getPath('userData')}/icons"    
    fs.ensureDirSync iconDir

    try
        fs.accessSync slash.join(iconDir, 'clippo.png'), fs.R_OK
    catch    
        try
            fs.copySync "#{__dirname}/../img/clippo.png", slash.join iconDir, 'clippo.png' 
        catch err
            log "can't copy clippo icon: #{err}"
    
    watchClipboard()
    if slash.win()
        showWindow()

if app.makeSingleInstance showWindow 
    app.quit()
    return
