(function() {
  var BrowserWindow, Menu, Tray, activateApp, activeApp, app, appIconSync, buffers, chokidar, clearBuffer, clipboard, clippoWatch, copyIndex, createWindow, debug, electron, fs, getActiveApp, iconDir, ipc, log, nativeImage, noon, originApp, osascript, pkg, prefs, proc, readBuffer, readPBjson, reload, resolve, saveAppIcon, saveBounds, saveBuffer, showWindow, toggleWindow, tray, updateActiveApp, watchClipboard, win;

  electron = require('electron');

  chokidar = require('chokidar');

  proc = require('child_process');

  noon = require('noon');

  fs = require('fs');

  osascript = require('./tools/osascript');

  resolve = require('./tools/resolve');

  appIconSync = require('./tools/appiconsync');

  prefs = require('./tools/prefs');

  log = require('./tools/log');

  pkg = require('../package.json');

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

  clippoWatch = null;

  debug = false;

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
    var error;
    if (activeApp.length) {
      try {
        return proc.execSync("osascript " + osascript("tell application \"" + activeApp + "\" to activate"));
      } catch (error) {

      }
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

  readPBjson = function(path) {
    var currentApp, isEmpty, maxBuffers, obj;
    obj = noon.load(path);
    isEmpty = buffers.length === 0;
    if ((obj.text == null) && (obj.image == null)) {
      return;
    }
    if (buffers.length && obj.count === buffers[buffers.length - 1].count) {
      return;
    }
    currentApp = getActiveApp();
    if (currentApp === 'Electron') {
      currentApp = 'clippo';
    }
    if ((!originApp) && (!currentApp)) {
      originApp = 'clippo';
    }
    saveAppIcon(originApp != null ? originApp : currentApp);
    if (obj.image != null) {
      buffers.push({
        app: currentApp,
        image: obj.image,
        count: obj.count
      });
    }
    if (obj.text != null) {
      buffers.push({
        app: currentApp,
        text: obj.text,
        count: obj.count
      });
    }
    maxBuffers = prefs.get('maxBuffers', 50);
    while (buffers.length > maxBuffers) {
      buffers.shift();
    }
    originApp = void 0;
    return reload(buffers.length - 1);
  };

  watchClipboard = function() {
    var watcher;
    clippoWatch = proc.spawn(__dirname + "/../bin/clippo-watch", [], {
      cwd: __dirname + "/../bin",
      detached: false
    });
    watcher = chokidar.watch(__dirname + "/../bin/pb.json", {
      persistent: true
    });
    watcher.on('add', (function(_this) {
      return function(path) {
        return readPBjson(path);
      };
    })(this));
    return watcher.on('change', (function(_this) {
      return function(path) {
        return readPBjson(path);
      };
    })(this));
  };

  ipc.on('get-buffers', (function(_this) {
    return function(event) {
      return event.returnValue = buffers;
    };
  })(this));

  ipc.on('open-console', (function(_this) {
    return function() {
      return win != null ? win.webContents.openDevTools() : void 0;
    };
  })(this));

  copyIndex = function(index) {
    var image;
    if ((index < 0) || (index > buffers.length - 1)) {
      return;
    }
    if (buffers[index].image) {
      image = nativeImage.createFromBuffer(new Buffer(buffers[index].image, 'base64'));
      if (!image.isEmpty() && (image.getSize().width * image.getSize().height > 0)) {
        clipboard.writeImage(image, 'image/png');
      }
    }
    if ((buffers[index].text != null) && (buffers[index].text.length > 0)) {
      return clipboard.writeText(buffers[index].text, 'text/plain');
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
      return reload(arg - 1);
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

  reload = function(index) {
    if (index == null) {
      index = 0;
    }
    return win != null ? win.webContents.send('load', index) : void 0;
  };

  clearBuffer = function() {
    buffers = [];
    saveBuffer();
    return reload();
  };

  saveBuffer = function() {
    var json;
    json = JSON.stringify(buffers.slice(-prefs.get('maxBuffers', 50)), null, '    ');
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
            label: "About " + pkg.name,
            click: function() {
              return clipboard.writeText(pkg.name + " v" + pkg.version);
            }
          }, {
            label: 'Clear Buffers',
            accelerator: 'Command+K',
            click: function() {
              return clearBuffer();
            }
          }, {
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
              if (clippoWatch != null) {
                clippoWatch.kill();
              }
              return app.exit(0);
            }
          }
        ]
      }
    ]));
    prefs.init((app.getPath('userData')) + "/clippo.json", {
      maxBuffers: 50,
      shortcut: 'Command+Alt+V'
    });
    electron.globalShortcut.register(prefs.get('shortcut'), showWindow);
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
    return watchClipboard();
  });

}).call(this);
