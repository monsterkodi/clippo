// koffee 1.14.0

/*
 0000000  000      000  00000000   00000000    0000000
000       000      000  000   000  000   000  000   000
000       000      000  00000000   00000000   000   000
000       000      000  000        000        000   000
 0000000  0000000  000  000        000         0000000
 */
var $, _, buffers, changeFontSize, clamp, current, defaultFontSize, doPaste, electron, elem, getFontSize, highlight, kstr, lineForTarget, loadBuffers, main, onWheel, pkg, post, prefs, ref, resetFontSize, setFocus, setFontSize, setStyle, slash, valid, w, win;

ref = require('kxk'), $ = ref.$, _ = ref._, clamp = ref.clamp, elem = ref.elem, kstr = ref.kstr, post = ref.post, prefs = ref.prefs, setStyle = ref.setStyle, slash = ref.slash, valid = ref.valid, win = ref.win;

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
    iconDir = slash.encode(slash.join(post.get('userData'), 'icons'));
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpcHBvLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsiY2xpcHBvLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFRQSxNQUF3RSxPQUFBLENBQVEsS0FBUixDQUF4RSxFQUFFLFNBQUYsRUFBSyxTQUFMLEVBQVEsaUJBQVIsRUFBZSxlQUFmLEVBQXFCLGVBQXJCLEVBQTJCLGVBQTNCLEVBQWlDLGlCQUFqQyxFQUF3Qyx1QkFBeEMsRUFBa0QsaUJBQWxELEVBQXlELGlCQUF6RCxFQUFnRTs7QUFFaEUsR0FBQSxHQUFZLE9BQUEsQ0FBUSxpQkFBUjs7QUFDWixRQUFBLEdBQVksT0FBQSxDQUFRLFVBQVI7O0FBRVosQ0FBQSxHQUFJLElBQUksR0FBSixDQUNBO0lBQUEsR0FBQSxFQUFRLFNBQVI7SUFDQSxHQUFBLEVBQVEsR0FEUjtJQUVBLElBQUEsRUFBUSxxQkFGUjtJQUdBLElBQUEsRUFBUSxvQkFIUjtDQURBOztBQU1KLE9BQUEsR0FBVTs7QUFDVixPQUFBLEdBQVU7O0FBQ1YsSUFBQSxHQUFTLENBQUEsQ0FBRSxPQUFGOztBQUNULElBQUksQ0FBQyxLQUFLLENBQUMsUUFBWCxHQUFzQjs7QUFFdEIsT0FBQSxHQUFVLFNBQUE7V0FBRyxJQUFJLENBQUMsTUFBTCxDQUFZLE9BQVosRUFBb0IsT0FBcEI7QUFBSDs7QUFRVixTQUFBLEdBQVksU0FBQyxLQUFEO0FBRVIsUUFBQTtJQUFBLElBQUEsR0FBTSxDQUFBLENBQUUsVUFBRjtJQUNOLElBQUcsWUFBSDtRQUNJLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBZixDQUFzQixTQUF0QixFQURKOztJQUdBLE9BQUEsR0FBVSxJQUFJLENBQUMsR0FBTCxDQUFTLENBQVQsRUFBWSxJQUFJLENBQUMsR0FBTCxDQUFTLEtBQVQsRUFBZ0IsT0FBTyxDQUFDLE1BQVIsR0FBZSxDQUEvQixDQUFaO0lBRVYsSUFBQSxHQUFNLENBQUEsQ0FBRSxN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QUFFMkMsbUJBQU8sU0FBQSxDQUFVLE9BQUEsR0FBUSxDQUFsQjtBQUZsRCxhQUdTLElBSFQ7QUFBQSxhQUdpQixNQUhqQjtBQUcyQyxtQkFBTyxTQUFBLENBQVUsT0FBQSxHQUFRLENBQWxCO0FBSGxELGFBSVMsTUFKVDtBQUFBLGFBSWdCLFNBSmhCO0FBSTJDLG1CQUFPLFNBQUEsQ0FBVSxPQUFPLENBQUMsTUFBUixHQUFlLENBQXpCO0FBSmxELGFBS1MsS0FMVDtBQUFBLGFBS2dCLFdBTGhCO0FBSzJDLG1CQUFPLFNBQUEsQ0FBVSxDQUFWO0FBTGxELGFBTVMsT0FOVDtBQUFBLGFBTWlCLFdBTmpCO0FBQUEsYUFNNkIsUUFON0I7QUFNMkMsbUJBQU8sT0FBQSxDQUFBO0FBTmxELGFBT1MsV0FQVDtBQUFBLGFBT3FCLG1CQVByQjtBQUFBLGFBT3lDLGdCQVB6QztBQUFBLGFBTzBELFFBUDFEO0FBT3dFLG1CQUFPLElBQUksQ0FBQyxNQUFMLENBQVksS0FBWixFQUFrQixPQUFsQjtBQVAvRTtBQUZZLENBQWhCOztBQWlCQSxJQUFJLENBQUMsRUFBTCxDQUFRLFlBQVIsRUFBcUIsU0FBQyxNQUFEO0FBRWpCLFlBQU8sTUFBUDtBQUFBLGFBQ1MsT0FEVDttQkFDeUIsSUFBSSxDQUFDLE1BQUwsQ0FBWSxhQUFaO0FBRHpCLGFBRVMsTUFGVDttQkFFeUIsSUFBSSxDQUFDLE1BQUwsQ0FBWSxZQUFaO0FBRnpCLGFBR1MsVUFIVDttQkFHeUIsY0FBQSxDQUFlLENBQUMsQ0FBaEI7QUFIekIsYUFJUyxVQUpUO21CQUl5QixjQUFBLENBQWUsQ0FBQyxDQUFoQjtBQUp6QixhQUtTLE9BTFQ7bUJBS3lCLGFBQUEsQ0FBQTtBQUx6QjtBQUZpQixDQUFyQjs7QUFTQSxXQUFBLENBQVksSUFBSSxDQUFDLEdBQUwsQ0FBUyxTQUFULENBQVoiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAwMDAgICAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMFxuMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMCAgIDAwMFxuMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIDAwMCAgIDAwMFxuIDAwMDAwMDAgIDAwMDAwMDAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgICAwMDAwMDAwXG4jIyNcblxueyAkLCBfLCBjbGFtcCwgZWxlbSwga3N0ciwgcG9zdCwgcHJlZnMsIHNldFN0eWxlLCBzbGFzaCwgdmFsaWQsIHdpbiB9ID0gcmVxdWlyZSAna3hrJ1xuXG5wa2cgICAgICAgPSByZXF1aXJlICcuLi9wYWNrYWdlLmpzb24nXG5lbGVjdHJvbiAgPSByZXF1aXJlICdlbGVjdHJvbidcblxudyA9IG5ldyB3aW4gXG4gICAgZGlyOiAgICBfX2Rpcm5hbWVcbiAgICBwa2c6ICAgIHBrZ1xuICAgIG1lbnU6ICAgJy4uL2NvZmZlZS9tZW51Lm5vb24nXG4gICAgaWNvbjogICAnLi4vaW1nL21lbnVAMngucG5nJ1xuICAgIFxuY3VycmVudCA9IDBcbmJ1ZmZlcnMgPSBbXVxubWFpbiAgICA9JCBcIiNtYWluXCJcbm1haW4uc3R5bGUub3ZlcmZsb3cgPSAnc2Nyb2xsJ1xuXG5kb1Bhc3RlID0gLT4gcG9zdC50b01haW4gJ3Bhc3RlJyBjdXJyZW50XG5cbiMgMDAwICAgMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMDBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAgICAwMDBcbiMgMDAwMDAwMDAwICAwMDAgIDAwMCAgMDAwMCAgMDAwMDAwMDAwICAwMDAgICAgICAwMDAgIDAwMCAgMDAwMCAgMDAwMDAwMDAwICAgICAwMDBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAwMDBcblxuaGlnaGxpZ2h0ID0gKGluZGV4KSAtPlxuICAgIFxuICAgIGNkaXYgPSQgJy5jdXJyZW50J1xuICAgIGlmIGNkaXY/XG4gICAgICAgIGNkaXYuY2xhc3NMaXN0LnJlbW92ZSAnY3VycmVudCdcblxuICAgIGN1cnJlbnQgPSBNYXRoLm1heCAwLCBNYXRoLm1pbiBpbmRleCwgYnVmZmVycy5sZW5ndGgtMVxuICAgIFxuICAgIGxpbmUgPSQgXCJsaW5lI3tjdXJyZW50fVwiXG4gICAgXG4gICAgaWYgbGluZT9cbiAgICAgICAgbGluZS5jbGFzc0xpc3QuYWRkICdjdXJyZW50J1xuICAgICAgICBsaW5lLnNjcm9sbEludG9WaWV3SWZOZWVkZWQoKVxuICAgICAgICBzZXRGb2N1cygpXG4gICAgICAgIFxud2luZG93Lm9ubG9hZCA9IC0+XG5cbiAgICBoaWdobGlnaHQgYnVmZmVycy5sZW5ndGgtMVxuICAgIHNldEZvY3VzKClcblxuIyAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIFxuXG5zZXRGb2N1cyA9IC0+IG1haW4uZm9jdXMoKVxuXG5saW5lRm9yVGFyZ2V0ID0gKHRhcmdldCkgLT5cbiAgICBcbiAgICBpZiB1cEVsZW0gPSBlbGVtLnVwRWxlbSB0YXJnZXQsIHsgY2xhc3M6J2xpbmUtZGl2JyB9XG4gICAgICAgIHJldHVybiBwYXJzZUludCB1cEVsZW0uaWQuc3Vic3RyIDRcbiAgICBcbm1haW4uYWRkRXZlbnRMaXN0ZW5lciAnbW91c2VvdmVyJyAoZXZlbnQpIC0+XG4gICAgXG4gICAgaWQgPSBsaW5lRm9yVGFyZ2V0IGV2ZW50LnRhcmdldFxuICAgIGlmIHZhbGlkIGlkXG4gICAgICAgIGhpZ2hsaWdodCBpZFxuXG5tYWluLmFkZEV2ZW50TGlzdGVuZXIgJ2NsaWNrJyAoZXZlbnQpIC0+XG4gICAgXG4gICAgaWQgPSBsaW5lRm9yVGFyZ2V0IGV2ZW50LnRhcmdldFxuICAgIGlmIHZhbGlkIGlkXG4gICAgICAgIGhpZ2hsaWdodCBpZCBcbiAgICAgICAgZG9QYXN0ZSgpXG4gICAgXG4jIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwXG4jIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDBcbiMgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMFxuIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4jIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwXG5cbnBvc3Qub24gJ2xvYWRCdWZmZXJzJywgKGJ1ZmZzLCBpbmRleCkgLT4gbG9hZEJ1ZmZlcnMgYnVmZnMsIGluZGV4XG5wb3N0Lm9uICdzY2hlbWVDaGFuZ2VkJywgLT4gbG9hZEJ1ZmZlcnMgYnVmZmVycywgY3VycmVudFxuXG5sb2FkQnVmZmVycyA9IChidWZmcywgaW5kZXgpIC0+XG5cbiAgICBidWZmZXJzID0gYnVmZnNcbiAgICBcbiAgICBpZiBidWZmZXJzLmxlbmd0aCA9PSAwXG4gICAgICAgIHMgPSBwcmVmcy5nZXQgJ3NjaGVtZScgJ2RhcmsnXG4gICAgICAgICQoJ21haW4nKS5pbm5lckhUTUwgPSBcIjxjZW50ZXI+PGltZyBjbGFzcz0naW5mbycgc3JjPVxcXCIje19fZGlybmFtZX0vLi4vaW1nL2VtcHR5XyN7c30ucG5nXFxcIj48L2NlbnRlcj5cIlxuICAgICAgICByZXR1cm5cblxuICAgIGljb25EaXIgPSBzbGFzaC5lbmNvZGUgc2xhc2guam9pbiBwb3N0LmdldCgndXNlckRhdGEnKSwgJ2ljb25zJ1xuXG4gICAgJCgnbWFpbicpLmlubmVySFRNTCA9IFwiPGRpdiBpZD0nYnVmZmVyJz48L2Rpdj5cIlxuXG4gICAgaSA9IDBcbiAgICBmb3IgYnVmIGluIGJ1ZmZlcnNcbiAgICAgICAgZGl2ID0gZWxlbSBpZDpcImxpbmUje2l9XCIgY2xhc3M6J2xpbmUtZGl2JyBjaGlsZDpcbiAgICAgICAgICAgIGVsZW0gJ3NwYW4nIGNsYXNzOidsaW5lLXNwYW4nIGNoaWxkcmVuOiBbXG4gICAgICAgICAgICAgICAgZWxlbSAnaW1nJyBjbGFzczonYXBwaWNvbicgc3JjOlwiI3tpY29uRGlyfS8je2J1Zi5hcHB9LnBuZ1wiXG4gICAgICAgICAgICAgICAgaWYgYnVmLmltYWdlP1xuICAgICAgICAgICAgICAgICAgICBlbGVtICdpbWcnIHNyYzpcImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCwje2J1Zi5pbWFnZX1cIiBjbGFzczogJ2ltYWdlJ1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgYnVmLnRleHQ/LnNwbGl0XG4gICAgICAgICAgICAgICAgICAgIGVuY2wgPSAoIGtzdHIuZW5jb2RlKGwpIGZvciBsIGluIGJ1Zi50ZXh0LnNwbGl0IFwiXFxuXCIgKVxuICAgICAgICAgICAgICAgICAgICBlbGVtICdwcmUnIGh0bWw6ZW5jbC5qb2luIFwiPGJyPlwiXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBlbGVtICdwcmUnXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAkKCdidWZmZXInKS5pbnNlcnRCZWZvcmUgZGl2LCAkKCdidWZmZXInKS5maXJzdENoaWxkXG4gICAgICAgIGkgKz0gMVxuXG4gICAgaGlnaGxpZ2h0IGluZGV4ID8gYnVmZmVycy5sZW5ndGgtMVxuXG4jIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAgICAgMDAwMDAwMCAgMDAwICAwMDAwMDAwICAwMDAwMDAwMFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgICAgIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgICAgMDAwICAgMDAwXG4jIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgICAgMDAwICAgICAgICAwMDAwMDAwICAgMDAwICAgIDAwMCAgICAwMDAwMDAwXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgICAgMDAwICAgICAgICAgICAgIDAwMCAgMDAwICAgMDAwICAgICAwMDBcbiMgMDAwICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAwMDAgICAgICAgIDAwMDAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwXG5cbmRlZmF1bHRGb250U2l6ZSA9IDE1XG5cbmdldEZvbnRTaXplID0gLT4gcHJlZnMuZ2V0ICdmb250U2l6ZScsIGRlZmF1bHRGb250U2l6ZVxuXG5zZXRGb250U2l6ZSA9IChzKSAtPlxuICAgICAgICBcbiAgICBzID0gZ2V0Rm9udFNpemUoKSBpZiBub3QgXy5pc0Zpbml0ZSBzXG4gICAgcyA9IGNsYW1wIDQgNDQgc1xuXG4gICAgcHJlZnMuc2V0IFwiZm9udFNpemVcIiBzXG5cbiAgICBzZXRTdHlsZSBcIiNidWZmZXJcIiAnZm9udC1zaXplJyBcIiN7c31weFwiXG4gICAgaWNvblNpemUgPSBjbGFtcCAxOCA2NCBzKjJcbiAgICBzZXRTdHlsZSAnaW1nLmFwcGljb24nICdoZWlnaHQnIFwiI3tpY29uU2l6ZX1weFwiXG4gICAgc2V0U3R5bGUgJ2ltZy5hcHBpY29uJyAnd2lkdGgnICBcIiN7aWNvblNpemV9cHhcIlxuICAgIHNldFN0eWxlICdpbWcuYXBwaWNvbicgJ3BhZGRpbmctdG9wJyAgXCI2cHhcIlxuXG5jaGFuZ2VGb250U2l6ZSA9IChkKSAtPlxuICAgIFxuICAgIHMgPSBnZXRGb250U2l6ZSgpXG4gICAgaWYgICAgICBzID49IDMwIHRoZW4gZiA9IDRcbiAgICBlbHNlIGlmIHMgPj0gNTAgdGhlbiBmID0gMTBcbiAgICBlbHNlIGlmIHMgPj0gMjAgdGhlbiBmID0gMlxuICAgIGVsc2UgICAgICAgICAgICAgICAgIGYgPSAxXG4gICAgICAgIFxuICAgIHNldEZvbnRTaXplIHMgKyBmKmRcblxucmVzZXRGb250U2l6ZSA9IC0+XG4gICAgXG4gICAgcHJlZnMuc2V0ICdmb250U2l6ZScsIGRlZmF1bHRGb250U2l6ZVxuICAgIHNldEZvbnRTaXplIGRlZmF1bHRGb250U2l6ZVxuICAgICBcbm9uV2hlZWwgPSAoZXZlbnQpIC0+XG4gICAgXG4gICAgaWYgMCA8PSB3Lm1vZGlmaWVycy5pbmRleE9mICdjdHJsJ1xuICAgICAgICBjaGFuZ2VGb250U2l6ZSAtZXZlbnQuZGVsdGFZLzEwMFxuICBcbnNldEZvbnRTaXplIGdldEZvbnRTaXplKClcbndpbmRvdy5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyICd3aGVlbCcgb25XaGVlbCAgICBcbiAgICBcbiMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIFxuXG5wb3N0Lm9uICdjb21ibycgKGNvbWJvLCBpbmZvKSAtPlxuXG4gICAgc3dpdGNoIGNvbWJvXG4gICAgICAgIHdoZW4gJ2VzYycgICAgICAgICAgICAgICAgICAgICAgICB0aGVuIHJldHVybiBwb3N0LnRvTWFpbiAnY2xvc2VXaW4nXG4gICAgICAgIHdoZW4gJ2Rvd24nICdyaWdodCcgICAgICAgICAgICAgICB0aGVuIHJldHVybiBoaWdobGlnaHQgY3VycmVudC0xXG4gICAgICAgIHdoZW4gJ3VwJyAgLCAnbGVmdCcgICAgICAgICAgICAgICB0aGVuIHJldHVybiBoaWdobGlnaHQgY3VycmVudCsxXG4gICAgICAgIHdoZW4gJ2hvbWUnICdwYWdlIHVwJyAgICAgICAgICAgICB0aGVuIHJldHVybiBoaWdobGlnaHQgYnVmZmVycy5sZW5ndGgtMVxuICAgICAgICB3aGVuICdlbmQnICAncGFnZSBkb3duJyAgICAgICAgICAgdGhlbiByZXR1cm4gaGlnaGxpZ2h0IDBcbiAgICAgICAgd2hlbiAnZW50ZXInICdjb21tYW5kK3YnICdjdHJsK3YnIHRoZW4gcmV0dXJuIGRvUGFzdGUoKVxuICAgICAgICB3aGVuICdiYWNrc3BhY2UnICdjb21tYW5kK2JhY2tzcGFjZScgJ2N0cmwrYmFja3NwYWNlJyAnZGVsZXRlJyB0aGVuIHJldHVybiBwb3N0LnRvTWFpbiAnZGVsJyBjdXJyZW50XG5cbiMgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiMgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuXG5wb3N0Lm9uICdtZW51QWN0aW9uJyAoYWN0aW9uKSAtPlxuXG4gICAgc3dpdGNoIGFjdGlvblxuICAgICAgICB3aGVuICdDbGVhcicgICAgdGhlbiBwb3N0LnRvTWFpbiAnY2xlYXJCdWZmZXInXG4gICAgICAgIHdoZW4gJ1NhdmUnICAgICB0aGVuIHBvc3QudG9NYWluICdzYXZlQnVmZmVyJ1xuICAgICAgICB3aGVuICdJbmNyZWFzZScgdGhlbiBjaGFuZ2VGb250U2l6ZSArMVxuICAgICAgICB3aGVuICdEZWNyZWFzZScgdGhlbiBjaGFuZ2VGb250U2l6ZSAtMVxuICAgICAgICB3aGVuICdSZXNldCcgICAgdGhlbiByZXNldEZvbnRTaXplKClcbiAgICAgICAgXG5sb2FkQnVmZmVycyBwb3N0LmdldCAnYnVmZmVycydcbiJdfQ==
//# sourceURL=../coffee/clippo.coffee