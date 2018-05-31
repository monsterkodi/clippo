###
 0000000  000      000  00000000   00000000    0000000
000       000      000  000   000  000   000  000   000
000       000      000  00000000   00000000   000   000
000       000      000  000        000        000   000
 0000000  0000000  000  000        000         0000000
###

{ keyinfo, title, scheme, prefs, slash, post, stopEvent, elem, popup, pos, str, log, $ } = require 'kxk'

pkg       = require '../package.json'
electron  = require 'electron'

clipboard = electron.clipboard
ipc       = electron.ipcRenderer
current   = 0
buffers   = []

doPaste = -> ipc.send 'paste', current

# 000   000  000   0000000   000   000  000      000   0000000   000   000  000000000
# 000   000  000  000        000   000  000      000  000        000   000     000
# 000000000  000  000  0000  000000000  000      000  000  0000  000000000     000
# 000   000  000  000   000  000   000  000      000  000   000  000   000     000
# 000   000  000   0000000   000   000  0000000  000   0000000   000   000     000

highlight = (index) =>
    
    cdiv =$ '.current'
    if cdiv?
        cdiv.classList.remove 'current'
    current = Math.max 0, Math.min index, buffers.length-1
    line =$ "line#{current}"
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

$('main').addEventListener "mouseover", (event) ->
    id = lineForElem(event.target)?.id
    highlight id if id?

# 000       0000000    0000000   0000000
# 000      000   000  000   000  000   000
# 000      000   000  000000000  000   000
# 000      000   000  000   000  000   000
# 0000000   0000000   000   000  0000000

ipc.on "loadBuffers", (event, buffs, index) -> loadBuffers buffs, index

post.on 'schemeChanged', -> 
    log 'schemeChanged'
    loadBuffers buffers, current

loadBuffers = (buffs, index) ->

    buffers = buffs

    if buffers.length == 0
        s = prefs.get 'scheme', 'dark'
        $('main').innerHTML = "<center><img class='info' src=\"#{__dirname}/../img/empty_#{s}.png\"></center>"
        return

    iconDir = slash.encode slash.join electron.remote.app.getPath('userData'), 'icons'

    $('main').innerHTML = "<div id='buffer'></div>"

    i = 0
    for buf in buffers
        div = elem id: "line#{i}", class: 'line-div', onClick: "window.onClick(#{i});", child:
            elem 'span', class: 'line-span', children: [
                elem 'img', onClick: "window.highlight(#{i});", class: 'appicon', src: "#{iconDir}/#{buf.app}.png"
                if buf.image?
                    elem 'img', src: "data:image/png;base64,#{buf.image}", class: 'image'
                else if buf.text?
                    encl = ( str.encode(l) for l in buf.text.split "\n" )
                    elem 'pre', html: encl.join "<br>"
                else
                    elem 'pre'
                ]
        $('buffer').insertBefore div, $('buffer').firstChild
        i += 1

    highlight index ? buffers.length-1

# 000000000  000  000000000  000      00000000  
#    000     000     000     000      000       
#    000     000     000     000      0000000   
#    000     000     000     000      000       
#    000     000     000     0000000  00000000  

window.titlebar = new title 
    pkg:    pkg 
    menu:   __dirname + '/../coffee/menu.noon' 
    icon:   __dirname + '/../img/menu@2x.png'
    
post.on 'menuAction', (action) ->

    switch action
        when 'Close'            then window.close()
        when 'About'            then post.toMain 'showAbout'
        when 'Clear'            then post.toMain 'clearBuffer'
        when 'Save'             then post.toMain 'saveBuffer'
        when 'Quit'             then post.toMain 'quitClippo'
        when 'Toggle Scheme'    then scheme.toggle()
    
$("#main").addEventListener "contextmenu", (event) ->
    
    absPos = pos event
    if not absPos?
        absPos = pos $('main').getBoundingClientRect().left, $('main').getBoundingClientRect().top
        
    log 'contextmenu', absPos
    
    opt = items: [
        text:   'Clear'
        combo:  'k' 
        cb:     -> ipc.send 'clearBuffer'
    ,
        text:   'Show Menu'
        combo:  'alt'
        cb:     -> electron.remote.getCurrentWindow().setMenuBarVisibility true
        hide:   not slash.win()
    ,
        text:   'About'
        combo:  'ctrl+.'
        cb:      -> ipc.send 'showAbout'
    ,
        text:   'Quit'
        combo:  'ctrl+q' 
        cb:     -> ipc.send 'quitClippo'
    ]
    
    opt.x = absPos.x
    opt.y = absPos.y

    popup.menu opt
    
window.onunload = -> document.onkeydown = null

# 000   000  00000000  000   000
# 000  000   000        000 000
# 0000000    0000000     00000
# 000  000   000          000
# 000   000  00000000     000

document.onkeydown = (event) ->

    return stopEvent(event) if 'unhandled' != window.titlebar.handleKey event, true
    
    { mod, key, combo } = keyinfo.forEvent event

    switch combo
        when 'esc'                                  then return ipc.send 'closeWin'
        when 'down', 'right'                        then return highlight current-1
        when 'up'  , 'left'                         then return highlight current+1
        when 'home', 'page up'                      then return highlight buffers.length-1
        when 'end',  'page down'                    then return highlight 0
        when 'enter', 'command+v', 'ctrl+v'         then return doPaste()
        when 'backspace', 'command+backspace', 'ctrl+backspace', 'delete' then return ipc.send 'del', current

prefs.init()
scheme.set prefs.get 'scheme', 'dark'

loadBuffers ipc.sendSync 'getBuffers'
