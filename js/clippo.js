(function() {
  var $, buffers, clipboard, current, doPaste, electron, highlight, ipc, keyname, loadBuffers, log;

  electron = require('electron');

  keyname = require('./tools/keyname');

  clipboard = electron.clipboard;

  ipc = electron.ipcRenderer;

  current = 0;

  buffers = [];

  $ = function(id) {
    return document.getElementById(id);
  };

  log = function() {
    return console.log(([].slice.call(arguments, 0)).join(" "));
  };

  doPaste = function() {
    ipc.send('paste', buffers[current]);
    return log(current, buffers[current]);
  };

  highlight = function(index) {
    var pre, ref;
    if ((ref = $(current)) != null) {
      ref.className = "";
    }
    current = Math.max(0, Math.min(index, buffers.length - 1));
    pre = $(current);
    return pre.className = 'current';
  };

  window.onClick = function(index) {
    log('clicked', index);
    highlight(index);
    return doPaste();
  };

  loadBuffers = function() {
    var buf, html, i, j, len;
    buffers = ipc.sendSync("get-buffers");
    html = "";
    i = 0;
    for (j = 0, len = buffers.length; j < len; j++) {
      buf = buffers[j];
      html = ("<pre id=" + i + " onClick='window.onClick(" + i + ");'>") + buf.split("\n").join("<br>") + "</pre>\n" + html;
      i += 1;
    }
    return document.body.innerHTML = html;
  };

  ipc.on("reload", loadBuffers);

  loadBuffers();

  highlight(0);

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
      case 'page up':
        return highlight(buffers.length - 1);
      case 'page down':
        return highlight(0);
      case 'enter':
        return doPaste();
    }
    return log(key);
  };

}).call(this);
