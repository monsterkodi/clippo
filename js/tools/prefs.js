
/*
00000000   00000000   00000000  00000000   0000000
000   000  000   000  000       000       000     
00000000   0000000    0000000   000000    0000000 
000        000   000  000       000            000
000        000   000  00000000  000       0000000
 */

(function() {
  var Prefs, _, fs;

  _ = require('lodash');

  fs = require('fs');

  Prefs = (function() {
    function Prefs() {}

    Prefs.path = null;

    Prefs.defs = null;

    Prefs.init = function(path, defs) {
      if (defs == null) {
        defs = {};
      }
      Prefs.path = path;
      Prefs.defs = defs;
      return Prefs.load();
    };

    Prefs.get = function(key, value) {
      var ref;
      return (ref = Prefs.load()[key]) != null ? ref : value;
    };

    Prefs.set = function(key, value) {
      var values;
      values = Prefs.load();
      values[key] = value;
      return Prefs.save(values);
    };

    Prefs.add = function(key, value) {
      var values;
      values = Prefs.load();
      values[key].push(value);
      return Prefs.save(values);
    };

    Prefs.one = function(key, value) {
      var values;
      values = Prefs.load();
      _.pull(values[key], value);
      values[key].push(value);
      return Prefs.save(values);
    };

    Prefs.del = function(key, value) {
      var values;
      values = Prefs.load();
      _.pull(values[key], value);
      return Prefs.save(values);
    };

    Prefs.load = function() {
      var error, i, key, len, ref, values;
      values = {};
      try {
        values = JSON.parse(fs.readFileSync(Prefs.path, {
          encoding: 'utf8'
        }));
      } catch (error) {
        console.log('can\'t load prefs file', Prefs.path);
      }
      ref = Object.keys(Prefs.defs);
      for (i = 0, len = ref.length; i < len; i++) {
        key = ref[i];
        if (values[key] == null) {
          values[key] = Prefs.defs[key];
        }
      }
      return values;
    };

    Prefs.save = function(values) {
      var json;
      json = JSON.stringify(values, null, "    ");
      if (Prefs.debug) {
        console.log('prefs.save', Prefs.path, json);
      }
      return fs.writeFileSync(Prefs.path, json, {
        encoding: 'utf8'
      });
    };

    return Prefs;

  })();

  module.exports = Prefs;

}).call(this);
