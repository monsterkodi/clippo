# 0000000   00000000   00000000   000   0000000   0000000   000   000   0000000  000   000  000   000   0000000
#000   000  000   000  000   000  000  000       000   000  0000  000  000        000 000   0000  000  000     
#000000000  00000000   00000000   000  000       000   000  000 0 000  0000000     00000    000 0 000  000     
#000   000  000        000        000  000       000   000  000  0000       000     000     000  0000  000     
#000   000  000        000        000   0000000   0000000   000   000  0000000      000     000   000   0000000

fs      = require 'fs'
path    = require 'path'
plist   = require 'simple-plist'
childp  = require 'child_process'
resolve = require './resolve'

module.exports = (appName, outDir=".", size=1024) ->

    appName += ".app" if not appName.endsWith '.app'

    for appFolder in [
            "/Applications"
            "/Applications/Utilities"
            "/System/Library/CoreServices"
            "~/Applications"
        ]
        absPath = resolve path.join appFolder, appName
        conPath = path.join absPath, 'Contents'
        try
            infoPath = path.join conPath, 'Info.plist'
            fs.accessSync infoPath, fs.R_OK
            obj = plist.readFileSync infoPath
            if obj['CFBundleIconFile']?
                icnsPath = path.join path.dirname(infoPath), 'Resources', obj['CFBundleIconFile']
                icnsPath += ".icns" if not icnsPath.endsWith '.icns'
                fs.accessSync icnsPath, fs.R_OK 
                pngPath = resolve path.join outDir, path.basename(appName, path.extname(appName)) + ".png"
                childp.execSync "/usr/bin/sips -Z #{size} -s format png #{icnsPath} --out #{pngPath}"
                fs.accessSync pngPath, fs.R_OK
                return pngPath
            # else
                # console.log "no icon in plist #{infoPath}?", obj
        catch err
            # console.log "[ERROR] appIconSync: #{absPath} #{err}"
            continue
