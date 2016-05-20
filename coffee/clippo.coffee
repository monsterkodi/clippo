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

highlight = (index) ->
    $(current)?.className = ""
    current = Math.max 0, Math.min index, buffers.length-1
    pre = $(current)
    pre.className = 'current'
    pre.scrollIntoViewIfNeeded()

window.onClick = (index) ->
    # log 'clicked', index
    highlight index
    doPaste()

loadBuffers = ->
    buffers = ipc.sendSync "get-buffers"
    html = ""
    i = 0
    for buf in buffers
        encl = ( encode(l) for l in buf.split("\n")  )
        html = "<pre id=#{i} onClick='window.onClick(#{i});'>" + encl.join("<br>") + "</pre>\n" + html
        i += 1
    html = "clipboard is empty!" if html.length == 0
    document.body.innerHTML = html
    highlight buffers.length-1

ipc.on "reload", loadBuffers

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
    log key


