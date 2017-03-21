#  0000000   00000000   00000000    0000000  00000000  000      
# 000   000  000   000  000   000  000       000       000      
# 000000000  00000000   00000000   0000000   0000000   000      
# 000   000  000        000             000  000       000      
# 000   000  000        000        0000000   00000000  0000000  
{
resolve,
last,
$}        = require './tools/tools'
keyname   = require './tools/keyname'
prefs     = require './tools/prefs'
elem      = require './tools/elem'
log       = require './tools/log'
pkg       = require '../package.json'
path      = require 'path'
walkdir   = require 'walkdir'
electron  = require 'electron'
clipboard = electron.clipboard
browser   = electron.remote.BrowserWindow
ipc       = electron.ipcRenderer
win       = null
apps      = {}
current   = 0

ipc.on 'setWinID', (event, id) -> winMain id

# 000   000  000  000   000  00     00   0000000   000  000   000  
# 000 0 000  000  0000  000  000   000  000   000  000  0000  000  
# 000000000  000  000 0 000  000000000  000000000  000  000 0 000  
# 000   000  000  000  0000  000 0 000  000   000  000  000  0000  
# 00     00  000  000   000  000   000  000   000  000  000   000  

winMain = (id) ->
    
    window.win = win = browser.fromId id 
    win.webContents.openDevTools()

    prefs.init "#{electron.remote.app.getPath('userData')}/#{pkg.productName}.noon"
    setScheme prefs.get 'scheme', 'dark.css'
    findApps()

findApps = ->
    appFolders = [
        "/Applications"
        "/Applications/Utilities"
        # "/System/Library/CoreServices"
        # "~/Applications"
        ]
    foldersLeft = appFolders.length
    
    for appFolder in appFolders

        walk = walkdir resolve(appFolder), no_recurse: true
        walk.on 'error', (err) -> log "[ERROR] #{err}"
        walk.on 'end', -> 
            foldersLeft -= 1 
            if foldersLeft == 0
                apps['Finder'] = "/System/Library/CoreServices/Finder.app"
                log apps
        walk.on 'directory', (dir) -> 
            if path.extname(dir) == '.app'
                name = path.basename dir, '.app'
                apps[name] = dir 
    
openCurrent = () ->
    
    win?.close()
    
# 000   000  000   0000000   000   000  000      000   0000000   000   000  000000000
# 000   000  000  000        000   000  000      000  000        000   000     000   
# 000000000  000  000  0000  000000000  000      000  000  0000  000000000     000   
# 000   000  000  000   000  000   000  000      000  000   000  000   000     000   
# 000   000  000   0000000   000   000  0000000  000   0000000   000   000     000   

highlight = (index) =>
    cdiv = $('.current')
    if cdiv?
        cdiv.classList.remove 'current'
    current = Math.max 0, Math.min index, buffers.length-1
    line = $(current)
    if line?
        line.classList.add 'current'
        line.scrollIntoViewIfNeeded()
    
window.highlight = highlight
window.onClick = (index) ->
    highlight index
    doPaste()

lineForElem = (elem) ->        
    if elem.classList?.contains('line-div') then return elem
    if elem.parentNode? then return lineForElem elem.parentNode
    
$('appsel').addEventListener "mouseover", (event) ->
    id = lineForElem(event.target)?.id
    highlight id if id?

window.onunload = -> document.onkeydown = null

#  0000000  000000000  000   000  000      00000000  
# 000          000      000 000   000      000       
# 0000000      000       00000    000      0000000   
#      000     000        000     000      000       
# 0000000      000        000     0000000  00000000  

toggleStyle = ->
    link =$ 'style-link' 
    currentScheme = last link.href.split('/')
    schemes = ['dark.css', 'bright.css']
    nextSchemeIndex = ( schemes.indexOf(currentScheme) + 1) % schemes.length
    nextScheme = schemes[nextSchemeIndex]
    ipc.send 'setScheme', path.basename nextScheme, '.css'
    prefs.set 'scheme', nextScheme
    setScheme nextScheme
    
setScheme = (scheme) ->
    link =$ 'style-link' 
    newlink = elem 'link', 
        rel:  'stylesheet'
        type: 'text/css'
        href: 'css/'+scheme
        id:   'style-link'
    link.parentNode.replaceChild newlink, link

# 000   000  00000000  000   000
# 000  000   000        000 000 
# 0000000    0000000     00000  
# 000  000   000          000   
# 000   000  00000000     000   

document.onkeydown = (event) ->
    key = keyname.ofEvent event
    log 'key', key
    switch key
        when 'i'             then toggleStyle()
        when 'esc'           then win?.close()
        when 'down', 'right' then highlight current-1
        when 'up'  , 'left'  then highlight current+1
        when 'enter'         then openCurrent()
        when 'command+alt+i' then win?.webContents.openDevTools()

