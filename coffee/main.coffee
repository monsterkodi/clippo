###
00     00   0000000   000  000   000
000   000  000   000  000  0000  000
000000000  000000000  000  000 0 000
000 0 000  000   000  000  000  0000
000   000  000   000  000  000   000
###

{ _, app, childp, empty, first, fs, kerror, noon, os, osascript, post, prefs, slash } = require 'kxk'

electron = require 'electron'
pkg      = require '../package.json'

if os.platform() == 'darwin'
    appIconSync = require './appiconsync'

app = new app
    dir:        __dirname
    pkg:        pkg
    shortcut:   'CmdOrCtrl+Alt+V'
    index:      'index.html'
    icon:       '../img/app.ico'
    tray:       '../img/menu@2x.png'
    about:      '../img/about.png'
    onQuit:        -> quit()
    onWillShowWin: -> onWillShowWin()
    width:      1000
    height:     1200
    minWidth:   300
    minHeight:  200

clipboard     = electron.clipboard
nativeImage   = electron.nativeImage
buffers       = []
iconDir       = ""
activeApp     = ""
originApp     = null
clippoWatch   = null
appName       = 'clippo'

# 00000000    0000000    0000000  000000000
# 000   000  000   000  000          000
# 00000000   000   000  0000000      000
# 000        000   000       000     000
# 000         0000000   0000000      000

post.on 'paste'      (index) -> pasteIndex index
post.on 'del'        (index) -> deleteIndex index
post.onGet 'buffers' ()      -> buffers
post.on 'clearBuffer'        -> clearBuffer()

# 0000000    0000000  000000000  000  000   000  00000000
#000   000  000          000     000  000   000  000
#000000000  000          000     000   000 000   0000000
#000   000  000          000     000     000     000
#000   000   0000000     000     000      0      00000000

getActiveApp = ->

    if os.platform() == 'win32'
        wxw = require 'wxw'
        info = first wxw 'info' 'top'
        appName = slash.base info.path
    else if os.platform() == 'darwin'
        script = osascript """
        tell application "System Events"
            set n to name of first application process whose frontmost is true
        end tell
        do shell script "echo " & n
        """
        appName = childp.execSync "osascript #{script}"
        appName = String(appName).trim()
    appName

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

onWillShowWin = ->
    
    activeApp = getActiveApp()
    
# 000   000  000  000   000        000   000   0000000   000000000   0000000  000   000  
# 000 0 000  000  0000  000        000 0 000  000   000     000     000       000   000  
# 000000000  000  000 0 000        000000000  000000000     000     000       000000000  
# 000   000  000  000  0000        000   000  000   000     000     000       000   000  
# 00     00  000  000   000        00     00  000   000     000      0000000  000   000  

winClipboardChanged = ->

    wxw = require 'wxw'
    appName = 'clippo'
    
    winInfo = first wxw 'info' 'top'

    appName = slash.base winInfo.path
    exclude = prefs.get 'exclude' ['password-turtle']
    if not empty exclude
        for exapp in exclude
            return if appName.startsWith exapp
    iconPath = "#{iconDir}/#{appName}.png"
    if not slash.isFile iconPath
        wxw 'icon' winInfo.path, iconPath
                    
    onClipboardChanged()

macClipboardChanged = ->

    currentApp = getActiveApp()
    currentApp = 'clippo' if currentApp.toLowerCase() == 'electron'
    originApp  = 'clippo' if (not originApp) and (not currentApp)

    appName = saveAppIcon originApp ? currentApp

    onClipboardChanged()
    
onClipboardChanged = ->

    for format in clipboard.availableFormats()

        if format.startsWith 'image/'

            imageBuffer = clipboard.readImage().toPNG()
            imageData   = imageBuffer.toString('base64')

            for b in buffers
                if b.image? and b.image == imageData
                    appName = b.app
                    _.pull buffers, b
                    break

            buffers.push
                app:   appName
                image: imageData
                count: buffers.length

            reload buffers.length-1
            return

    text = clipboard.readText()

    if text.length and text.trim().length

        for b in buffers
            if b.text? and b.text == text
                appName = b.app
                _.pull buffers, b
                break

        buffers.push
            app:   appName
            text:  text
            count: buffers.length-1

        reload buffers.length-1

watchClipboard = ->
    
    cw = require 'electron-clipboard-watcher'

    if os.platform() == 'win32'
        cw watchDelay:200, onImageChange:winClipboardChanged, onTextChange:winClipboardChanged
    else
        cw watchDelay:200, onImageChange:macClipboardChanged, onTextChange:macClipboardChanged

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
    originApp = buffers.splice(index, 1)[0]?.app

    if os.platform() == 'win32'
        wxw = require 'wxw'
        paste = ->
            if activeApp == 'mintty'
                wxw 'key' 'ctrl+shift+v'
            else
                wxw 'key' 'ctrl+v'
        app.win.close()
        setTimeout paste, 20
    else if os.platform() == 'darwin'
        childp.execSync "osascript " + osascript """
            tell application "System Events" to keystroke tab using command down
        """
        childp.execSync "osascript " + osascript """
            tell application "System Events" to keystroke "v" using command down
        """

#0000000    00000000  000
#000   000  000       000
#000   000  0000000   000
#000   000  000       000
#0000000    00000000  0000000

deleteIndex = (index) ->

    buffers.splice index, 1
    reload index-1

quit = ->

    saveBuffer()
    clippoWatch?.kill()

reload = (index=0) ->

    post.toWins 'loadBuffers' buffers, index

clearBuffer = ->

    buffers = []
    saveBuffer()
    reload()

saveBuffer = ->

    noon.save "#{app.userData}/buffers.noon" buffers.slice(- prefs.get('maxBuffers', 50))

readBuffer = ->

    try
        buffers = noon.load slash.path "#{app.userData}/buffers.noon"
        buffers = buffers ? []
    catch
        buffers = []

#00000000   00000000   0000000   0000000    000   000
#000   000  000       000   000  000   000   000 000
#0000000    0000000   000000000  000   000    00000
#000   000  000       000   000  000   000     000
#000   000  00000000  000   000  0000000       000

post.on 'appReady' ->

    readBuffer()

    iconDir = slash.resolve "#{app.userData}/icons"
    fs.ensureDirSync iconDir

    try
        fs.accessSync slash.join(iconDir, 'clippo.png'), fs.R_OK
    catch
        try
            fs.copySync "#{__dirname}/../img/clippo.png", slash.join iconDir, 'clippo.png'
        catch err
            kerror "can't copy clippo icon: #{err}"

    watchClipboard()
