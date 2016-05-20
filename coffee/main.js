(function() {
  var BrowserWindow, Tray, activateApp, activeApp, app, buffers, clipboard, createWindow, electron, ipc, listenClipboard, log, proc, showWindow, toggleWindow, tray, updateActiveApp, win;

  electron = require('electron');

  proc = require('child_process');

  app = electron.app;

  BrowserWindow = electron.BrowserWindow;

  Tray = electron.Tray;

  clipboard = electron.clipboard;

  ipc = electron.ipcMain;

  win = void 0;

  tray = void 0;

  buffers = [];

  activeApp = "";

  log = function() {
    return console.log(([].slice.call(arguments, 0)).join(" "));
  };

  updateActiveApp = function() {
    activeApp = proc.execSync("osascript -e \"tell application \\\"System Events\\\"\" -e \"set n to name of first application process whose frontmost is true\" -e \"end tell\" -e \"do shell script \\\"echo \\\" & n\"");
    return activeApp = String(activeApp).trim();
  };

  activateApp = function() {
    return proc.execSync("osascript -e \"tell application \\\"" + activeApp + "\\\" to activate\"");
  };

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

  listenClipboard = function() {
    var text;
    text = clipboard.readText();
    if (text !== buffers[buffers.length - 1]) {
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
      clipboard.writeText(arg);
      win.close();
      paste = function() {
        return proc.exec("osascript -e \"tell application \\\"System Events\\\" to keystroke \\\"v\\\" using command down\"");
      };
      return setTimeout(paste, 200);
    };
  })(this));

  createWindow = function() {
    log('create');
    win = new BrowserWindow({
      width: 800,
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
    win.on('close', function(event) {
      log('close!');
      activateApp();
      win.hide();
      app.dock.hide();
      return event.preventDefault();
    });
    win.on('closed', function() {
      log('closed');
      return win = null;
    });
    return win;
  };

  updateActiveApp();

  app.on('ready', function() {
    tray = new Tray(__dirname + "/../img/menu.png");
    tray.on('click', toggleWindow);
    if (app.dock) {
      app.dock.hide();
    }
    electron.globalShortcut.register('Command+Alt+V', showWindow);
    return listenClipboard();
  });

}).call(this);
