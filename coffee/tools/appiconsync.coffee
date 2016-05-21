# 0000000   00000000   00000000   000   0000000   0000000   000   000   0000000  000   000  000   000   0000000
#000   000  000   000  000   000  000  000       000   000  0000  000  000        000 000   0000  000  000     
#000000000  00000000   00000000   000  000       000   000  000 0 000  0000000     00000    000 0 000  000     
#000   000  000        000        000  000       000   000  000  0000       000     000     000  0000  000     
#000   000  000        000        000   0000000   0000000   000   000  0000000      000     000   000   0000000

fs      = require 'fs'
path    = require 'path'
noon    = require 'noon'
proc    = require 'child_process'
osas    = require './osascript'
resolve = require './resolve'

module.exports = (appName, outDir=".", size=128) ->

    appName += ".app" if not appName.endsWith '.app'

    for appFolder in [
            "/Applications"
            "/Applications/Utilities"
            "/System/Library/CoreServices"
            "~/Applications"
        ]
        absPath = resolve appFolder + "/" + appName
        conPath = absPath + "/Contents"
        try
            fs.accessSync absPath, fs.R_OK
            infoPath = conPath + "/Info.plist"
            fs.accessSync infoPath, fs.R_OK
            obj = noon.load infoPath
            if obj['CFBundleIconFile']?
                icnsPath = path.dirname(infoPath) + "/Resources/" + obj['CFBundleIconFile']
                icnsPath += ".icns" if not icnsPath.endsWith '.icns'
                fs.accessSync icnsPath, fs.R_OK 
                pngPath = resolve outDir + "/" + path.basename(appName, path.extname(appName)) + ".png"
                script = osas """
                tell application "Image Events"
                    set f to (POSIX file "#{icnsPath}")
                    set img to open f
                    tell img
                        scale to size "#{size}"
                        save as PNG in "#{pngPath}"
                    end tell
                end tell
                """
                proc.execSync "osascript " + script
                return pngPath
        catch err
            continue
