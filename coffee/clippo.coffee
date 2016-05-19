electron  = require 'electron'
keyname   = require './tools/keyname'
clipboard = electron.clipboard
ipc       = electron.ipcRenderer
current   = 0
buffers   = []

$ = (id) -> document.getElementById id
log = -> console.log ([].slice.call arguments, 0).join " "

doPaste = ->
    ipc.send 'paste', buffers[current]
    log current, buffers[current]

highlight = (index) ->
    $(current)?.className = ""
    current = Math.max 0, Math.min index, buffers.length-1
    pre = $(current)
    pre.className = 'current'

window.onClick = (index) ->
    log 'clicked', index
    highlight index
    doPaste()

loadBuffers = ->
    buffers = ipc.sendSync "get-buffers"
    html = ""
    i = 0
    for buf in buffers
        html = "<pre id=#{i} onClick='window.onClick(#{i});'>" + buf.split("\n").join("<br>") + "</pre>\n" + html
        i += 1
    document.body.innerHTML = html

ipc.on "reload", loadBuffers

loadBuffers()
highlight 0

document.onkeydown = (event) ->
    key = keyname.ofEvent event
    switch key
        when 'esc'           then return window.close()
        when 'down', 'right' then return highlight current-1
        when 'up'  , 'left'  then return highlight current+1
        when 'page up'       then return highlight buffers.length-1
        when 'page down'     then return highlight 0
        when 'enter'         then return doPaste()
    log key


