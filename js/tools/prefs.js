(function() {
  var Prefs, Store, log;

  log = require('./log');

  Store = require('./store');

  Prefs = (function() {
    function Prefs() {}

    Prefs.store = null;

    Prefs.init = function(file, defs) {
      if (defs == null) {
        defs = {};
      }
      return this.store = new Store({
        file: file,
        defaults: defs
      });
    };

    Prefs.get = function(key, value) {
      return this.store.get(key, value);
    };

    Prefs.set = function(key, value) {
      return this.store.set(key, value);
    };

    Prefs.del = function(key, value) {
      return this.store.del(key);
    };

    Prefs.save = function(cb) {
      return this.store.save(cb);
    };

    return Prefs;

  })();

  module.exports = Prefs;

}).call(this);
