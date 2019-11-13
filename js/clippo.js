// koffee 1.4.0

/*
 0000000  000      000  00000000   00000000    0000000
000       000      000  000   000  000   000  000   000
000       000      000  00000000   00000000   000   000
000       000      000  000        000        000   000
 0000000  0000000  000  000        000         0000000
 */
var $, _, buffers, changeFontSize, clamp, current, defaultFontSize, doPaste, electron, elem, getFontSize, highlight, kstr, lineForTarget, loadBuffers, main, onWheel, pkg, post, prefs, ref, resetFontSize, setFocus, setFontSize, setStyle, slash, valid, w, win;

ref = require('kxk'), post = ref.post, setStyle = ref.setStyle, valid = ref.valid, prefs = ref.prefs, slash = ref.slash, clamp = ref.clamp, elem = ref.elem, kstr = ref.kstr, win = ref.win, $ = ref.$, _ = ref._;

pkg = require('../package.json');

electron = require('electron');

w = new win({
    dir: __dirname,
    pkg: pkg,
    menu: '../coffee/menu.noon',
    icon: '../img/menu@2x.png'
});

current = 0;

buffers = [];

main = $("#main");

main.style.overflow = 'scroll';

doPaste = function() {
    return post.toMain('paste', current);
};

highlight = function(index) {
    var cdiv, line;
    cdiv = $('.current');
    if (cdiv != null) {
        cdiv.classList.remove('current');
    }
    current = Math.max(0, Math.min(index, buffers.length - 1));
    line = $("line" + current);
    if (line != null) {
        line.classList.add('current');
        line.scrollIntoViewIfNeeded();
        return setFocus();
    }
};

window.onload = function() {
    highlight(buffers.length - 1);
    return setFocus();
};

setFocus = function() {
    return main.focus();
};

lineForTarget = function(target) {
    var upElem;
    if (upElem = elem.upElem(target, {
        "class": 'line-div'
    })) {
        return parseInt(upElem.id.substr(4));
    }
};

main.addEventListener('mouseover', function(event) {
    var id;
    id = lineForTarget(event.target);
    if (valid(id)) {
        return highlight(id);
    }
});

main.addEventListener('click', function(event) {
    var id;
    id = lineForTarget(event.target);
    if (valid(id)) {
        highlight(id);
        return doPaste();
    }
});

post.on('loadBuffers', function(buffs, index) {
    return loadBuffers(buffs, index);
});

post.on('schemeChanged', function() {
    return loadBuffers(buffers, current);
});

loadBuffers = function(buffs, index) {
    var buf, div, encl, i, iconDir, j, l, len, ref1, s;
    buffers = buffs;
    if (buffers.length === 0) {
        s = prefs.get('scheme', 'dark');
        $('main').innerHTML = "<center><img class='info' src=\"" + __dirname + "/../img/empty_" + s + ".png\"></center>";
        return;
    }
    iconDir = slash.encode(slash.join(electron.remote.app.getPath('userData'), 'icons'));
    $('main').innerHTML = "<div id='buffer'></div>";
    i = 0;
    for (j = 0, len = buffers.length; j < len; j++) {
        buf = buffers[j];
        div = elem({
            id: "line" + i,
            "class": 'line-div',
            child: elem('span', {
                "class": 'line-span',
                children: [
                    elem('img', {
                        "class": 'appicon',
                        src: iconDir + "/" + buf.app + ".png"
                    }), buf.image != null ? elem('img', {
                        src: "data:image/png;base64," + buf.image,
                        "class": 'image'
                    }) : ((ref1 = buf.text) != null ? ref1.split : void 0) ? (encl = (function() {
                        var k, len1, ref2, results;
                        ref2 = buf.text.split("\n");
                        results = [];
                        for (k = 0, len1 = ref2.length; k < len1; k++) {
                            l = ref2[k];
                            results.push(kstr.encode(l));
                        }
                        return results;
                    })(), elem('pre', {
                        html: encl.join("<br>")
                    })) : elem('pre')
                ]
            })
        });
        $('buffer').insertBefore(div, $('buffer').firstChild);
        i += 1;
    }
    return highlight(index != null ? index : buffers.length - 1);
};

defaultFontSize = 15;

getFontSize = function() {
    return prefs.get('fontSize', defaultFontSize);
};

