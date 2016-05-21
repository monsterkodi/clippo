(function() {
  var absPath, appFolder, args, conPath, convertIcns, fs, i, len, noon, parseInfo, path, proc, ref, reportDone, resolve, searchIcon;

  fs = require('fs');

  path = require('path');

  noon = require('noon');

  proc = require('child_process');

  args = require('karg')("icon\n    app         . ? the name of the application . *\n    outdir      . ? the output folder           . = .    ");

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
        var pngPath;
        if (err != null) {
          log(err);
          return;
        }
        pngPath = resolve(args.outdir + "/" + path.basename(args.app, path.extname(args.app)) + ".png");
        return proc.exec("osascript -e \"tell application \\\"Image Events\\\"\" -e \"set f to (POSIX file \\\"" + icns + "\\\")\" -e \"set img to open f\" -e \"tell img\" -e \"scale to size \\\"128\\\"\" -e \"save as PNG in \\\"" + pngPath + "\\\"\" -e \"end tell\"  -e \"end tell\"", reportDone(pngPath));
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
