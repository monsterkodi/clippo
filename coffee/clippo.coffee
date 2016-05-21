#  0000000  000      000  00000000   00000000    0000000 
# 000       000      000  000   000  000   000  000   000
# 000       000      000  00000000   00000000   000   000
# 000       000      000  000        000        000   000
#  0000000  0000000  000  000        000         0000000 

electron  = require 'electron'
keyname   = require './tools/keyname'
clipboard = electron.clipboard
ipc       = electron.ipcRenderer
current   = 0
buffers   = []
encode    = require('html-entities').XmlEntities.encode

$ = (id) -> document.getElementById id
log = -> console.log ([].slice.call arguments, 0).join " "

doPaste = -> ipc.send 'paste', current

highlight = (index) =>
    $(current)?.className = ""
    current = Math.max 0, Math.min index, buffers.length-1
    pre = $(current)
    pre.className = 'current'
    pre.scrollIntoViewIfNeeded()
    
window.highlight = highlight
window.onClick = (index) ->
    highlight index
    doPaste()

loadBuffers = (index) ->
    buffers = ipc.sendSync "get-buffers"
    html = ""
    i = 0
    for buf in buffers
        
        icon = "<img  onClick='window.highlight(#{i});' class=\"appicon\" src=\"icons/#{buf.app}.png\"/>\n"
        id = "id=#{i} onClick='window.onClick(#{i});'"
        if buf.image?
            pre  = "<img #{id} src=\"data:image/png;base64,#{buf.image}\"/>\n"
        else if buf.text?
            encl = ( encode(l) for l in buf.text.split("\n")  )
            pre  = "<pre #{id}>" + encl.join("<br>") + "</pre>\n"
        else
            pre = ""
        span = "<span class=\"line-span\">" + icon + pre + "</span>"
        div  = "<div  class=\"line-div\">#{span}</div>"
        html = div + html
        i += 1
    html = "<center><p class=\"info\">clipboard is empty</p></center>" if html.length == 0
    $("scroll").innerHTML = html
    highlight index ? buffers.length-1

ipc.on "load", (event, arg) -> loadBuffers arg

loadBuffers()

document.onkeydown = (event) ->
    key = keyname.ofEvent event
    switch key
        when 'esc'              then return window.close()
        when 'down', 'right'    then return highlight current-1
        when 'up'  , 'left'     then return highlight current+1
        when 'home', 'page up'  then return highlight buffers.length-1
        when 'end', 'page down' then return highlight 0
        when 'enter'            then return doPaste()
        when 'backspace', 'command+backspace' then return ipc.send "del", current
    log key


