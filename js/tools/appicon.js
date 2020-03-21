(function() {
  var AppIcon, childp, fs, log, path, plist, resolve;

  fs = require('fs');

  path = require('path');

  plist = require('simple-plist');

  childp = require('child_process');

  log = require('./log');

  resolve = require('./resolve');

  AppIcon = (function() {
    function AppIcon() {}

    AppIcon.sync = function(appName, outDir, size) {
      var absPath, appFolder, conPath, err, i, icnsPath, infoPath, len, obj, pngPath, ref;
      if (outDir == null) {
        outDir = ".";
      }
      if (size == null) {
        size = 1024;
      }
      if (!appName.endsWith('.app')) {
        appName += ".app";
      }
      ref = ["/Applications", "/Applications/Utilities", "/System/Library/CoreServices", "~/Applications"];
      for (i = 0, len = ref.length; i < len; i++) {
        appFolder = ref[i];
        absPath = resolve(path.join(appFolder, appName));
        conPath = path.join(absPath, 'Contents');
        try {
          infoPath = path.join(conPath, 'Info.plist');
          fs.accessSync(infoPath, fs.R_OK);
          obj = plist.readFileSync(infoPath);
          if (obj['CFBundleIconFile'] != null) {
            icnsPath = path.join(path.dirname(infoPath), 'Resources', obj['CFBundleIconFile']);
            if (!icnsPath.endsWith('.icns')) {
              icnsPath += ".icns";
            }
            fs.accessSync(icnsPath, fs.R_OK);
            pngPath = resolve(path.join(outDir, path.basename(appName, path.extname(appName)) + ".png"));
            childp.execSync("/usr/bin/sips -Z " + size + " -s format png " + icnsPath + " --out " + pngPath);
            fs.accessSync(pngPath, fs.R_OK);
            return pngPath;
          }
        } catch (error) {
          err = error;
          continue;
        }
      }
    };

    AppIcon.pngPath = function(opt) {
      return resolve(path.join(opt.iconDir, path.basename(opt.appPath, path.extname(opt.appPath)) + ".png"));
    };

    AppIcon.get = function(opt) {
      var pngPath;
      pngPath = AppIcon.pngPath(opt);
      return fs.stat(pngPath, function(err, stat) {
        if ((err == null) && stat.isFile()) {
          log("cached: " + pngPath);
          return opt.cb(pngPath, opt.cbArg);
        } else {
          return AppIcon.getIcon(opt);
        }
      });
    };

    AppIcon.getIcon = function(opt) {
      var appPath, infoPath;
      appPath = opt.appPath;
      infoPath = path.join(appPath, 'Contents', 'Info.plist');
      return plist.readFile(infoPath, function(err, obj) {
        var icnsPath;
        if (err == null) {
          if (obj['CFBundleIconFile'] != null) {
            icnsPath = path.join(path.dirname(infoPath), 'Resources', obj['CFBundleIconFile']);
            if (!icnsPath.endsWith('.icns')) {
              icnsPath += ".icns";
            }
            return AppIcon.saveIcon(icnsPath, opt);
          }
        }
      });
    };

    AppIcon.saveIcon = function(icnsPath, opt) {
      var pngPath;
      pngPath = AppIcon.pngPath(opt);
      return childp.exec("/usr/bin/sips -Z " + opt.size + " -s format png \"" + icnsPath + "\" --out \"" + pngPath + "\"", function(err) {
        if (err == null) {
          log("saveIcon: wrote " + pngPath);
          return opt.cb(pngPath, opt.cbArg);
        } else {
          return log("[ERROR] saveIcon: " + err);
        }
      });
    };

    return AppIcon;

  })();

  module.exports = AppIcon;

}).call(this);
