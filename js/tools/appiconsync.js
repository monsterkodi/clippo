(function() {
  var childp, fs, path, plist, resolve;

  fs = require('fs');

  path = require('path');

  plist = require('simple-plist');

  childp = require('child_process');

  resolve = require('./resolve');

  module.exports = function(appName, outDir, size) {
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

}).call(this);
