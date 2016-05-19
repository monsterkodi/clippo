(function() {
  var clipboard, electron, ipc, keyname, loadBuffers;

  electron = require('electron');

  clipboard = electron.clipboard;

  ipc = electron.ipcRenderer;

  keyname = require('./tools/keyname');

  loadBuffers = function() {
    var buf, buffers, html, i, len;
    buffers = ipc.sendSync("get-buffers");
    html = "";
    for (i = 0, len = buffers.length; i < len; i++) {
      buf = buffers[i];
      html += "<pre>" + buf.split("\n").join("<br>") + "</pre>\n";
    }
    return document.body.innerHTML = html;
  };

  ipc.on("reload", loadBuffers);

  loadBuffers();

  document.onkeydown = function(event) {
    var key;
    key = keyname.ofEvent(event);
    switch (key) {
      case 'esc':
        return window.close();
    }
  };

}).call(this);
