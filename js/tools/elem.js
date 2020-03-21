(function() {
  var _, elem;

  _ = require('lodash');

  elem = function(typ, opt) {
    var c, e, i, j, k, len, len1, ref, ref1;
    if (_.isPlainObject(typ)) {
      opt = typ;
      typ = opt.typ;
    }
    if (opt == null) {
      opt = {};
    }
    if (typ == null) {
      typ = 'div';
    }
    e = document.createElement(typ);
    if ((opt.text != null) && (_.isString(opt.text) || _.isNumber(opt.text))) {
      e.textContent = opt.text;
      delete opt.text;
    }
    if ((opt.html != null) && _.isString(opt.html)) {
      e.innerHTML = opt.html;
      delete opt.html;
    }
    if ((opt.child != null) && _.isElement(opt.child)) {
      e.appendChild(opt.child);
      delete opt.child;
    }
    if ((opt.children != null) && _.isArray(opt.children)) {
      ref = opt.children;
      for (i = 0, len = ref.length; i < len; i++) {
        c = ref[i];
        if (_.isElement(c)) {
          e.appendChild(c);
        }
      }
      delete opt.children;
    }
    ref1 = Object.keys(opt);
    for (j = 0, len1 = ref1.length; j < len1; j++) {
      k = ref1[j];
      e.setAttribute(k, opt[k]);
    }
    return e;
  };

  module.exports = elem;

}).call(this);
