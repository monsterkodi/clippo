
fs   = require 'fs'
path = require 'path'
noon = require 'noon'
proc = require 'child_process'

args = require('karg') """
icon
    app         . ? the name of the application . *
    outdir      . ? the output folder           . = .    
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
        proc.exec "osascript -e \"tell application \\\"Image Events\\\"\" -e \"set f to (POSIX file \\\"#{icns}\\\")\" -e \"set img to open f\" -e \"tell img\" -e \"scale to size \\\"128\\\"\" -e \"save as PNG in \\\"#{pngPath}\\\"\" -e \"end tell\"  -e \"end tell\"", reportDone(pngPath)
        
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
