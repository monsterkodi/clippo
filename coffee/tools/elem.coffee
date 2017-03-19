
# 00000000  000      00000000  00     00  
# 000       000      000       000   000  
# 0000000   000      0000000   000000000  
# 000       000      000       000 0 000  
# 00000000  0000000  00000000  000   000  

_ = require 'lodash'

elem = (typ, opt) ->
    
    if _.isPlainObject typ
        opt = typ 
        typ = opt.typ
        
    opt = {}    if not opt?
    typ = 'div' if not typ?

    e = document.createElement typ
    
    if opt.text? and (_.isString(opt.text) or _.isNumber(opt.text))
        e.textContent = opt.text
        delete opt.text
    
    if opt.html? and _.isString opt.html
        e.innerHTML = opt.html
        delete opt.html
    
    if opt.child? and _.isElement opt.child
        e.appendChild opt.child
        delete opt.child
        
    if opt.children? and _.isArray opt.children
        for c in opt.children
            e.appendChild c if _.isElement c
        delete opt.children
        
    for k in Object.keys opt
        e.setAttribute k, opt[k]
    
    e

module.exports = elem