setFontSize = function(s) {
    var iconSize;
    if (!_.isFinite(s)) {
        s = getFontSize();
    }
    s = clamp(4, 44, s);
    prefs.set("fontSize", s);
    setStyle("#buffer", 'font-size', s + "px");
    iconSize = clamp(18, 64, s * 2);
    setStyle('img.appicon', 'height', iconSize + "px");
    setStyle('img.appicon', 'width', iconSize + "px");
    return setStyle('img.appicon', 'padding-top', "6px");
};

changeFontSize = function(d) {
    var f, s;
    s = getFontSize();
    if (s >= 30) {
        f = 4;
    } else if (s >= 50) {
        f = 10;
    } else if (s >= 20) {
        f = 2;
    } else {
        f = 1;
    }
    return setFontSize(s + f * d);
};

resetFontSize = function() {
    prefs.set('fontSize', defaultFontSize);
    return setFontSize(defaultFontSize);
};

onWheel = function(event) {
    if (0 <= w.modifiers.indexOf('ctrl')) {
        return changeFontSize(-event.deltaY / 100);
    }
};

setFontSize(getFontSize());

window.document.addEventListener('wheel', onWheel);

post.on('combo', function(combo, info) {
    switch (combo) {
        case 'esc':
            return post.toMain('closeWin');
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
        case 'command+v':
        case 'ctrl+v':
            return doPaste();
        case 'backspace':
        case 'command+backspace':
        case 'ctrl+backspace':
        case 'delete':
            return post.toMain('del', current);
    }
});

post.on('menuAction', function(action) {
    switch (action) {
        case 'Clear':
            return post.toMain('clearBuffer');
        case 'Save':
            return post.toMain('saveBuffer');
        case 'Increase':
            return changeFontSize(+1);
        case 'Decrease':
            return changeFontSize(-1);
        case 'Reset':
            return resetFontSize();
    }
});

