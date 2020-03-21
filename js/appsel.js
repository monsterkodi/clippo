(function() {
  var $, apps, browser, clipboard, current, electron, elem, findApps, highlight, ipc, keyname, last, lineForElem, log, openCurrent, path, pkg, prefs, ref, resolve, setScheme, toggleStyle, walkdir, win, winMain;

  ref = require('./tools/tools'), resolve = ref.resolve, last = ref.last, $ = ref.$;

  keyname = require('./tools/keyname');

  prefs = require('./tools/prefs');

  elem = require('./tools/elem');

  log = require('./tools/log');

  pkg = require('../package.json');

  path = require('path');

  walkdir = require('walkdir');

  electron = require('electron');

  clipboard = electron.clipboard;

  browser = electron.remote.BrowserWindow;

  ipc = electron.ipcRenderer;

  win = null;

  apps = {};

  current = 0;

  ipc.on('setWinID', function(event, id) {
    return winMain(id);
  });

  winMain = function(id) {
    window.win = win = browser.fromId(id);
    win.webContents.openDevTools();
    prefs.init((electron.remote.app.getPath('userData')) + "/" + pkg.productName + ".noon");
    setScheme(prefs.get('scheme', 'dark.css'));
    return findApps();
  };

  findApps = function() {
    var appFolder, appFolders, foldersLeft, i, len, results, walk;
    appFolders = ["/Applications", "/Applications/Utilities"];
    foldersLeft = appFolders.length;
    results = [];
    for (i = 0, len = appFolders.length; i < len; i++) {
      appFolder = appFolders[i];
      walk = walkdir(resolve(appFolder), {
        no_recurse: true
      });
      walk.on('error', function(err) {
        return log("[ERROR] " + err);
      });
      walk.on('end', function() {
        foldersLeft -= 1;
        if (foldersLeft === 0) {
          apps['Finder'] = "/System/Library/CoreServices/Finder.app";
          return log(apps);
        }
      });
      results.push(walk.on('directory', function(dir) {
        var name;
        if (path.extname(dir) === '.app') {
          name = path.basename(dir, '.app');
          return apps[name] = dir;
        }
      }));
    }
    return results;
  };

  openCurrent = function() {
    return win != null ? win.close() : void 0;
  };

  highlight = (function(_this) {
    return function(index) {
      var cdiv, line;
      cdiv = $('.current');
      if (cdiv != null) {
        cdiv.classList.remove('current');
      }
      current = Math.max(0, Math.min(index, buffers.length - 1));
      line = $(current);
      if (line != null) {
        line.classList.add('current');
        return line.scrollIntoViewIfNeeded();
      }
    };
  })(this);

  window.highlight = highlight;

  window.onClick = function(index) {
    highlight(index);
    return doPaste();
  };

  lineForElem = function(elem) {
    var ref1;
    if ((ref1 = elem.classList) != null ? ref1.contains('line-div') : void 0) {
      return elem;
    }
    if (elem.parentNode != null) {
      return lineForElem(elem.parentNode);
    }
  };

  $('appsel').addEventListener("mouseover", function(event) {
    var id, ref1;
    id = (ref1 = lineForElem(event.target)) != null ? ref1.id : void 0;
    if (id != null) {
      return highlight(id);
    }
  });

  window.onunload = function() {
    return document.onkeydown = null;
  };

  toggleStyle = function() {
    var currentScheme, link, nextScheme, nextSchemeIndex, schemes;
    link = $('style-link');
    currentScheme = last(link.href.split('/'));
    schemes = ['dark.css', 'bright.css'];
    nextSchemeIndex = (schemes.indexOf(currentScheme) + 1) % schemes.length;
    nextScheme = schemes[nextSchemeIndex];
    ipc.send('setScheme', path.basename(nextScheme, '.css'));
    prefs.set('scheme', nextScheme);
    return setScheme(nextScheme);
  };

  setScheme = function(scheme) {
    var link, newlink;
    link = $('style-link');
    newlink = elem('link', {
      rel: 'stylesheet',
      type: 'text/css',
      href: 'css/' + scheme,
      id: 'style-link'
    });
    return link.parentNode.replaceChild(newlink, link);
  };

  document.onkeydown = function(event) {
    var key;
    key = keyname.ofEvent(event);
    log('key', key);
    switch (key) {
      case 'i':
        return toggleStyle();
      case 'esc':
        return win != null ? win.close() : void 0;
      case 'down':
      case 'right':
        return highlight(current - 1);
      case 'up':
      case 'left':
        return highlight(current + 1);
      case 'enter':
        return openCurrent();
      case 'command+alt+i':
        return win != null ? win.webContents.openDevTools() : void 0;
    }
  };

}).call(this);
