(function() {
  var BrowserWindow, Menu, Tray, activateApp, activeApp, app, appIconSync, buffers, clipboard, copyIndex, createWindow, debug, electron, fs, getActiveApp, iconDir, ipc, listenClipboard, log, nativeImage, originApp, osascript, prefs, proc, readBuffer, resolve, saveAppIcon, saveBounds, saveBuffer, showWindow, toggleWindow, tray, updateActiveApp, win,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  electron = require('electron');

  proc = require('child_process');

  osascript = require('./tools/osascript');

  resolve = require('./tools/resolve');

  appIconSync = require('./tools/appiconsync');

  prefs = require('./tools/prefs');

  fs = require('fs');

  app = electron.app;

  BrowserWindow = electron.BrowserWindow;

  Tray = electron.Tray;

  Menu = electron.Menu;

  clipboard = electron.clipboard;

  ipc = electron.ipcMain;

  nativeImage = electron.nativeImage;

  win = void 0;

  tray = void 0;

  buffers = [];

  iconDir = "";

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
    var error, iconPath, png;
    iconPath = iconDir + "/" + appName + ".png";
    try {
      fs.accessSync(iconPath, fs.R_OK);
    } catch (error) {
      png = appIconSync(appName, iconDir, 64);
      if (!png) {
        appName = "clippo";
      }
    }
    return appName;
  };

  listenClipboard = function() {
    var currentApp, formats, image, imageSize, info, isEmpty, otherImage, otherText, text;
    formats = clipboard.availableFormats();
    if (indexOf.call(formats, 'text/plain') >= 0) {
      text = clipboard.readText();
    }
    if (indexOf.call(formats, 'image/png') >= 0) {
      image = clipboard.readImage();
    }
    if (image != null) {
      imageSize = image.getSize().width * image.getSize().height;
    }
    if (imageSize === 0) {
      image = null;
    }
    if ((text != null) || (image != null)) {
      isEmpty = buffers.length === 0;
      if (!isEmpty) {
        otherText = text !== buffers[buffers.length - 1].text;
        if (image != null) {
          if (imageSize > 1000000) {
            otherImage = imageSize !== buffers[buffers.length - 1].imageSize;
          } else {
            log('image size', imageSize);
            otherImage = (image != null) && image.toPng().toString('base64') !== buffers[buffers.length - 1].image;
          }
        }
      }
      if (isEmpty || otherText || otherImage) {
        currentApp = getActiveApp();
        if (currentApp === 'Electron') {
          currentApp = 'clippo';
        }
        if ((!originApp) && (!currentApp)) {
          originApp = 'clippo';
        }
        info = {
          app: saveAppIcon(originApp != null ? originApp : currentApp)
        };
        if (text != null) {
          info.text = text;
        }
        if (image != null) {
          info.image = image.toPng().toString('base64');
        }
        if (imageSize > 1000000) {
          info.imageSize = imageSize;
        }
        buffers.push(info);
        originApp = void 0;
        if (win != null) {
          win.webContents.send('load');
        }
      }
    }
    return setTimeout(listenClipboard, 500);
  };

  ipc.on('get-buffers', (function(_this) {
    return function(event, arg) {
      return event.returnValue = buffers;
    };
  })(this));

  copyIndex = function(index) {
    var image;
    if ((index < 0) || (index > buffers.length - 1)) {
      return;
    }
    if (buffers[index].text) {
      clipboard.writeText(buffers[index].text);
    }
    if (buffers[index].image) {
      image = nativeImage.createFromBuffer(new Buffer(buffers[index].image, 'base64'));
      return clipboard.writeImage(image);
    }
  };

  ipc.on('paste', (function(_this) {
    return function(event, arg) {
      var paste;
      copyIndex(arg);
      originApp = buffers.splice(arg, 1)[0].app;
      win.close();
      paste = function() {
        return proc.exec("osascript " + osascript("tell application \"System Events\" to keystroke \"v\" using command down"));
      };
      return setTimeout(paste, 10);
    };
  })(this));

  ipc.on('del', (function(_this) {
    return function(event, arg) {
      if (arg === buffers.length - 1) {
        clipboard.clear();
        copyIndex(buffers.length - 2);
      }
      buffers.splice(arg, 1);
      return win != null ? win.webContents.send('load', arg - 1) : void 0;
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
    var bounds;
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
    bounds = prefs.get('bounds');
    if (bounds != null) {
      win.setBounds(bounds);
    }
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

  saveBounds = function() {
    if (win != null) {
      return prefs.set('bounds', win.getBounds());
    }
  };

  saveBuffer = function() {
    var json;
    json = JSON.stringify(buffers.slice(-prefs.get('maxBuffers', 20)), null, '    ');
    return fs.writeFile((app.getPath('userData')) + "/clippo-buffers.json", json, {
      encoding: 'utf8'
    });
  };

  readBuffer = function() {
    var error;
    buffers = [];
    try {
      return buffers = JSON.parse(fs.readFileSync((app.getPath('userData')) + "/clippo-buffers.json", {
        encoding: 'utf8'
      }));
    } catch (error) {

    }
  };

  app.on('ready', function() {
    var error, error1;
    tray = new Tray(__dirname + "/../img/menu.png");
    tray.on('click', toggleWindow);
    if (app.dock) {
      app.dock.hide();
    }
    Menu.setApplicationMenu(Menu.buildFromTemplate([
      {
        label: app.getName(),
        submenu: [
          {
            label: 'Save Buffers',
            accelerator: 'Command+S',
            click: function() {
              return saveBuffer();
            }
          }, {
            label: 'Close Window',
            accelerator: 'Command+W',
            click: function() {
              return win.close();
            }
          }, {
            label: 'Quit',
            accelerator: 'Command+Q',
            click: function() {
              saveBounds();
              saveBuffer();
              return app.exit(0);
            }
          }
        ]
      }
    ]));
    prefs.init((app.getPath('userData')) + "/clippo.json", {
      maxBuffers: 20,
      shortcut: 'Command+Alt+V'
    });
    electron.globalShortcut.register(prefs.get('shortcut'), showWindow);
    electron.globalShortcut.register('Command+Alt+I', function() {
      return win != null ? win.webContents.openDevTools() : void 0;
    });
    readBuffer();
    iconDir = resolve(__dirname + "/../icons");
    try {
      fs.accessSync(iconDir, fs.R_OK);
    } catch (error) {
      try {
        fs.mkdirSync(iconDir);
      } catch (error1) {
        log("can't create icon directory " + iconDir);
      }
    }
    return listenClipboard();
  });

}).call(this);
