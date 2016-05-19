###
000   000  00000000  000   000  000   000   0000000   00     00  00000000
000  000   000        000 000   0000  000  000   000  000   000  000     
0000000    0000000     00000    000 0 000  000000000  000000000  0000000 
000  000   000          000     000  0000  000   000  000 0 000  000     
000   000  00000000     000     000   000  000   000  000   000  00000000
###

keycode = require 'keycode'

class keyname
    
    @modifierNames = ['shift', 'ctrl', 'alt', 'command']
    
    @isModifier: (keyname) -> keyname in @modifierNames
    @modifiersOfEvent: (event) -> 
        mods = []
        mods.push 'command' if event.metaKey
        mods.push 'alt'     if event.altKey
        mods.push 'ctrl'    if event.ctrlKey 
        mods.push 'shift'   if event.shiftKey
        return mods.join '+'
    @join: () -> 
        args = [].slice.call arguments, 0
        args = args.filter (e) -> e.length
        args.join '+'
    @ofEvent: (event) ->
        key = keycode event
        if key not in @modifierNames
            key = @join @modifiersOfEvent(event), key
        else
            key = ""
        key        

module.exports = keyname
