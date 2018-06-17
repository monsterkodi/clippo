###
 0000000  000      000  00000000   00000000    0000000
000       000      000  000   000  000   000  000   000
000       000      000  00000000   00000000   000   000
000       000      000  000        000        000   000
 0000000  0000000  000  000        000         0000000
###

{ post, win, keyinfo, title, scheme, prefs, slash, stopEvent, elem, popup, pos, str, log, $, _ } = require 'kxk'

pkg       = require '../package.json'
electron  = require 'electron'

w = new win 
    dir:    __dirname
    pkg:    pkg
    menu:   '../coffee/menu.noon'
    icon:   '../img/menu@2x.png'
    
current   = 0
buffers   = []

doPaste = -> post.toMain 'paste', current

# 000   000  000   0000000   000   000  000      000   0000000   000   000  000000000
# 000   000  000  000        000   000  000      000  000        000   000     000
# 000000000  000  000  0000  000000000  000      000  000  0000  000000000     000
# 000   000  000  000   000  000   000  000      000  000   000  000   000     000
# 000   000  000   0000000   000   000  0000000  000   0000000   000   000     000

highlight = (index) ->
    
    cdiv =$ '.current'
    if cdiv?
        cdiv.classList.remove 'current'
    log 'highlight', index
    current = Math.max 0, Math.min index, buffers.length-1
    line =$ "line#{current}"
    if line?
        line.classList.add 'current'
        line.scrollIntoViewIfNeeded()
        setFocus()
        
window.highlight = highlight

window.onload = ->

    highlight buffers.length-1
    setFocus()
    
main =$ "#main"

setFocus = -> main.focus()

lineForElem = (elem) ->
    if elem.classList?.contains('line-div') then return parseInt elem.id.substr 4
    if elem.parentNode? then return lineForElem elem.parentNode

main.addEventListener 'mouseover', (event) ->
    id = lineForElem event.target
    highlight id if id?

main.addEventListener 'click', (event) ->
    id = lineForElem event.target
    log 'onClick', id
    
# 000       0000000    0000000   0000000
# 000      000   000  000   000  000   000
# 000      000   000  000000000  000   000
# 000      000   000  000   000  000   000
# 0000000   0000000   000   000  0000000

post.on 'loadBuffers', (buffs, index) -> loadBuffers buffs, index
post.on 'schemeChanged', -> loadBuffers buffers, current

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
        div = elem id: "line#{i}", class: 'line-div', child:
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
        
#  0000000   0000000   00     00  0000000     0000000   
# 000       000   000  000   000  000   000  000   000  
# 000       000   000  000000000  0000000    000   000  
# 000       000   000  000 0 000  000   000  000   000  
#  0000000   0000000   000   000  0000000     0000000   

post.on 'combo', (combo, info) ->

    switch combo
        when 'esc'                                  then return post.toMain 'closeWin'
        when 'down', 'right'                        then return highlight current-1
        when 'up'  , 'left'                         then return highlight current+1
        when 'home', 'page up'                      then return highlight buffers.length-1
        when 'end',  'page down'                    then return highlight 0
        when 'enter', 'command+v', 'ctrl+v'         then return doPaste()
        when 'backspace', 'command+backspace', 'ctrl+backspace', 'delete' then return post.toMain 'del', current

# 00     00  00000000  000   000  000   000   0000000    0000000  000000000  000   0000000   000   000  
# 000   000  000       0000  000  000   000  000   000  000          000     000  000   000  0000  000  
# 000000000  0000000   000 0 000  000   000  000000000  000          000     000  000   000  000 0 000  
# 000 0 000  000       000  0000  000   000  000   000  000          000     000  000   000  000  0000  
# 000   000  00000000  000   000   0000000   000   000   0000000     000     000   0000000   000   000  

post.on 'menuAction', (action) ->

    switch action
        when 'Clear' then post.toMain 'clearBuffer'
        when 'Save'  then post.toMain 'saveBuffer'
        
loadBuffers post.get 'buffers'
