(function() {
  var BrowserWindow, Menu, Tray, activateApp, activeApp, app, applist, buffers, clipboard, createWindow, electron, getActiveApp, ipc, listenClipboard, log, originApp, proc, showWindow, toggleWindow, tray, updateActiveApp, win;

  electron = require('electron');

  proc = require('child_process');

  app = electron.app;

  BrowserWindow = electron.BrowserWindow;

  Tray = electron.Tray;

  Menu = electron.Menu;

  clipboard = electron.clipboard;

  ipc = electron.ipcMain;

  win = void 0;

  tray = void 0;

  buffers = [];

  applist = [];

  activeApp = "";

  originApp = null;

  log = function() {
    return console.log(([].slice.call(arguments, 0)).join(" "));
  };

  getActiveApp = function() {
    var appName;
    appName = proc.execSync("osascript -e \"tell application \\\"System Events\\\"\" -e \"set n to name of first application process whose frontmost is true\" -e \"end tell\" -e \"do shell script \\\"echo \\\" & n\"");
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
      return proc.execSync("osascript -e \"tell application \\\"" + activeApp + "\\\" to activate\"");
    }
  };

  listenClipboard = function() {
    var text;
    text = clipboard.readText();
    if (text !== buffers[buffers.length - 1]) {
      applist.push(originApp != null ? originApp : getActiveApp());
      originApp = void 0;
      log(applist);
      buffers.push(text);
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
      clipboard.writeText(buffers[arg]);
      buffers.splice(arg, 1);
      originApp = applist.splice(arg, 1)[0];
      win.close();
      paste = function() {
        return proc.exec("osascript -e \"tell application \\\"System Events\\\" to keystroke \\\"v\\\" using command down\"");
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
