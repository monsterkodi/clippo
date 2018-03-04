# 0000000   00000000   00000000   000   0000000   0000000   000   000   0000000  000   000  000   000   0000000
#000   000  000   000  000   000  000  000       000   000  0000  000  000        000 000   0000  000  000     
#000000000  00000000   00000000   000  000       000   000  000 0 000  0000000     00000    000 0 000  000     
#000   000  000        000        000  000       000   000  000  0000       000     000     000  0000  000     
#000   000  000        000        000   0000000   0000000   000   000  0000000      000     000   000   0000000

{ escapePath, resolve, childp, fs }       = require 'kxk' 

plist   = require 'simple-plist'
childp  = require 'child_process'

module.exports = (appName, outDir=".", size=1024) ->

    appName += ".app" if not appName.endsWith '.app'

    for appFolder in [
            "/Applications"
            "/Applications/Utilities"
            "/System/Library/CoreServices"
            "~/Applications"
        ]
        absPath = slash.resolve slash.join appFolder, appName
        conPath = slash.join absPath, 'Contents'
        try
            infoPath = slash.join conPath, 'Info.plist'
            fs.accessSync infoPath, fs.R_OK
            obj = plist.readFileSync infoPath
            if obj['CFBundleIconFile']?
                icnsPath = slash.join slash.dirname(infoPath), 'Resources', obj['CFBundleIconFile']
                icnsPath += ".icns" if not icnsPath.endsWith '.icns'
                fs.accessSync icnsPath, fs.R_OK 
                pngPath = slash.resolve slash.join outDir, slash.base(appName) + ".png"
                childp.execSync "/usr/bin/sips -Z #{size} -s format png \"#{escapePath icnsPath}\" --out \"#{escapePath pngPath}\""
                fs.accessSync pngPath, fs.R_OK
                return pngPath
        catch err
            continue
