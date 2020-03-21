
/*
000   000  00000000  000   000  000   000   0000000   00     00  00000000
000  000   000        000 000   0000  000  000   000  000   000  000     
0000000    0000000     00000    000 0 000  000000000  000000000  0000000 
000  000   000          000     000  0000  000   000  000 0 000  000     
000   000  00000000     000     000   000  000   000  000   000  00000000
 */

(function() {
  var keycode, keyname,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  keycode = require('keycode');

  keyname = (function() {
    function keyname() {}

    keyname.modifierNames = ['shift', 'ctrl', 'alt', 'command'];

    keyname.isModifier = function(keyname) {
      return indexOf.call(this.modifierNames, keyname) >= 0;
    };

    keyname.modifiersOfEvent = function(event) {
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

    keyname.join = function() {
      var args;
      args = [].slice.call(arguments, 0);
      args = args.filter(function(e) {
        return e.length;
      });
      return args.join('+');
    };

    keyname.ofEvent = function(event) {
      var key;
      key = keycode(event);
      if (indexOf.call(this.modifierNames, key) < 0) {
        key = this.join(this.modifiersOfEvent(event), key);
      } else {
        key = "";
      }
      return key;
    };

    return keyname;

  })();

  module.exports = keyname;

}).call(this);
