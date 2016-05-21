(function() {
  var absPath, appFolder, args, conPath, convertIcns, fs, i, len, noon, osas, parseInfo, path, proc, ref, reportDone, resolve, searchIcon;

  fs = require('fs');

  path = require('path');

  noon = require('noon');

  proc = require('child_process');

  osas = require('./osascript');

  args = require('karg')("icon\n    app     . ? name of the application . *\n    outdir  . ? output folder           . = .\n    size    . ? icon size               . = 128");

  if (!args.app.endsWith('.app')) {
    args.app += ".app";
  }

  resolve = function(p) {
    return path.normalize(path.resolve(p.replace(/\~/, process.env.HOME)));
  };

  ref = ["/Applications", "/Applications/Utilities", "/System/Library/CoreServices", "~/Applications"];
  for (i = 0, len = ref.length; i < len; i++) {
    appFolder = ref[i];
    absPath = resolve(appFolder + "/" + args.app);
    conPath = absPath + "/Contents";
    reportDone = function(png) {
      return function(err) {
        if (err != null) {
          return;
        }
        return console.log(png);
      };
    };
    convertIcns = function(icns) {
      return function(err) {
        var pngPath, script;
        if (err != null) {
          log(err);
          return;
        }
        pngPath = resolve(args.outdir + "/" + path.basename(args.app, path.extname(args.app)) + ".png");
        script = osas("tell application \"Image Events\"\n    set f to (POSIX file \"" + icns + "\")\n    set img to open f\n    tell img\n        scale to size \"" + args.size + "\"\n        save as PNG in \"" + pngPath + "\"\n    end tell\nend tell");
        return proc.exec("osascript " + script, reportDone(pngPath));
      };
    };
    parseInfo = function(inf) {
      return function(err) {
        var icnsPath, obj;
        if (err != null) {
          return;
        }
        obj = noon.load(inf);
        if (obj['CFBundleIconFile'] != null) {
          icnsPath = path.dirname(inf) + "/Resources/" + obj['CFBundleIconFile'];
          if (!icnsPath.endsWith('.icns')) {
            icnsPath += ".icns";
          }
          return fs.access(icnsPath, fs.R_OK, convertIcns(icnsPath));
        }
      };
    };
    searchIcon = function(con) {
      return function(err) {
        var infoPath;
        if (err != null) {
          return;
        }
        infoPath = con + "/Info.plist";
        return fs.access(infoPath, fs.R_OK, parseInfo(infoPath));
      };
    };
    fs.access(absPath, fs.R_OK, searchIcon(conPath));
  }

}).call(this);
