// koffee 1.14.0
var childp, fs, ref, slash;

ref = require('kxk'), childp = ref.childp, fs = ref.fs, slash = ref.slash;

module.exports = function(appName, outDir, size) {
    var absPath, appFolder, conPath, err, i, icnsPath, infoPath, len, obj, pngPath, ref1, splist;
    if (outDir == null) {
        outDir = ".";
    }
    if (size == null) {
        size = 1024;
    }
    if (!appName.endsWith('.app')) {
        appName += ".app";
    }
    ref1 = ["/Applications", "/System/Library/CoreServices", "~/Applications"];
    for (i = 0, len = ref1.length; i < len; i++) {
        appFolder = ref1[i];
        absPath = slash.resolve(slash.join(appFolder, appName));
        conPath = slash.join(absPath, 'Contents');
        try {
            infoPath = slash.join(conPath, 'Info.plist');
            fs.accessSync(infoPath, fs.R_OK);
            splist = require('simple-plist');
            obj = splist.readFileSync(infoPath);
            if (obj['CFBundleIconFile'] != null) {
                icnsPath = slash.join(slash.dirname(infoPath), 'Resources', obj['CFBundleIconFile']);
                if (!icnsPath.endsWith('.icns')) {
                    icnsPath += ".icns";
                }
                fs.accessSync(icnsPath, fs.R_OK);
                pngPath = slash.resolve(slash.join(outDir, slash.base(appName) + ".png"));
                childp.execSync("/usr/bin/sips -Z " + size + " -s format png \"" + (slash.escape(icnsPath)) + "\" --out \"" + (slash.escape(pngPath)) + "\"");
                fs.accessSync(pngPath, fs.R_OK);
                return pngPath;
            }
        } catch (error) {
            err = error;
            continue;
        }
    }
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwaWNvbnN5bmMuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJhcHBpY29uc3luYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQU1BLElBQUE7O0FBQUEsTUFBd0IsT0FBQSxDQUFRLEtBQVIsQ0FBeEIsRUFBRSxtQkFBRixFQUFVLFdBQVYsRUFBYzs7QUFFZCxNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFDLE9BQUQsRUFBVSxNQUFWLEVBQXNCLElBQXRCO0FBRWIsUUFBQTs7UUFGdUIsU0FBTzs7O1FBQUssT0FBSzs7SUFFeEMsSUFBcUIsQ0FBSSxPQUFPLENBQUMsUUFBUixDQUFpQixNQUFqQixDQUF6QjtRQUFBLE9BQUEsSUFBVyxPQUFYOztBQUVBO0FBQUEsU0FBQSxzQ0FBQTs7UUFLSSxPQUFBLEdBQVUsS0FBSyxDQUFDLE9BQU4sQ0FBYyxLQUFLLENBQUMsSUFBTixDQUFXLFNBQVgsRUFBc0IsT0FBdEIsQ0FBZDtRQUNWLE9BQUEsR0FBVSxLQUFLLENBQUMsSUFBTixDQUFXLE9BQVgsRUFBb0IsVUFBcEI7QUFDVjtZQUNJLFFBQUEsR0FBVyxLQUFLLENBQUMsSUFBTixDQUFXLE9BQVgsRUFBb0IsWUFBcEI7WUFDWCxFQUFFLENBQUMsVUFBSCxDQUFjLFFBQWQsRUFBd0IsRUFBRSxDQUFDLElBQTNCO1lBQ0EsTUFBQSxHQUFTLE9BQUEsQ0FBUSxjQUFSO1lBQ1QsR0FBQSxHQUFNLE1BQU0sQ0FBQyxZQUFQLENBQW9CLFFBQXBCO1lBQ04sSUFBRywrQkFBSDtnQkFDSSxRQUFBLEdBQVcsS0FBSyxDQUFDLElBQU4sQ0FBVyxLQUFLLENBQUMsT0FBTixDQUFjLFFBQWQsQ0FBWCxFQUFvQyxXQUFwQyxFQUFpRCxHQUFJLENBQUEsa0JBQUEsQ0FBckQ7Z0JBQ1gsSUFBdUIsQ0FBSSxRQUFRLENBQUMsUUFBVCxDQUFrQixPQUFsQixDQUEzQjtvQkFBQSxRQUFBLElBQVksUUFBWjs7Z0JBQ0EsRUFBRSxDQUFDLFVBQUgsQ0FBYyxRQUFkLEVBQXdCLEVBQUUsQ0FBQyxJQUEzQjtnQkFDQSxPQUFBLEdBQVUsS0FBSyxDQUFDLE9BQU4sQ0FBYyxLQUFLLENBQUMsSUFBTixDQUFXLE1BQVgsRUFBbUIsS0FBSyxDQUFDLElBQU4sQ0FBVyxPQUFYLENBQUEsR0FBc0IsTUFBekMsQ0FBZDtnQkFDVixNQUFNLENBQUMsUUFBUCxDQUFnQixtQkFBQSxHQUFvQixJQUFwQixHQUF5QixtQkFBekIsR0FBMkMsQ0FBQyxLQUFLLENBQUMsTUFBTixDQUFhLFFBQWIsQ0FBRCxDQUEzQyxHQUFrRSxhQUFsRSxHQUE4RSxDQUFDLEtBQUssQ0FBQyxNQUFOLENBQWEsT0FBYixDQUFELENBQTlFLEdBQW9HLElBQXBIO2dCQUNBLEVBQUUsQ0FBQyxVQUFILENBQWMsT0FBZCxFQUF1QixFQUFFLENBQUMsSUFBMUI7QUFDQSx1QkFBTyxRQVBYO2FBTEo7U0FBQSxhQUFBO1lBYU07QUFFRixxQkFmSjs7QUFQSjtBQUphIiwic291cmNlc0NvbnRlbnQiOlsiIyAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwXG4jMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMDAgIDAwMCAgMDAwICAgICBcbiMwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwIDAgMDAwICAwMDAgICAgIFxuIzAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgIDAwMDAgIDAwMCAgICAgXG4jMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDBcblxueyBjaGlsZHAsIGZzLCBzbGFzaCB9ID0gcmVxdWlyZSAna3hrJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IChhcHBOYW1lLCBvdXREaXI9XCIuXCIsIHNpemU9MTAyNCkgLT5cblxuICAgIGFwcE5hbWUgKz0gXCIuYXBwXCIgaWYgbm90IGFwcE5hbWUuZW5kc1dpdGggJy5hcHAnXG5cbiAgICBmb3IgYXBwRm9sZGVyIGluIFtcbiAgICAgICAgICAgIFwiL0FwcGxpY2F0aW9uc1wiXG4gICAgICAgICAgICBcIi9TeXN0ZW0vTGlicmFyeS9Db3JlU2VydmljZXNcIlxuICAgICAgICAgICAgXCJ+L0FwcGxpY2F0aW9uc1wiXG4gICAgICAgIF1cbiAgICAgICAgYWJzUGF0aCA9IHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBhcHBGb2xkZXIsIGFwcE5hbWVcbiAgICAgICAgY29uUGF0aCA9IHNsYXNoLmpvaW4gYWJzUGF0aCwgJ0NvbnRlbnRzJ1xuICAgICAgICB0cnlcbiAgICAgICAgICAgIGluZm9QYXRoID0gc2xhc2guam9pbiBjb25QYXRoLCAnSW5mby5wbGlzdCdcbiAgICAgICAgICAgIGZzLmFjY2Vzc1N5bmMgaW5mb1BhdGgsIGZzLlJfT0tcbiAgICAgICAgICAgIHNwbGlzdCA9IHJlcXVpcmUgJ3NpbXBsZS1wbGlzdCdcbiAgICAgICAgICAgIG9iaiA9IHNwbGlzdC5yZWFkRmlsZVN5bmMgaW5mb1BhdGggICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG9ialsnQ0ZCdW5kbGVJY29uRmlsZSddP1xuICAgICAgICAgICAgICAgIGljbnNQYXRoID0gc2xhc2guam9pbiBzbGFzaC5kaXJuYW1lKGluZm9QYXRoKSwgJ1Jlc291cmNlcycsIG9ialsnQ0ZCdW5kbGVJY29uRmlsZSddXG4gICAgICAgICAgICAgICAgaWNuc1BhdGggKz0gXCIuaWNuc1wiIGlmIG5vdCBpY25zUGF0aC5lbmRzV2l0aCAnLmljbnMnXG4gICAgICAgICAgICAgICAgZnMuYWNjZXNzU3luYyBpY25zUGF0aCwgZnMuUl9PSyBcbiAgICAgICAgICAgICAgICBwbmdQYXRoID0gc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIG91dERpciwgc2xhc2guYmFzZShhcHBOYW1lKSArIFwiLnBuZ1wiXG4gICAgICAgICAgICAgICAgY2hpbGRwLmV4ZWNTeW5jIFwiL3Vzci9iaW4vc2lwcyAtWiAje3NpemV9IC1zIGZvcm1hdCBwbmcgXFxcIiN7c2xhc2guZXNjYXBlIGljbnNQYXRofVxcXCIgLS1vdXQgXFxcIiN7c2xhc2guZXNjYXBlIHBuZ1BhdGh9XFxcIlwiXG4gICAgICAgICAgICAgICAgZnMuYWNjZXNzU3luYyBwbmdQYXRoLCBmcy5SX09LXG4gICAgICAgICAgICAgICAgcmV0dXJuIHBuZ1BhdGhcbiAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICAjIGVycm9yIGVyclxuICAgICAgICAgICAgY29udGludWVcbiJdfQ==
//# sourceURL=../coffee/appiconsync.coffee