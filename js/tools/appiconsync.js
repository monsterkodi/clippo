(function() {
  var fs, noon, osas, path, proc, resolve;

  fs = require('fs');

  path = require('path');

  noon = require('noon');

  proc = require('child_process');

  osas = require('./osascript');

  resolve = require('./resolve');

  module.exports = function(appName, outDir, size) {
    var absPath, appFolder, conPath, err, error, i, icnsPath, infoPath, len, obj, pngPath, ref, script;
    if (outDir == null) {
      outDir = ".";
    }
    if (size == null) {
      size = 128;
    }
    if (!appName.endsWith('.app')) {
      appName += ".app";
    }
    ref = ["/Applications", "/Applications/Utilities", "/System/Library/CoreServices", "~/Applications"];
    for (i = 0, len = ref.length; i < len; i++) {
      appFolder = ref[i];
      absPath = resolve(appFolder + "/" + appName);
      conPath = absPath + "/Contents";
      try {
        fs.accessSync(absPath, fs.R_OK);
        infoPath = conPath + "/Info.plist";
        fs.accessSync(infoPath, fs.R_OK);
        obj = noon.load(infoPath);
        if (obj['CFBundleIconFile'] != null) {
          icnsPath = path.dirname(infoPath) + "/Resources/" + obj['CFBundleIconFile'];
          if (!icnsPath.endsWith('.icns')) {
            icnsPath += ".icns";
          }
          fs.accessSync(icnsPath, fs.R_OK);
          pngPath = resolve(outDir + "/" + path.basename(appName, path.extname(appName)) + ".png");
          script = osas("tell application \"Image Events\"\n    set f to (POSIX file \"" + icnsPath + "\")\n    set img to open f\n    tell img\n        scale to size \"" + size + "\"\n        save as PNG in \"" + pngPath + "\"\n    end tell\nend tell");
          proc.execSync("osascript " + script);
          fs.accessSync(pngPath, fs.R_OK);
          return pngPath;
        }
      } catch (error) {
        err = error;
        continue;
      }
    }
  };

}).call(this);
