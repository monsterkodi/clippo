# 0000000   00000000   00000000   000   0000000   0000000   000   000
#000   000  000   000  000   000  000  000       000   000  0000  000
#000000000  00000000   00000000   000  000       000   000  000 0 000
#000   000  000        000        000  000       000   000  000  0000
#000   000  000        000        000   0000000   0000000   000   000

fs   = require 'fs'
path = require 'path'
noon = require 'noon'
proc = require 'child_process'

args = require('karg') """
icon
    app     . ? name of the application . *
    outdir  . ? output folder           . = .
    size    . ? icon size               . = 128
"""

args.app += ".app" if not args.app.endsWith '.app'

resolve = (p) -> path.normalize path.resolve p.replace /\~/, process.env.HOME

for appFolder in ["/Applications", "/Applications/Utilities", "/System/Library/CoreServices", "~/Applications"]
    absPath = resolve appFolder + "/" + args.app
    conPath = absPath + "/Contents"

    reportDone = (png) -> (err) ->
        return if err?
        console.log png 
    
    convertIcns = (icns) -> (err) ->
        if err? 
            log err
            return
        pngPath = resolve args.outdir + "/" + path.basename(args.app, path.extname(args.app)) + ".png"
        script = """
        tell application "Image Events"
            set f to (POSIX file "#{icns}")
            set img to open f
            tell img
                scale to size "#{args.size}"
                save as PNG in "#{pngPath}"
            end tell
        end tell
        """
        scriptArg = ( "-e \"#{l.replace(/\"/g, "\\\"")}\"" for l in script.split("\n") ).join(" ")
        proc.exec "osascript " + scriptArg, reportDone(pngPath)
        
    parseInfo = (inf) -> (err) ->
        return if err?
        obj = noon.load inf
        if obj['CFBundleIconFile']?
            icnsPath = path.dirname(inf) + "/Resources/" + obj['CFBundleIconFile']
            icnsPath += ".icns" if not icnsPath.endsWith '.icns'
            fs.access icnsPath, fs.R_OK, convertIcns icnsPath
        
    searchIcon = (con) -> (err) -> 
        return if err?
        infoPath = con + "/Info.plist"
        fs.access infoPath, fs.R_OK, parseInfo infoPath
        
    fs.access absPath, fs.R_OK, searchIcon conPath
