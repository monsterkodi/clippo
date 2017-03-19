
#  0000000   0000000     0000000   000   000  000000000  
# 000   000  000   000  000   000  000   000     000     
# 000000000  0000000    000   000  000   000     000     
# 000   000  000   000  000   000  000   000     000     
# 000   000  0000000     0000000    0000000      000     

pkg      = require '../../package.json'
electron = require 'electron'
opener   = require 'opener'

Browser  = electron.BrowserWindow
ipc      = electron.ipcMain

class About
    
    @win = null

    @show: (opt) ->
                
        win = new Browser
            backgroundColor: opt?.background ? '#222'
            preloadWindow:   true
            center:          true
            hasShadow:       true
            alwaysOnTop:     true
            resizable:       false
            frame:           false
            show:            false
            fullscreenable:  false
            minimizable:     false
            maximizable:     false
            webPreferences:
                webSecurity: false
            width:           400
            height:          400

        version = opt.version ? pkg.version
        html = """
            <style type="text/css">
                
                #about {
                    text-align:    center;
                    cursor:        pointer;
                    outline-width: 0;
                }
                
                a { 
                    color:          #{opt?.color ? '#333'};
                    font-family:    Verdana, sans-serif;
                    text-decoration: none;
                }
                a:hover { 
                    color:          #f80; 
                }
                
                #image {
                    margin-top:     50px; 
                    width:          250px;
                    height:         250px;
                }
                
                #version { 
                    margin-top:     30px; 
                }
            </style>
            <div id='about' tabindex=0>
                <img id='image' src="file://#{opt.img}"/>
                <div id='version'>
                    <a id='link' href="#">#{version}</a>
                </div>
            </div>
            <script>
                var electron = require('electron');
                var ipc = electron.ipcRenderer;
                var l = document.getElementById('version');
                l.onclick = function () { ipc.send('openRepoURL'); }
                var a = document.getElementById('about');
                a.onclick   = function () { ipc.send('closeAbout'); }
                a.onkeydown = function () { ipc.send('closeAbout'); }
                a.onblur    = function () { ipc.send('closeAbout'); }
                a.focus()
            </script>
        """

        ipc.on 'openRepoURL', About.openRepoURL
        ipc.on 'closeAbout',  About.closeAbout

        win.loadURL "data:text/html;charset=utf-8," + encodeURI(html) 
        win.on 'ready-to-show', -> win.show()
        # win.webContents.openDevTools()
        About.win = win
        win

    @closeAbout: -> 
        ipc.removeAllListeners 'openRepoURL'
        ipc.removeAllListeners 'closeAbout'
        About.win?.close()
        About.win = null
        
    @openRepoURL: ->
        url = pkg.repository.url
        url = url.slice 4 if url.startsWith "git+" 
        url = url.slice 0, url.length-4 if url.endsWith ".git" 
        opener url 

module.exports = About.show