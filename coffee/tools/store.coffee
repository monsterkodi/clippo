#  0000000  000000000   0000000   00000000   00000000  
# 000          000     000   000  000   000  000       
# 0000000      000     000   000  0000000    0000000   
#      000     000     000   000  000   000  000       
# 0000000      000      0000000   000   000  00000000  

log    = require './log'
_      = require 'lodash'
fs     = require 'fs-extra'
noon   = require 'noon'
path   = require 'path'
atomic = require 'write-file-atomic'

class Store
    
    constructor: (opt) ->
        
        @timer   = null
        @file    = opt?.file
        @sep     = opt?.separator ? ':'
        @timeout = opt?.timeout ? 1000
        
        try
            @data = noon.load @file
        catch err
            @data = {}
            
        @data = _.defaults @data, opt.defaults if opt?.defaults?

    #  0000000   00000000  000000000
    # 000        000          000   
    # 000  0000  0000000      000   
    # 000   000  000          000   
    #  0000000   00000000     000   
        
    get: (key, value) ->
        return value if not key?.split?
        keypath = key.split @sep
        object = @data
        while keypath.length
            object = object[keypath.shift()]
            return value if not object?
        object ? value
         
    #  0000000  00000000  000000000  
    # 000       000          000     
    # 0000000   0000000      000     
    #      000  000          000     
    # 0000000   00000000     000     
    
    set: (key, value) ->
        return if not key?.split?
        clearTimeout @timer if @timer
        @timer = setTimeout @save, @timeout

        keypath = key.split @sep
        object = @data
        while keypath.length > 1
            k = keypath.shift()
            if not object[k]?
                if not _.isNaN _.parseInt k
                    object = object[k] = []
                else
                    object = object[k] = {}
            else
                object = object[k]
                
        if keypath.length == 1 and object?
            if value?
                object[keypath[0]] = value
            else
                delete object[keypath[0]]
                    
    del: (key, value) -> @set key
    
    clear: ->
        clearTimeout @timer if @timer
        @data = {}
        
    #  0000000   0000000   000   000  00000000
    # 000       000   000  000   000  000     
    # 0000000   000000000   000 000   0000000 
    #      000  000   000     000     000     
    # 0000000   000   000      0      00000000

    save: (cb) =>
        return if not @file
        clearTimeout @timer if @timer
        @timer = null
        fs.mkdirs path.dirname(@file), (err) =>
            if err?
                log "[ERROR] can't create directory", path.dirname(@file), err if err?
                cb? !err?
            else
                str = noon.stringify @data, {indent: 2, maxalign: 8}
                atomic @file, str, (err) =>
                    log "[ERROR] can't save preferences file", @file, err if err?
                    cb? !err?
        
module.exports = Store
