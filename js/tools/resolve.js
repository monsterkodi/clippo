(function() {
  var path;

  path = require('path');

  module.exports = function(p) {
    return path.normalize(path.resolve(p.replace(/\~/, process.env.HOME)));
  };

}).call(this);
