#000       0000000    0000000 
#000      000   000  000      
#000      000   000  000  0000
#000      000   000  000   000
#0000000   0000000    0000000 

str  = require './str'

log = -> console.log (str(s) for s in [].slice.call arguments, 0).join " "

module.exports = log