loadBuffers(post.get('buffers'));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpcHBvLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFRQSxNQUF3RSxPQUFBLENBQVEsS0FBUixDQUF4RSxFQUFFLGVBQUYsRUFBUSx1QkFBUixFQUFrQixpQkFBbEIsRUFBeUIsaUJBQXpCLEVBQWdDLGlCQUFoQyxFQUF1QyxpQkFBdkMsRUFBOEMsZUFBOUMsRUFBb0QsZUFBcEQsRUFBMEQsYUFBMUQsRUFBK0QsU0FBL0QsRUFBa0U7O0FBRWxFLEdBQUEsR0FBWSxPQUFBLENBQVEsaUJBQVI7O0FBQ1osUUFBQSxHQUFZLE9BQUEsQ0FBUSxVQUFSOztBQUVaLENBQUEsR0FBSSxJQUFJLEdBQUosQ0FDQTtJQUFBLEdBQUEsRUFBUSxTQUFSO0lBQ0EsR0FBQSxFQUFRLEdBRFI7SUFFQSxJQUFBLEVBQVEscUJBRlI7SUFHQSxJQUFBLEVBQVEsb0JBSFI7Q0FEQTs7QUFNSixPQUFBLEdBQVU7O0FBQ1YsT0FBQSxHQUFVOztBQUNWLElBQUEsR0FBUyxDQUFBLENBQUUsT0FBRjs7QUFDVCxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVgsR0FBc0I7O0FBRXRCLE9BQUEsR0FBVSxTQUFBO1dBQUcsSUFBSSxDQUFDLE1BQUwsQ0FBWSxPQUFaLEVBQW9CLE9BQXBCO0FBQUg7O0FBUVYsU0FBQSxHQUFZLFNBQUMsS0FBRDtBQUVSLFFBQUE7SUFBQSxJQUFBLEdBQU0sQ0FBQSxDQUFFLFVBQUY7SUFDTixJQUFHLFlBQUg7UUFDSSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQWYsQ0FBc0IsU0FBdEIsRUFESjs7SUFHQSxPQUFBLEdBQVUsSUFBSSxDQUFDLEdBQUwsQ0FBUyxDQUFULEVBQVksSUFBSSxDQUFDLEdBQUwsQ0FBUyxLQUFULEVBQWdCLE9BQU8sQ0FBQyxNQUFSLEdBQWUsQ0FBL0IsQ0FBWjtJQUVWLElBQUEsR0FBTSxDQUFBLENBQUUsTUFBQSxHQUFPLE9BQVQ7SUFF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T0FGaEI7QUFFMkMsbUJBQU8sU0FBQSxDQUFVLE9BQUEsR0FBUSxDQUFsQjtBQUZsRCxhQUdTLElBSFQ7QUFBQSxhQUdpQixNQUhqQjtBQUcyQyxtQkFBTyxTQUFBLENBQVUsT0FBQSxHQUFRLENBQWxCO0FBSGxELGFBSVMsTUFKVDtBQUFBLGFBSWdCLFNBSmhCO0FBSTJDLG1CQUFPLFNBQUEsQ0FBVSxPQUFPLENBQUMsTUFBUixHQUFlLENBQXpCO0FBSmxELGFBS1MsS0FMVDtBQUFBLGFBS2dCLFdBTGhCO0FBSzJDLG1CQUFPLFNBQUEsQ0FBVSxDQUFWO0FBTGxELGFBTVMsT0FOVDtBQUFBLGFBTWlCLFdBTmpCO0FBQUEsYUFNNkIsUUFON0I7QUFNMkMsbUJBQU8sT0FBQSxDQUFBO0FBTmxELGFBT1MsV0FQVDtBQUFBLGFBT3FCLG1CQVByQjtBQUFBLGFBT3lDLGdCQVB6QztBQUFBLGFBTzBELFFBUDFEO0FBT3dFLG1CQUFPLElBQUksQ0FBQyxNQUFMLENBQVksS0FBWixFQUFrQixPQUFsQjtBQVAvRTtBQUZhLENBQWpCOztBQWlCQSxJQUFJLENBQUMsRUFBTCxDQUFRLFlBQVIsRUFBc0IsU0FBQyxNQUFEO0FBRWxCLFlBQU8sTUFBUDtBQUFBLGFBQ1MsT0FEVDttQkFDeUIsSUFBSSxDQUFDLE1BQUwsQ0FBWSxhQUFaO0FBRHpCLGFBRVMsTUFGVDttQkFFeUIsSUFBSSxDQUFDLE1BQUwsQ0FBWSxZQUFaO0FBRnpCLGFBR1MsVUFIVDttQkFHeUIsY0FBQSxDQUFlLENBQUMsQ0FBaEI7QUFIekIsYUFJUyxVQUpUO21CQUl5QixjQUFBLENBQWUsQ0FBQyxDQUFoQjtBQUp6QixhQUtTLE9BTFQ7bUJBS3lCLGFBQUEsQ0FBQTtBQUx6QjtBQUZrQixDQUF0Qjs7QUFTQSxXQUFBLENBQVksSUFBSSxDQUFDLEdBQUwsQ0FBUyxTQUFULENBQVoiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAwMDAgICAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMFxuMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMCAgIDAwMFxuMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIDAwMCAgIDAwMFxuIDAwMDAwMDAgIDAwMDAwMDAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgICAwMDAwMDAwXG4jIyNcblxueyBwb3N0LCBzZXRTdHlsZSwgdmFsaWQsIHByZWZzLCBzbGFzaCwgY2xhbXAsIGVsZW0sIGtzdHIsIHdpbiwgJCwgXyB9ID0gcmVxdWlyZSAna3hrJ1xuXG5wa2cgICAgICAgPSByZXF1aXJlICcuLi9wYWNrYWdlLmpzb24nXG5lbGVjdHJvbiAgPSByZXF1aXJlICdlbGVjdHJvbidcblxudyA9IG5ldyB3aW4gXG4gICAgZGlyOiAgICBfX2Rpcm5hbWVcbiAgICBwa2c6ICAgIHBrZ1xuICAgIG1lbnU6ICAgJy4uL2NvZmZlZS9tZW51Lm5vb24nXG4gICAgaWNvbjogICAnLi4vaW1nL21lbnVAMngucG5nJ1xuICAgIFxuY3VycmVudCA9IDBcbmJ1ZmZlcnMgPSBbXVxubWFpbiAgICA9JCBcIiNtYWluXCJcbm1haW4uc3R5bGUub3ZlcmZsb3cgPSAnc2Nyb2xsJ1xuXG5kb1Bhc3RlID0gLT4gcG9zdC50b01haW4gJ3Bhc3RlJyBjdXJyZW50XG5cbiMgMDAwICAgMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMDBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAgICAwMDBcbiMgMDAwMDAwMDAwICAwMDAgIDAwMCAgMDAwMCAgMDAwMDAwMDAwICAwMDAgICAgICAwMDAgIDAwMCAgMDAwMCAgMDAwMDAwMDAwICAgICAwMDBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAwMDBcblxuaGlnaGxpZ2h0ID0gKGluZGV4KSAtPlxuICAgIFxuICAgIGNkaXYgPSQgJy5jdXJyZW50J1xuICAgIGlmIGNkaXY/XG4gICAgICAgIGNkaXYuY2xhc3NMaXN0LnJlbW92ZSAnY3VycmVudCdcblxuICAgIGN1cnJlbnQgPSBNYXRoLm1heCAwLCBNYXRoLm1pbiBpbmRleCwgYnVmZmVycy5sZW5ndGgtMVxuICAgIFxuICAgIGxpbmUgPSQgXCJsaW5lI3tjdXJyZW50fVwiXG4gICAgXG4gICAgaWYgbGluZT9cbiAgICAgICAgbGluZS5jbGFzc0xpc3QuYWRkICdjdXJyZW50J1xuICAgICAgICBsaW5lLnNjcm9sbEludG9WaWV3SWZOZWVkZWQoKVxuICAgICAgICBzZXRGb2N1cygpXG4gICAgICAgIFxud2luZG93Lm9ubG9hZCA9IC0+XG5cbiAgICBoaWdobGlnaHQgYnVmZmVycy5sZW5ndGgtMVxuICAgIHNldEZvY3VzKClcblxuIyAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIFxuXG5zZXRGb2N1cyA9IC0+IG1haW4uZm9jdXMoKVxuXG5saW5lRm9yVGFyZ2V0ID0gKHRhcmdldCkgLT5cbiAgICBcbiAgICBpZiB1cEVsZW0gPSBlbGVtLnVwRWxlbSB0YXJnZXQsIHsgY2xhc3M6J2xpbmUtZGl2JyB9XG4gICAgICAgIHJldHVybiBwYXJzZUludCB1cEVsZW0uaWQuc3Vic3RyIDRcbiAgICBcbm1haW4uYWRkRXZlbnRMaXN0ZW5lciAnbW91c2VvdmVyJyAoZXZlbnQpIC0+XG4gICAgXG4gICAgaWQgPSBsaW5lRm9yVGFyZ2V0IGV2ZW50LnRhcmdldFxuICAgIGlmIHZhbGlkIGlkXG4gICAgICAgIGhpZ2hsaWdodCBpZFxuXG5tYWluLmFkZEV2ZW50TGlzdGVuZXIgJ2NsaWNrJyAoZXZlbnQpIC0+XG4gICAgXG4gICAgaWQgPSBsaW5lRm9yVGFyZ2V0IGV2ZW50LnRhcmdldFxuICAgIGlmIHZhbGlkIGlkXG4gICAgICAgIGhpZ2hsaWdodCBpZCBcbiAgICAgICAgZG9QYXN0ZSgpXG4gICAgXG4jIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwXG4jIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDBcbiMgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMFxuIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4jIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwXG5cbnBvc3Qub24gJ2xvYWRCdWZmZXJzJywgKGJ1ZmZzLCBpbmRleCkgLT4gbG9hZEJ1ZmZlcnMgYnVmZnMsIGluZGV4XG5wb3N0Lm9uICdzY2hlbWVDaGFuZ2VkJywgLT4gbG9hZEJ1ZmZlcnMgYnVmZmVycywgY3VycmVudFxuXG5sb2FkQnVmZmVycyA9IChidWZmcywgaW5kZXgpIC0+XG5cbiAgICBidWZmZXJzID0gYnVmZnNcbiAgICBcbiAgICBpZiBidWZmZXJzLmxlbmd0aCA9PSAwXG4gICAgICAgIHMgPSBwcmVmcy5nZXQgJ3NjaGVtZScgJ2RhcmsnXG4gICAgICAgICQoJ21haW4nKS5pbm5lckhUTUwgPSBcIjxjZW50ZXI+PGltZyBjbGFzcz0naW5mbycgc3JjPVxcXCIje19fZGlybmFtZX0vLi4vaW1nL2VtcHR5XyN7c30ucG5nXFxcIj48L2NlbnRlcj5cIlxuICAgICAgICByZXR1cm5cblxuICAgIGljb25EaXIgPSBzbGFzaC5lbmNvZGUgc2xhc2guam9pbiBlbGVjdHJvbi5yZW1vdGUuYXBwLmdldFBhdGgoJ3VzZXJEYXRhJyksICdpY29ucydcblxuICAgICQoJ21haW4nKS5pbm5lckhUTUwgPSBcIjxkaXYgaWQ9J2J1ZmZlcic+PC9kaXY+XCJcblxuICAgIGkgPSAwXG4gICAgZm9yIGJ1ZiBpbiBidWZmZXJzXG4gICAgICAgIGRpdiA9IGVsZW0gaWQ6XCJsaW5lI3tpfVwiIGNsYXNzOidsaW5lLWRpdicgY2hpbGQ6XG4gICAgICAgICAgICBlbGVtICdzcGFuJyBjbGFzczonbGluZS1zcGFuJyBjaGlsZHJlbjogW1xuICAgICAgICAgICAgICAgIGVsZW0gJ2ltZycgY2xhc3M6J2FwcGljb24nIHNyYzpcIiN7aWNvbkRpcn0vI3tidWYuYXBwfS5wbmdcIlxuICAgICAgICAgICAgICAgIGlmIGJ1Zi5pbWFnZT9cbiAgICAgICAgICAgICAgICAgICAgZWxlbSAnaW1nJyBzcmM6XCJkYXRhOmltYWdlL3BuZztiYXNlNjQsI3tidWYuaW1hZ2V9XCIgY2xhc3M6ICdpbWFnZSdcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGJ1Zi50ZXh0Py5zcGxpdFxuICAgICAgICAgICAgICAgICAgICBlbmNsID0gKCBrc3RyLmVuY29kZShsKSBmb3IgbCBpbiBidWYudGV4dC5zcGxpdCBcIlxcblwiIClcbiAgICAgICAgICAgICAgICAgICAgZWxlbSAncHJlJyBodG1sOmVuY2wuam9pbiBcIjxicj5cIlxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgZWxlbSAncHJlJ1xuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgJCgnYnVmZmVyJykuaW5zZXJ0QmVmb3JlIGRpdiwgJCgnYnVmZmVyJykuZmlyc3RDaGlsZFxuICAgICAgICBpICs9IDFcblxuICAgIGhpZ2hsaWdodCBpbmRleCA/IGJ1ZmZlcnMubGVuZ3RoLTFcblxuIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgICAgIDAwMDAwMDAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAgICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAgIDAwMCAgIDAwMFxuIyAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgICAgIDAwMCAgICAgICAgMDAwMDAwMCAgIDAwMCAgICAwMDAgICAgMDAwMDAwMFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgICAgIDAwMCAgICAgICAgICAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG4jIDAwMCAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgICAwMDAwMDAwICAgMDAwICAwMDAwMDAwICAwMDAwMDAwMFxuXG5kZWZhdWx0Rm9udFNpemUgPSAxNVxuXG5nZXRGb250U2l6ZSA9IC0+IHByZWZzLmdldCAnZm9udFNpemUnLCBkZWZhdWx0Rm9udFNpemVcblxuc2V0Rm9udFNpemUgPSAocykgLT5cbiAgICAgICAgXG4gICAgcyA9IGdldEZvbnRTaXplKCkgaWYgbm90IF8uaXNGaW5pdGUgc1xuICAgIHMgPSBjbGFtcCA0IDQ0IHNcblxuICAgIHByZWZzLnNldCBcImZvbnRTaXplXCIgc1xuXG4gICAgc2V0U3R5bGUgXCIjYnVmZmVyXCIgJ2ZvbnQtc2l6ZScgXCIje3N9cHhcIlxuICAgIGljb25TaXplID0gY2xhbXAgMTggNjQgcyoyXG4gICAgc2V0U3R5bGUgJ2ltZy5hcHBpY29uJyAnaGVpZ2h0JyBcIiN7aWNvblNpemV9cHhcIlxuICAgIHNldFN0eWxlICdpbWcuYXBwaWNvbicgJ3dpZHRoJyAgXCIje2ljb25TaXplfXB4XCJcbiAgICBzZXRTdHlsZSAnaW1nLmFwcGljb24nICdwYWRkaW5nLXRvcCcgIFwiNnB4XCJcblxuY2hhbmdlRm9udFNpemUgPSAoZCkgLT5cbiAgICBcbiAgICBzID0gZ2V0Rm9udFNpemUoKVxuICAgIGlmICAgICAgcyA+PSAzMCB0aGVuIGYgPSA0XG4gICAgZWxzZSBpZiBzID49IDUwIHRoZW4gZiA9IDEwXG4gICAgZWxzZSBpZiBzID49IDIwIHRoZW4gZiA9IDJcbiAgICBlbHNlICAgICAgICAgICAgICAgICBmID0gMVxuICAgICAgICBcbiAgICBzZXRGb250U2l6ZSBzICsgZipkXG5cbnJlc2V0Rm9udFNpemUgPSAtPlxuICAgIFxuICAgIHByZWZzLnNldCAnZm9udFNpemUnLCBkZWZhdWx0Rm9udFNpemVcbiAgICBzZXRGb250U2l6ZSBkZWZhdWx0Rm9udFNpemVcbiAgICAgXG5vbldoZWVsID0gKGV2ZW50KSAtPlxuICAgIFxuICAgIGlmIDAgPD0gdy5tb2RpZmllcnMuaW5kZXhPZiAnY3RybCdcbiAgICAgICAgY2hhbmdlRm9udFNpemUgLWV2ZW50LmRlbHRhWS8xMDBcbiAgXG5zZXRGb250U2l6ZSBnZXRGb250U2l6ZSgpXG53aW5kb3cuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciAnd2hlZWwnIG9uV2hlZWwgICAgXG4gICAgXG4jICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICBcblxucG9zdC5vbiAnY29tYm8nLCAoY29tYm8sIGluZm8pIC0+XG5cbiAgICBzd2l0Y2ggY29tYm9cbiAgICAgICAgd2hlbiAnZXNjJyAgICAgICAgICAgICAgICAgICAgICAgIHRoZW4gcmV0dXJuIHBvc3QudG9NYWluICdjbG9zZVdpbidcbiAgICAgICAgd2hlbiAnZG93bicgJ3JpZ2h0JyAgICAgICAgICAgICAgIHRoZW4gcmV0dXJuIGhpZ2hsaWdodCBjdXJyZW50LTFcbiAgICAgICAgd2hlbiAndXAnICAsICdsZWZ0JyAgICAgICAgICAgICAgIHRoZW4gcmV0dXJuIGhpZ2hsaWdodCBjdXJyZW50KzFcbiAgICAgICAgd2hlbiAnaG9tZScgJ3BhZ2UgdXAnICAgICAgICAgICAgIHRoZW4gcmV0dXJuIGhpZ2hsaWdodCBidWZmZXJzLmxlbmd0aC0xXG4gICAgICAgIHdoZW4gJ2VuZCcgICdwYWdlIGRvd24nICAgICAgICAgICB0aGVuIHJldHVybiBoaWdobGlnaHQgMFxuICAgICAgICB3aGVuICdlbnRlcicgJ2NvbW1hbmQrdicgJ2N0cmwrdicgdGhlbiByZXR1cm4gZG9QYXN0ZSgpXG4gICAgICAgIHdoZW4gJ2JhY2tzcGFjZScgJ2NvbW1hbmQrYmFja3NwYWNlJyAnY3RybCtiYWNrc3BhY2UnICdkZWxldGUnIHRoZW4gcmV0dXJuIHBvc3QudG9NYWluICdkZWwnIGN1cnJlbnRcblxuIyAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4jIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG5cbnBvc3Qub24gJ21lbnVBY3Rpb24nLCAoYWN0aW9uKSAtPlxuXG4gICAgc3dpdGNoIGFjdGlvblxuICAgICAgICB3aGVuICdDbGVhcicgICAgdGhlbiBwb3N0LnRvTWFpbiAnY2xlYXJCdWZmZXInXG4gICAgICAgIHdoZW4gJ1NhdmUnICAgICB0aGVuIHBvc3QudG9NYWluICdzYXZlQnVmZmVyJ1xuICAgICAgICB3aGVuICdJbmNyZWFzZScgdGhlbiBjaGFuZ2VGb250U2l6ZSArMVxuICAgICAgICB3aGVuICdEZWNyZWFzZScgdGhlbiBjaGFuZ2VGb250U2l6ZSAtMVxuICAgICAgICB3aGVuICdSZXNldCcgICAgdGhlbiByZXNldEZvbnRTaXplKClcbiAgICAgICAgXG5sb2FkQnVmZmVycyBwb3N0LmdldCAnYnVmZmVycydcbiJdfQ==
//# sourceURL=../coffee/clippo.coffee