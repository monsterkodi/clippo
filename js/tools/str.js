(function() {
  var noon, str;

  noon = require('noon');

  str = function(o) {
    if (o == null) {
      return 'null';
    }
    if (typeof o === 'object') {
      if (o._str != null) {
        return o._str();
      } else {
        return "\n" + noon.stringify(o, {
          circular: true
        });
      }
    } else {
      return String(o);
    }
  };

  module.exports = str;

}).call(this);
