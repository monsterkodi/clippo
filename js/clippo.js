(function() {
  var $, buffers, clipboard, current, doPaste, electron, encode, highlight, ipc, keyname, loadBuffers, log;

  electron = require('electron');

  keyname = require('./tools/keyname');

  clipboard = electron.clipboard;

  ipc = electron.ipcRenderer;

  current = 0;

  buffers = [];

  encode = require('html-entities').XmlEntities.encode;

  $ = function(id) {
    return document.getElementById(id);
  };

  log = function() {
    return console.log(([].slice.call(arguments, 0)).join(" "));
  };

  doPaste = function() {
    return ipc.send('paste', current);
  };

  highlight = function(index) {
    var pre, ref;
    if ((ref = $(current)) != null) {
      ref.className = "";
    }
    current = Math.max(0, Math.min(index, buffers.length - 1));
    pre = $(current);
    pre.className = 'current';
    return pre.scrollIntoViewIfNeeded();
  };

  window.onClick = function(index) {
    highlight(index);
    return doPaste();
  };

  loadBuffers = function() {
    var buf, encl, html, i, j, l, len;
    buffers = ipc.sendSync("get-buffers");
    html = "";
    i = 0;
    for (j = 0, len = buffers.length; j < len; j++) {
      buf = buffers[j];
      encl = (function() {
        var k, len1, ref, results;
        ref = buf.split("\n");
        results = [];
        for (k = 0, len1 = ref.length; k < len1; k++) {
          l = ref[k];
          results.push(encode(l));
        }
        return results;
      })();
      html = ("<pre id=" + i + " onClick='window.onClick(" + i + ");'>") + encl.join("<br>") + "</pre>\n" + html;
      i += 1;
    }
    if (html.length === 0) {
      html = "clipboard is empty!";
    }
    document.body.innerHTML = html;
    return highlight(buffers.length - 1);
  };

  ipc.on("reload", loadBuffers);

  loadBuffers();

  document.onkeydown = function(event) {
    var key;
    key = keyname.ofEvent(event);
    switch (key) {
      case 'esc':
        return window.close();
      case 'down':
      case 'right':
        return highlight(current - 1);
      case 'up':
      case 'left':
        return highlight(current + 1);
      case 'home':
      case 'page up':
        return highlight(buffers.length - 1);
      case 'end':
      case 'page down':
        return highlight(0);
      case 'enter':
        return doPaste();
    }
    return log(key);
  };

}).call(this);
