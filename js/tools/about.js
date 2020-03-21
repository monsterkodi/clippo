(function() {
  var About, Browser, electron, ipc, opener, pkg;

  pkg = require('../../package.json');

  electron = require('electron');

  opener = require('opener');

  Browser = electron.BrowserWindow;

  ipc = electron.ipcMain;

  About = (function() {
    function About() {}

    About.win = null;

    About.show = function(opt) {
      var html, ref, ref1, ref2, version, win;
      win = new Browser({
        backgroundColor: (ref = opt != null ? opt.background : void 0) != null ? ref : '#222',
        preloadWindow: true,
        center: true,
        hasShadow: true,
        alwaysOnTop: true,
        resizable: false,
        frame: false,
        show: false,
        fullscreenable: false,
        minimizable: false,
        maximizable: false,
        webPreferences: {
          webSecurity: false
        },
        width: 400,
        height: 400
      });
      version = (ref1 = opt.version) != null ? ref1 : pkg.version;
      html = "<style type=\"text/css\">\n    \n    #about {\n        text-align:    center;\n        cursor:        pointer;\n        outline-width: 0;\n    }\n    \n    a { \n        color:          " + ((ref2 = opt != null ? opt.color : void 0) != null ? ref2 : '#333') + ";\n        font-family:    Verdana, sans-serif;\n        text-decoration: none;\n    }\n    a:hover { \n        color:          #f80; \n    }\n    \n    #image {\n        margin-top:     50px; \n        width:          250px;\n        height:         250px;\n    }\n    \n    #version { \n        margin-top:     30px; \n    }\n</style>\n<div id='about' tabindex=0>\n    <img id='image' src=\"file://" + opt.img + "\"/>\n    <div id='version'>\n        <a id='link' href=\"#\">" + version + "</a>\n    </div>\n</div>\n<script>\n    var electron = require('electron');\n    var ipc = electron.ipcRenderer;\n    var l = document.getElementById('version');\n    l.onclick = function () { ipc.send('openRepoURL'); }\n    var a = document.getElementById('about');\n    a.onclick   = function () { ipc.send('closeAbout'); }\n    a.onkeydown = function () { ipc.send('closeAbout'); }\n    a.onblur    = function () { ipc.send('closeAbout'); }\n    a.focus()\n</script>";
      ipc.on('openRepoURL', About.openRepoURL);
      ipc.on('closeAbout', About.closeAbout);
      win.loadURL("data:text/html;charset=utf-8," + encodeURI(html));
      win.on('ready-to-show', function() {
        return win.show();
      });
      About.win = win;
      return win;
    };

    About.closeAbout = function() {
      var ref;
      ipc.removeAllListeners('openRepoURL');
      ipc.removeAllListeners('closeAbout');
      if ((ref = About.win) != null) {
        ref.close();
      }
      return About.win = null;
    };

    About.openRepoURL = function() {
      var url;
      url = pkg.repository.url;
      if (url.startsWith("git+")) {
        url = url.slice(4);
      }
      if (url.endsWith(".git")) {
        url = url.slice(0, url.length - 4);
      }
      return opener(url);
    };

    return About;

  })();

  module.exports = About.show;

}).call(this);
