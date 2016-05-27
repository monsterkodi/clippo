#  0000000  000000000  00000000 
# 000          000     000   000
# 0000000      000     0000000  
#      000     000     000   000
# 0000000      000     000   000

noon = require 'noon'

str = (o) ->
    return 'null' if not o?
    if typeof o == 'object'
        if o._str?
            o._str()
        else
            "\n" + noon.stringify o, 
            circular: true
    else
        String o

module.exports = str