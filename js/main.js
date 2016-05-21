(function() {
  var BrowserWindow, Menu, Tray, activateApp, activeApp, app, buffers, clipboard, createWindow, debug, electron, getActiveApp, ipc, listenClipboard, log, originApp, osascript, proc, saveAppIcon, showWindow, toggleWindow, tray, updateActiveApp, win;

  electron = require('electron');

  proc = require('child_process');

  osascript = require('./tools/osascript');

  app = electron.app;

  BrowserWindow = electron.BrowserWindow;

  Tray = electron.Tray;

  Menu = electron.Menu;

  clipboard = electron.clipboard;

  ipc = electron.ipcMain;

  win = void 0;

  tray = void 0;

  buffers = [];

  activeApp = "";

  originApp = null;

  debug = false;

  log = function() {
    return console.log(([].slice.call(arguments, 0)).join(" "));
  };

  getActiveApp = function() {
    var appName, script;
    script = osascript("tell application \"System Events\"\n    set n to name of first application process whose frontmost is true\nend tell\ndo shell script \"echo \" & n");
    appName = proc.execSync("osascript " + script);
    return appName = String(appName).trim();
  };

  updateActiveApp = function() {
    var appName;
    appName = getActiveApp();
    if (appName !== app.getName() && appName !== "Electron") {
      return activeApp = appName;
    }
  };

  activateApp = function() {
    if (activeApp.length) {
      return proc.execSync("osascript " + osascript("tell application \"" + activeApp + "\" to activate"));
    }
  };

  saveAppIcon = function(appName) {
    return proc.exec("node js/tools/appicon.js \"" + appName + "\" -o icons -s 64", function() {});
  };

  listenClipboard = function() {
    var text;
    text = clipboard.readText();
    if ((buffers.length === 0) || (text !== buffers[buffers.length - 1].text)) {
      buffers.push({
        text: text,
        app: originApp != null ? originApp : getActiveApp()
      });
      saveAppIcon(buffers[buffers.length - 1].app);
      originApp = void 0;
      if (win != null) {
        win.webContents.send('reload');
      }
    }
    return setTimeout(listenClipboard, 500);
  };

  ipc.on('get-buffers', (function(_this) {
    return function(event, arg) {
      return event.returnValue = buffers;
    };
  })(this));

  ipc.on('paste', (function(_this) {
    return function(event, arg) {
      var paste;
      clipboard.writeText(buffers[arg].text);
      originApp = buffers.splice(arg, 1)[0].app;
      win.close();
      paste = function() {
        return proc.exec("osascript " + osascript("tell application \"System Events\" to keystroke \"v\" using command down"));
      };
      return setTimeout(paste, 10);
    };
  })(this));

  toggleWindow = function() {
    if (win != null ? win.isVisible() : void 0) {
      win.hide();
      return app.dock.hide();
    } else {
      return showWindow();
    }
  };

  showWindow = function() {
    updateActiveApp();
    if (win != null) {
      win.show();
      return app.dock.show();
    } else {
      return createWindow();
    }
  };

  createWindow = function() {
    win = new BrowserWindow({
      width: 1000,
      height: 1200,
      titleBarStyle: 'hidden',
      backgroundColor: '#181818',
      maximizable: true,
      minimizable: false,
      fullscreen: false,
      show: true
    });
    win.loadURL("file://" + __dirname + "/../index.html");
    if (debug) {
      win.webContents.openDevTools();
    }
    app.dock.show();
    win.on('closed', function() {
      return win = null;
    });
    win.on('close', function(event) {
      activateApp();
      win.hide();
      app.dock.hide();
      return event.preventDefault();
    });
    return win;
  };

  app.on('ready', function() {
    tray = new Tray(__dirname + "/../img/menu.png");
    tray.on('click', toggleWindow);
    if (app.dock) {
      app.dock.hide();
    }
    electron.globalShortcut.register('Command+Alt+V', showWindow);
    Menu.setApplicationMenu(Menu.buildFromTemplate([
      {
        label: app.getName(),
        submenu: [
          {
            label: 'Close Window',
            accelerator: 'Command+W',
            click: function() {
              return win.close();
            }
          }, {
            label: 'Quit',
            accelerator: 'Command+Q',
            click: function() {
              return app.exit(0);
            }
          }
        ]
      }
    ]));
    return listenClipboard();
  });

}).call(this);
