(function() {
  var Store, _, atomic, fs, log, noon, path,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  log = require('./log');

  _ = require('lodash');

  fs = require('fs-extra');

  noon = require('noon');

  path = require('path');

  atomic = require('write-file-atomic');

  Store = (function() {
    function Store(opt) {
      this.save = bind(this.save, this);
      var err, ref, ref1;
      this.timer = null;
      this.file = opt != null ? opt.file : void 0;
      this.sep = (ref = opt != null ? opt.separator : void 0) != null ? ref : ':';
      this.timeout = (ref1 = opt != null ? opt.timeout : void 0) != null ? ref1 : 1000;
      try {
        this.data = noon.load(this.file);
      } catch (error) {
        err = error;
        this.data = {};
      }
      if ((opt != null ? opt.defaults : void 0) != null) {
        this.data = _.defaults(this.data, opt.defaults);
      }
    }

    Store.prototype.get = function(key, value) {
      var keypath, object;
      if ((key != null ? key.split : void 0) == null) {
        return value;
      }
      keypath = key.split(this.sep);
      object = this.data;
      while (keypath.length) {
        object = object[keypath.shift()];
        if (object == null) {
          return value;
        }
      }
      return object != null ? object : value;
    };

    Store.prototype.set = function(key, value) {
      var k, keypath, object;
      if ((key != null ? key.split : void 0) == null) {
        return;
      }
      if (this.timer) {
        clearTimeout(this.timer);
      }
      this.timer = setTimeout(this.save, this.timeout);
      keypath = key.split(this.sep);
      object = this.data;
      while (keypath.length > 1) {
        k = keypath.shift();
        if (object[k] == null) {
          if (!_.isNaN(_.parseInt(k))) {
            object = object[k] = [];
          } else {
            object = object[k] = {};
          }
        } else {
          object = object[k];
        }
      }
      if (keypath.length === 1 && (object != null)) {
        if (value != null) {
          return object[keypath[0]] = value;
        } else {
          return delete object[keypath[0]];
        }
      }
    };

    Store.prototype.del = function(key, value) {
      return this.set(key);
    };

    Store.prototype.clear = function() {
      if (this.timer) {
        clearTimeout(this.timer);
      }
      return this.data = {};
    };

    Store.prototype.save = function(cb) {
      if (!this.file) {
        return;
      }
      if (this.timer) {
        clearTimeout(this.timer);
      }
      this.timer = null;
      return fs.mkdirs(path.dirname(this.file), (function(_this) {
        return function(err) {
          var str;
          if (err != null) {
            if (err != null) {
              log("[ERROR] can't create directory", path.dirname(_this.file), err);
            }
            return typeof cb === "function" ? cb(err == null) : void 0;
          } else {
            str = noon.stringify(_this.data, {
              indent: 2,
              maxalign: 8
            });
            return atomic(_this.file, str, function(err) {
              if (err != null) {
                log("[ERROR] can't save preferences file", _this.file, err);
              }
              return typeof cb === "function" ? cb(err == null) : void 0;
            });
          }
        };
      })(this));
    };

    return Store;

  })();

  module.exports = Store;

}).call(this);
