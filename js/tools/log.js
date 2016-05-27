(function() {
  var log, str;

  str = require('./str');

  log = function() {
    var s;
    return console.log(((function() {
      var i, len, ref, results;
      ref = [].slice.call(arguments, 0);
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        s = ref[i];
        results.push(str(s));
      }
      return results;
    }).apply(this, arguments)).join(" "));
  };

  module.exports = log;

}).call(this);
