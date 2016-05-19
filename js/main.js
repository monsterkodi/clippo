(function() {
  var BrowserWindow, Tray, app, buffers, clipboard, createWindow, electron, ipc, listenClipboard, toggleWindow, win;

  electron = require('electron');

  app = electron.app;

  BrowserWindow = electron.BrowserWindow;

  Tray = electron.Tray;

  clipboard = electron.clipboard;

  ipc = electron.ipcMain;

  win = void 0;

  buffers = [];

  toggleWindow = function() {
    if (win != null) {
      if (win.isVisible()) {
        return win.hide();
      } else {
        return win.show();
      }
    } else {
      createWindow();
      return win.show();
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
    return setTimeout(listenClipboard, 1000);
  };

  ipc.on('get-buffers', (function(_this) {
    return function(event, arg) {
      return event.returnValue = buffers;
    };
  })(this));

  createWindow = function() {
    win = new BrowserWindow({
      width: 800,
      height: 1200,
      titleBarStyle: 'hidden',
      backgroundColor: '#181818',
      maximizable: true,
      minimizable: false,
      fullscreen: false,
      show: false
    });
    win.loadURL("file://" + __dirname + "/../index.html");
    win.on('closed', function() {
      return win = null;
    });
    return win;
  };

  app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') {
      return app.quit();
    }
  });

  app.on('activate', function() {
    if (win === null) {
      return createWindow();
    }
  });

  app.on('ready', function() {
    var tray;
    tray = new Tray('./img/menu.png');
    tray.on('click', toggleWindow);
    if (app.dock) {
      app.dock.hide();
    }
    electron.globalShortcut.register('Command+Alt+V', toggleWindow);
    createWindow();
    return listenClipboard();
  });

}).call(this);
