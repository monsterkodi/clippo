(function() {
  var _, path;

  path = require('path');

  _ = require('lodash');

  module.exports = {
    last: function(a) {
      if (!_.isArray(a)) {
        return a;
      }
      if (a != null ? a.length : void 0) {
        return a[a.length - 1];
      }
      return null;
    },
    unresolve: function(p) {
      return p.replace(os.homedir(), "~");
    },
    fileName: function(p) {
      return path.basename(p, path.extname(p));
    },
    extName: function(p) {
      return path.extname(p).slice(1);
    },
    resolve: function(p) {
      var i, k, ref, v;
      i = p.indexOf('$');
      while (i >= 0) {
        ref = process.env;
        for (k in ref) {
          v = ref[k];
          if (k === p.slice(i + 1, i + 1 + k.length)) {
            p = p.slice(0, i) + v + p.slice(i + k.length + 1);
            i = p.indexOf('$');
            break;
          }
        }
      }
      return path.normalize(path.resolve(p.replace(/^\~/, process.env.HOME)));
    },
    $: function(idOrClass, e) {
      var ref;
      if (e == null) {
        e = document;
      }
      if (((ref = idOrClass[0]) === '.' || ref === "#") || e !== document) {
        return e.querySelector(idOrClass);
      } else {
        return document.getElementById(idOrClass);
      }
    }
  };

}).call(this);
