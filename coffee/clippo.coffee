electron  = require('electron')
clipboard = electron.clipboard
ipc       = electron.ipcRenderer
keyname   = require './tools/keyname'

loadBuffers = () ->
    buffers = ipc.sendSync "get-buffers"
    html = ""
    for buf in buffers
        html += "<pre>" + buf.split("\n").join("<br>") + "</pre>\n"
    document.body.innerHTML = html

ipc.on "reload", loadBuffers

loadBuffers()

document.onkeydown = (event) ->
    key = keyname.ofEvent event
    # console.log key
    switch key
        when 'esc' then window.close()


