(function() {
  var Keyinfo, keycode,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  keycode = require('keycode');

  Keyinfo = (function() {
    function Keyinfo() {}

    Keyinfo.modifierNames = ['shift', 'ctrl', 'alt', 'command'];

    Keyinfo.modifierChars = ['⇧', '^', '⌥', '⌘'];

    Keyinfo.isModifier = function(keyname) {
      return indexOf.call(this.modifierNames, keyname) >= 0;
    };

    Keyinfo.modifiersForEvent = function(event) {
      var mods;
      mods = [];
      if (event.metaKey) {
        mods.push('command');
      }
      if (event.altKey) {
        mods.push('alt');
      }
      if (event.ctrlKey) {
        mods.push('ctrl');
      }
      if (event.shiftKey) {
        mods.push('shift');
      }
      return mods.join('+');
    };

    Keyinfo.join = function() {
      var args;
      args = [].slice.call(arguments, 0);
      args = args.filter(function(e) {
        return e.length;
      });
      return args.join('+');
    };

    Keyinfo.comboForEvent = function(event) {
      var key;
      key = keycode(event);
      if (indexOf.call(Keyinfo.modifierNames, key) < 0) {
        return Keyinfo.join(Keyinfo.modifiersForEvent(event), key);
      }
      return "";
    };

    Keyinfo.keynameForEvent = function(event) {
      var name;
      name = keycode(event);
      if (name === "left command" || name === "right command" || name === "ctrl" || name === "alt" || name === "shift") {
        return "";
      }
      return name;
    };

    Keyinfo.forEvent = function(event) {
      return {
        mod: Keyinfo.modifiersForEvent(event),
        key: Keyinfo.keynameForEvent(event),
        combo: Keyinfo.comboForEvent(event)
      };
    };

    Keyinfo.short = function(combo) {
      var i, j, modifierName, ref;
      for (i = j = 0, ref = this.modifierNames.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        modifierName = this.modifierNames[i] + '+';
        combo = combo.replace(modifierName, this.modifierChars[i]);
      }
      return combo.toUpperCase();
    };

    return Keyinfo;

  })();

  module.exports = Keyinfo;

}).call(this);
