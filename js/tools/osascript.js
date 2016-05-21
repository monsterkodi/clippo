(function() {
  module.exports = function(script) {
    var l;
    return ((function() {
      var i, len, ref, results;
      ref = script.split("\n");
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        l = ref[i];
        results.push("-e \"" + (l.replace(/\"/g, "\\\"")) + "\"");
      }
      return results;
    })()).join(" ");
  };

}).call(this);
