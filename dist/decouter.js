(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolve = exports.router = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _pure = require('utilise/pure');

var log = require('utilise/log')('[router]'),
    go = function go(url) {
  if (window.event) window.event.preventDefault();
  history.pushState({}, '', url);
  window.dispatchEvent(new CustomEvent('change'));
  return url;
};

var router = function router(routes) {
  return !_pure.client ? route : route({ url: location.pathname });

  function route(req, res, next) {
    var from = req.url,
        resolved = resolve(routes)(req),
        to = resolved.url;

    if (from !== to) log('router redirecting', from, to);
    if (_pure.client) location.params = resolved.params;

    return _pure.client && from !== to ? (go(to), resolved) : !_pure.client && from !== to ? res.redirect(to) : !_pure.client ? next() : resolved;
  }
};

var resolve = function resolve(routes) {
  return function (req) {
    var url = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : req.url;

    var params = {},
        to = next(req, params, url, routes),
        finish = function finish(to) {
      return to == '../' || to == '..' ? resolve(routes)(req, '/' + url.split('/').filter(Boolean).slice(0, -1).join('/')) : !to ? false : to !== true ? resolve(routes)(req, to) : { url: url, params: params };
    };

    return _pure.is.promise(to) ? to.then(finish) : finish(to);
  };
};

var next = function next(req) {
  var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var url = arguments[2];
  var value = arguments[3];
  var variable = arguments[4];

  var _segment = segment(url),
      cur = _segment.cur,
      remainder = _segment.remainder;

  return _pure.is.promise(value) ? value.then(function (v) {
    return next(req, params, url, v, variable);
  }) : _pure.is.str(value) || _pure.is.bol(value) ? value : _pure.is.fn(value) && !_pure.is.def(variable) ? next(req, params, url, value(req)) : _pure.is.fn(value) ? next(req, params, url, value(variable, req)) : cur in value ? next(req, params, remainder, value[cur]) : !cur && value[':'] ? next(req, params, remainder, value[':']) : (0, _pure.key)('value')(variables(value).find(function (d) {
    return (d.value = next(req, params, remainder, value[d.key], cur || false)) ? (d.value === true && d.name && (params[d.name] = cur), true) : false;
  }));
};

var variables = function variables(routes) {
  return (0, _pure.keys)(routes).filter(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 1),
        f = _ref2[0];

    return f == ':';
  }).map(function (k) {
    return { key: k, name: k.slice(1) };
  });
};

function segment(url) {
  var segments = url.split('/').filter(Boolean);
  return { cur: segments.shift(), remainder: '/' + segments.join('/') };
}

if (_pure.client) {
  var draw = window.app && window.app.draw || document.draw || String;
  window.go = go;
  window.router = router;
  window.router.resolve = resolve;
  window.addEventListener('popstate', function (e) {
    return window.dispatchEvent(new CustomEvent('change'));
  });
  window.addEventListener('change', function (e) {
    return e.target == window && draw();
  });
  document.addEventListener('click', function (e) {
    var a = e.path ? e.path.shift() : e.target;
    if (!a.matches('a[href]:not([href^=javascript]):not(.bypass)')) return;
    if (a.origin != location.origin) return;
    e.preventDefault();
    go(a.href);
  });
}

exports.router = router;
exports.resolve = resolve;
},{"utilise/log":57,"utilise/pure":72}],2:[function(require,module,exports){

},{}],3:[function(require,module,exports){
/*

The MIT License (MIT)

Original Library 
  - Copyright (c) Marak Squires

Additional functionality
 - Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

var colors = {};
module['exports'] = colors;

colors.themes = {};

var ansiStyles = colors.styles = require('./styles');
var defineProps = Object.defineProperties;

colors.supportsColor = require('./system/supports-colors');

if (typeof colors.enabled === "undefined") {
  colors.enabled = colors.supportsColor;
}

colors.stripColors = colors.strip = function(str){
  return ("" + str).replace(/\x1B\[\d+m/g, '');
};


var stylize = colors.stylize = function stylize (str, style) {
  if (!colors.enabled) {
    return str+'';
  }

  return ansiStyles[style].open + str + ansiStyles[style].close;
}

var matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;
var escapeStringRegexp = function (str) {
  if (typeof str !== 'string') {
    throw new TypeError('Expected a string');
  }
  return str.replace(matchOperatorsRe,  '\\$&');
}

function build(_styles) {
  var builder = function builder() {
    return applyStyle.apply(builder, arguments);
  };
  builder._styles = _styles;
  // __proto__ is used because we must return a function, but there is
  // no way to create a function with a different prototype.
  builder.__proto__ = proto;
  return builder;
}

var styles = (function () {
  var ret = {};
  ansiStyles.grey = ansiStyles.gray;
  Object.keys(ansiStyles).forEach(function (key) {
    ansiStyles[key].closeRe = new RegExp(escapeStringRegexp(ansiStyles[key].close), 'g');
    ret[key] = {
      get: function () {
        return build(this._styles.concat(key));
      }
    };
  });
  return ret;
})();

var proto = defineProps(function colors() {}, styles);

function applyStyle() {
  var args = arguments;
  var argsLen = args.length;
  var str = argsLen !== 0 && String(arguments[0]);
  if (argsLen > 1) {
    for (var a = 1; a < argsLen; a++) {
      str += ' ' + args[a];
    }
  }

  if (!colors.enabled || !str) {
    return str;
  }

  var nestedStyles = this._styles;

  var i = nestedStyles.length;
  while (i--) {
    var code = ansiStyles[nestedStyles[i]];
    str = code.open + str.replace(code.closeRe, code.open) + code.close;
  }

  return str;
}

function applyTheme (theme) {
  for (var style in theme) {
    (function(style){
      colors[style] = function(str){
        if (typeof theme[style] === 'object'){
          var out = str;
          for (var i in theme[style]){
            out = colors[theme[style][i]](out);
          }
          return out;
        }
        return colors[theme[style]](str);
      };
    })(style)
  }
}

colors.setTheme = function (theme) {
  if (typeof theme === 'string') {
    try {
      colors.themes[theme] = require(theme);
      applyTheme(colors.themes[theme]);
      return colors.themes[theme];
    } catch (err) {
      console.log(err);
      return err;
    }
  } else {
    applyTheme(theme);
  }
};

function init() {
  var ret = {};
  Object.keys(styles).forEach(function (name) {
    ret[name] = {
      get: function () {
        return build([name]);
      }
    };
  });
  return ret;
}

var sequencer = function sequencer (map, str) {
  var exploded = str.split(""), i = 0;
  exploded = exploded.map(map);
  return exploded.join("");
};

// custom formatter methods
colors.trap = require('./custom/trap');
colors.zalgo = require('./custom/zalgo');

// maps
colors.maps = {};
colors.maps.america = require('./maps/america');
colors.maps.zebra = require('./maps/zebra');
colors.maps.rainbow = require('./maps/rainbow');
colors.maps.random = require('./maps/random')

for (var map in colors.maps) {
  (function(map){
    colors[map] = function (str) {
      return sequencer(colors.maps[map], str);
    }
  })(map)
}

defineProps(colors, init());
},{"./custom/trap":4,"./custom/zalgo":5,"./maps/america":8,"./maps/rainbow":9,"./maps/random":10,"./maps/zebra":11,"./styles":12,"./system/supports-colors":13}],4:[function(require,module,exports){
module['exports'] = function runTheTrap (text, options) {
  var result = "";
  text = text || "Run the trap, drop the bass";
  text = text.split('');
  var trap = {
    a: ["\u0040", "\u0104", "\u023a", "\u0245", "\u0394", "\u039b", "\u0414"],
    b: ["\u00df", "\u0181", "\u0243", "\u026e", "\u03b2", "\u0e3f"],
    c: ["\u00a9", "\u023b", "\u03fe"],
    d: ["\u00d0", "\u018a", "\u0500" , "\u0501" ,"\u0502", "\u0503"],
    e: ["\u00cb", "\u0115", "\u018e", "\u0258", "\u03a3", "\u03be", "\u04bc", "\u0a6c"],
    f: ["\u04fa"],
    g: ["\u0262"],
    h: ["\u0126", "\u0195", "\u04a2", "\u04ba", "\u04c7", "\u050a"],
    i: ["\u0f0f"],
    j: ["\u0134"],
    k: ["\u0138", "\u04a0", "\u04c3", "\u051e"],
    l: ["\u0139"],
    m: ["\u028d", "\u04cd", "\u04ce", "\u0520", "\u0521", "\u0d69"],
    n: ["\u00d1", "\u014b", "\u019d", "\u0376", "\u03a0", "\u048a"],
    o: ["\u00d8", "\u00f5", "\u00f8", "\u01fe", "\u0298", "\u047a", "\u05dd", "\u06dd", "\u0e4f"],
    p: ["\u01f7", "\u048e"],
    q: ["\u09cd"],
    r: ["\u00ae", "\u01a6", "\u0210", "\u024c", "\u0280", "\u042f"],
    s: ["\u00a7", "\u03de", "\u03df", "\u03e8"],
    t: ["\u0141", "\u0166", "\u0373"],
    u: ["\u01b1", "\u054d"],
    v: ["\u05d8"],
    w: ["\u0428", "\u0460", "\u047c", "\u0d70"],
    x: ["\u04b2", "\u04fe", "\u04fc", "\u04fd"],
    y: ["\u00a5", "\u04b0", "\u04cb"],
    z: ["\u01b5", "\u0240"]
  }
  text.forEach(function(c){
    c = c.toLowerCase();
    var chars = trap[c] || [" "];
    var rand = Math.floor(Math.random() * chars.length);
    if (typeof trap[c] !== "undefined") {
      result += trap[c][rand];
    } else {
      result += c;
    }
  });
  return result;

}

},{}],5:[function(require,module,exports){
// please no
module['exports'] = function zalgo(text, options) {
  text = text || "   he is here   ";
  var soul = {
    "up" : [
      '̍', '̎', '̄', '̅',
      '̿', '̑', '̆', '̐',
      '͒', '͗', '͑', '̇',
      '̈', '̊', '͂', '̓',
      '̈', '͊', '͋', '͌',
      '̃', '̂', '̌', '͐',
      '̀', '́', '̋', '̏',
      '̒', '̓', '̔', '̽',
      '̉', 'ͣ', 'ͤ', 'ͥ',
      'ͦ', 'ͧ', 'ͨ', 'ͩ',
      'ͪ', 'ͫ', 'ͬ', 'ͭ',
      'ͮ', 'ͯ', '̾', '͛',
      '͆', '̚'
    ],
    "down" : [
      '̖', '̗', '̘', '̙',
      '̜', '̝', '̞', '̟',
      '̠', '̤', '̥', '̦',
      '̩', '̪', '̫', '̬',
      '̭', '̮', '̯', '̰',
      '̱', '̲', '̳', '̹',
      '̺', '̻', '̼', 'ͅ',
      '͇', '͈', '͉', '͍',
      '͎', '͓', '͔', '͕',
      '͖', '͙', '͚', '̣'
    ],
    "mid" : [
      '̕', '̛', '̀', '́',
      '͘', '̡', '̢', '̧',
      '̨', '̴', '̵', '̶',
      '͜', '͝', '͞',
      '͟', '͠', '͢', '̸',
      '̷', '͡', ' ҉'
    ]
  },
  all = [].concat(soul.up, soul.down, soul.mid),
  zalgo = {};

  function randomNumber(range) {
    var r = Math.floor(Math.random() * range);
    return r;
  }

  function is_char(character) {
    var bool = false;
    all.filter(function (i) {
      bool = (i === character);
    });
    return bool;
  }
  

  function heComes(text, options) {
    var result = '', counts, l;
    options = options || {};
    options["up"] =   typeof options["up"]   !== 'undefined' ? options["up"]   : true;
    options["mid"] =  typeof options["mid"]  !== 'undefined' ? options["mid"]  : true;
    options["down"] = typeof options["down"] !== 'undefined' ? options["down"] : true;
    options["size"] = typeof options["size"] !== 'undefined' ? options["size"] : "maxi";
    text = text.split('');
    for (l in text) {
      if (is_char(l)) {
        continue;
      }
      result = result + text[l];
      counts = {"up" : 0, "down" : 0, "mid" : 0};
      switch (options.size) {
      case 'mini':
        counts.up = randomNumber(8);
        counts.mid = randomNumber(2);
        counts.down = randomNumber(8);
        break;
      case 'maxi':
        counts.up = randomNumber(16) + 3;
        counts.mid = randomNumber(4) + 1;
        counts.down = randomNumber(64) + 3;
        break;
      default:
        counts.up = randomNumber(8) + 1;
        counts.mid = randomNumber(6) / 2;
        counts.down = randomNumber(8) + 1;
        break;
      }

      var arr = ["up", "mid", "down"];
      for (var d in arr) {
        var index = arr[d];
        for (var i = 0 ; i <= counts[index]; i++) {
          if (options[index]) {
            result = result + soul[index][randomNumber(soul[index].length)];
          }
        }
      }
    }
    return result;
  }
  // don't summon him
  return heComes(text, options);
}

},{}],6:[function(require,module,exports){
var colors = require('./colors');

module['exports'] = function () {

  //
  // Extends prototype of native string object to allow for "foo".red syntax
  //
  var addProperty = function (color, func) {
    String.prototype.__defineGetter__(color, func);
  };

  var sequencer = function sequencer (map, str) {
      return function () {
        var exploded = this.split(""), i = 0;
        exploded = exploded.map(map);
        return exploded.join("");
      }
  };

  addProperty('strip', function () {
    return colors.strip(this);
  });

  addProperty('stripColors', function () {
    return colors.strip(this);
  });

  addProperty("trap", function(){
    return colors.trap(this);
  });

  addProperty("zalgo", function(){
    return colors.zalgo(this);
  });

  addProperty("zebra", function(){
    return colors.zebra(this);
  });

  addProperty("rainbow", function(){
    return colors.rainbow(this);
  });

  addProperty("random", function(){
    return colors.random(this);
  });

  addProperty("america", function(){
    return colors.america(this);
  });

  //
  // Iterate through all default styles and colors
  //
  var x = Object.keys(colors.styles);
  x.forEach(function (style) {
    addProperty(style, function () {
      return colors.stylize(this, style);
    });
  });

  function applyTheme(theme) {
    //
    // Remark: This is a list of methods that exist
    // on String that you should not overwrite.
    //
    var stringPrototypeBlacklist = [
      '__defineGetter__', '__defineSetter__', '__lookupGetter__', '__lookupSetter__', 'charAt', 'constructor',
      'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'valueOf', 'charCodeAt',
      'indexOf', 'lastIndexof', 'length', 'localeCompare', 'match', 'replace', 'search', 'slice', 'split', 'substring',
      'toLocaleLowerCase', 'toLocaleUpperCase', 'toLowerCase', 'toUpperCase', 'trim', 'trimLeft', 'trimRight'
    ];

    Object.keys(theme).forEach(function (prop) {
      if (stringPrototypeBlacklist.indexOf(prop) !== -1) {
        console.log('warn: '.red + ('String.prototype' + prop).magenta + ' is probably something you don\'t want to override. Ignoring style name');
      }
      else {
        if (typeof(theme[prop]) === 'string') {
          colors[prop] = colors[theme[prop]];
          addProperty(prop, function () {
            return colors[theme[prop]](this);
          });
        }
        else {
          addProperty(prop, function () {
            var ret = this;
            for (var t = 0; t < theme[prop].length; t++) {
              ret = colors[theme[prop][t]](ret);
            }
            return ret;
          });
        }
      }
    });
  }

  colors.setTheme = function (theme) {
    if (typeof theme === 'string') {
      try {
        colors.themes[theme] = require(theme);
        applyTheme(colors.themes[theme]);
        return colors.themes[theme];
      } catch (err) {
        console.log(err);
        return err;
      }
    } else {
      applyTheme(theme);
    }
  };

};
},{"./colors":3}],7:[function(require,module,exports){
var colors = require('./colors');
module['exports'] = colors;

// Remark: By default, colors will add style properties to String.prototype
//
// If you don't wish to extend String.prototype you can do this instead and native String will not be touched
//
//   var colors = require('colors/safe);
//   colors.red("foo")
//
//
require('./extendStringPrototype')();
},{"./colors":3,"./extendStringPrototype":6}],8:[function(require,module,exports){
var colors = require('../colors');

module['exports'] = (function() {
  return function (letter, i, exploded) {
    if(letter === " ") return letter;
    switch(i%3) {
      case 0: return colors.red(letter);
      case 1: return colors.white(letter)
      case 2: return colors.blue(letter)
    }
  }
})();
},{"../colors":3}],9:[function(require,module,exports){
var colors = require('../colors');

module['exports'] = (function () {
  var rainbowColors = ['red', 'yellow', 'green', 'blue', 'magenta']; //RoY G BiV
  return function (letter, i, exploded) {
    if (letter === " ") {
      return letter;
    } else {
      return colors[rainbowColors[i++ % rainbowColors.length]](letter);
    }
  };
})();


},{"../colors":3}],10:[function(require,module,exports){
var colors = require('../colors');

module['exports'] = (function () {
  var available = ['underline', 'inverse', 'grey', 'yellow', 'red', 'green', 'blue', 'white', 'cyan', 'magenta'];
  return function(letter, i, exploded) {
    return letter === " " ? letter : colors[available[Math.round(Math.random() * (available.length - 1))]](letter);
  };
})();
},{"../colors":3}],11:[function(require,module,exports){
var colors = require('../colors');

module['exports'] = function (letter, i, exploded) {
  return i % 2 === 0 ? letter : colors.inverse(letter);
};
},{"../colors":3}],12:[function(require,module,exports){
/*
The MIT License (MIT)

Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

var styles = {};
module['exports'] = styles;

var codes = {
  reset: [0, 0],

  bold: [1, 22],
  dim: [2, 22],
  italic: [3, 23],
  underline: [4, 24],
  inverse: [7, 27],
  hidden: [8, 28],
  strikethrough: [9, 29],

  black: [30, 39],
  red: [31, 39],
  green: [32, 39],
  yellow: [33, 39],
  blue: [34, 39],
  magenta: [35, 39],
  cyan: [36, 39],
  white: [37, 39],
  gray: [90, 39],
  grey: [90, 39],

  bgBlack: [40, 49],
  bgRed: [41, 49],
  bgGreen: [42, 49],
  bgYellow: [43, 49],
  bgBlue: [44, 49],
  bgMagenta: [45, 49],
  bgCyan: [46, 49],
  bgWhite: [47, 49],

  // legacy styles for colors pre v1.0.0
  blackBG: [40, 49],
  redBG: [41, 49],
  greenBG: [42, 49],
  yellowBG: [43, 49],
  blueBG: [44, 49],
  magentaBG: [45, 49],
  cyanBG: [46, 49],
  whiteBG: [47, 49]

};

Object.keys(codes).forEach(function (key) {
  var val = codes[key];
  var style = styles[key] = [];
  style.open = '\u001b[' + val[0] + 'm';
  style.close = '\u001b[' + val[1] + 'm';
});
},{}],13:[function(require,module,exports){
(function (process){
/*
The MIT License (MIT)

Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

var argv = process.argv;

module.exports = (function () {
  if (argv.indexOf('--no-color') !== -1 ||
    argv.indexOf('--color=false') !== -1) {
    return false;
  }

  if (argv.indexOf('--color') !== -1 ||
    argv.indexOf('--color=true') !== -1 ||
    argv.indexOf('--color=always') !== -1) {
    return true;
  }

  if (process.stdout && !process.stdout.isTTY) {
    return false;
  }

  if (process.platform === 'win32') {
    return true;
  }

  if ('COLORTERM' in process.env) {
    return true;
  }

  if (process.env.TERM === 'dumb') {
    return false;
  }

  if (/^screen|^xterm|^vt100|color|ansi|cygwin|linux/i.test(process.env.TERM)) {
    return true;
  }

  return false;
})();
}).call(this,require('_process'))
},{"_process":14}],14:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],15:[function(require,module,exports){
var to = require('./to')

module.exports = function all(selector, doc){
  var prefix = !doc && document.head.createShadowRoot ? 'html /deep/ ' : ''
  return to.arr((doc || document).querySelectorAll(prefix+selector))
}
},{"./to":87}],16:[function(require,module,exports){
module.exports = function append(v) {
  return function(d){
    return d+v
  }
}
},{}],17:[function(require,module,exports){
var to = require('./to')
  , is = require('./is')

module.exports = function args(indices) {
  return function (fn, ctx) {
    return function(){
      var i = is.arr(indices) ? indices : [indices]
        , a = to.arr(arguments)
                .filter(function(d,x){ return is.in(i)(x) })

      return fn.apply(ctx || this, a)
    }
  }
}
},{"./is":51,"./to":87}],18:[function(require,module,exports){
var is = require('./is')

module.exports = function attr(name, value) {
  var args = arguments.length
  
  return !is.str(name) && args == 2 ? attr(arguments[1]).call(this, arguments[0])
       : !is.str(name) && args == 3 ? attr(arguments[1], arguments[2]).call(this, arguments[0])
       :  function(el){
            var ctx = this || {}
            el = ctx.nodeName || is.fn(ctx.node) ? ctx : el
            el = el.node ? el.node() : el
            el = el.host || el

            return args > 1 && value === false ? el.removeAttribute(name)
                 : args > 1                    ? (el.setAttribute(name, value), value)
                 : el.attributes.getNamedItem(name) 
                && el.attributes.getNamedItem(name).value
          } 
}

},{"./is":51}],19:[function(require,module,exports){
var key = require('./key')

module.exports = function az(k) {
  return function(a, b){
    var ka = key(k)(a) || ''
      , kb = key(k)(b) || ''

    return ka > kb ?  1 
         : ka < kb ? -1 
                   :  0
  }
}

},{"./key":53}],20:[function(require,module,exports){
var key = require('./key')
  , is  = require('./is')

module.exports = function by(k, v){
  var exists = arguments.length == 1
  return function(o){
    var d = is.fn(k) ? k(o) : key(k)(o)
    
    return d && v && d.toLowerCase && v.toLowerCase ? d.toLowerCase() === v.toLowerCase()
         : exists ? Boolean(d)
         : is.fn(v) ? v(d)
         : d == v
  }
}
},{"./is":51,"./key":53}],21:[function(require,module,exports){
module.exports = typeof window != 'undefined'
},{}],22:[function(require,module,exports){
var parse = require('./parse')
  , str = require('./str')
  , is = require('./is')

module.exports = function clone(d) {
  return !is.fn(d) && !is.str(d)
       ? parse(str(d))
       : d
}

},{"./is":51,"./parse":65,"./str":82}],23:[function(require,module,exports){
var client = require('./client')
  , colors = !client && require('colors')
  , has = require('./has')
  , is = require('./is')

module.exports = colorfill()

function colorfill(){
  /* istanbul ignore next */
  ['red', 'green', 'bold', 'grey', 'strip'].forEach(function(color) {
    !is.str(String.prototype[color]) && Object.defineProperty(String.prototype, color, {
      get: function() {
        return String(this)
      } 
    })
  })
}


},{"./client":21,"./has":45,"./is":51,"colors":7}],24:[function(require,module,exports){
module.exports = function copy(from, to){ 
  return function(d){ 
    return to[d] = from[d], d
  }
}
},{}],25:[function(require,module,exports){
module.exports = function datum(node){
  return node.__data__
}
},{}],26:[function(require,module,exports){
var is = require('./is')
  , to = require('./to')
  , key = require('./key')
  , owner = require('./owner')
  , split = require('./split')
  , client = require('./client')
  , identity = require('./identity')
  , DEBUG = strip((client ? (owner.location.search.match(/debug=(.*?)(&|$)/) || [])[1] : key('process.env.DEBUG')(owner)) || '')
  , whitelist = DEBUG.split(',').map(split('/'))

module.exports = function deb(ns){
  return DEBUG == '*' || whitelist.some(matches(ns)) ? out : identity

  function out(d){
    if (!owner.console || !console.log.apply) return d;
    is.arr(arguments[2]) && (arguments[2] = arguments[2].length)
    var args = to.arr(arguments)
      , prefix = '[deb][' + (new Date()).toISOString() + ']' + ns

    args.unshift(prefix.grey ? prefix.grey : prefix)
    return console.log.apply(console, args), d
  }
}

function matches(ns) {
  ns = strip(ns).split('/')
  return function(arr){
    return arr.length == 1 ? arr[0] == ns[0]
         : arr.length == 2 ? arr[0] == ns[0] && arr[1] == ns[1]
                           : false 
  }
}

function strip(str) {
  return str.replace(/(\[|\])/g, '')
}
},{"./client":21,"./identity":48,"./is":51,"./key":53,"./owner":64,"./split":81,"./to":87}],27:[function(require,module,exports){
var is = require('./is')

module.exports = function debounce(d){
  var pending, wait = is.num(d) ? d : 100

  return is.fn(d) 
       ? next(d)
       : next

  function next(fn){
    return function(){
      var ctx = this, args = arguments
      pending && clearTimeout(pending)
      pending = setTimeout(function(){ fn.apply(ctx, args) }, wait)
    }
  }
  
}
},{"./is":51}],28:[function(require,module,exports){
var has = require('./has')

module.exports = function def(o, p, v, w){
  if (o.host && o.host.nodeName) o = o.host
  if (p.name) v = p, p = p.name
  !has(o, p) && Object.defineProperty(o, p, { value: v, writable: w })
  return o[p]
}

},{"./has":45}],29:[function(require,module,exports){
var keys = require('./keys')
  , is = require('./is')

module.exports = function defaults(o, k, v){
  if (o.host) o = o.host
  return is.obj(k) 
       ? (keys(k).map(function(i) { set(i, k[i]) }), o)
       : (set(k, v), o[k])

  function set(k, v) {
    if (!is.def(o[k])) o[k] = v
  }
}
},{"./is":51,"./keys":54}],30:[function(require,module,exports){
module.exports = function delay(ms, d){ 
  return new Promise(function(resolve){
    setTimeout(function(){ resolve(d) }, ms)
  })
}
},{}],31:[function(require,module,exports){
module.exports = function done(o) {
  return function(then){
    o.once('response._' + (o.log.length - 1), then)
  }
}
},{}],32:[function(require,module,exports){
var attr = require('./attr')
  , split = require('./split')
  , replace = require('./replace')
  , prepend = require('./prepend')

module.exports = function el(selector){
  var attrs = []
    , css = selector.replace(/\[(.+?)=(.*?)\]/g, function($1, $2, $3){ attrs.push([$2, $3]); return '' }).split('.')
    , tag  = css.shift()
    , elem = document.createElement(tag)

  attrs.forEach(function(d){ attr(elem, d[0], d[1]) })
  css.forEach(function(d){ elem.classList.add(d)})
  elem.toString = function(){ return tag + css.map(prepend('.')).join('') }

  return elem
}
},{"./attr":18,"./prepend":69,"./replace":77,"./split":81}],33:[function(require,module,exports){
var promise = require('./promise')
  , def     = require('./def')
  
module.exports = function emitterify(body) {
  body = body || {}
  def(body, 'emit', emit, 1)
  def(body, 'once', once, 1)
  def(body, 'off', off, 1)
  def(body, 'on', on, 1)
  body.on['*'] = []
  return body

  function emit(type, pm, filter) {
    var li = body.on[type.split('.')[0]] || []
    
    for (var i = 0; i < li.length; i++)
      if (!li[i].ns || !filter || filter(li[i].ns))
        call(li[i].once ? li.splice(i, 1)[0] : li[i], pm)

    for (var i = 0; i < body.on['*'].length; i++)
      call(body.on['*'][i], [type, pm])

    if (li.source) call(li.source, pm)

    return body
  }


  function call(cb, pm){
      cb.next             ? cb.next(pm) 
    : pm instanceof Array ? cb.apply(body, pm) 
                          : cb.call(body, pm) 
  }

  function on(type, cb) {
    var id = type.split('.')[0]
      , li = body.on[id] = body.on[id] || []
      , i = li.length

    if (!cb) return body.on[type].source || (body.on[type].source = observable())

    if ((cb.ns = type.split('.')[1]))
      while (~--i && li[i].ns === cb.ns)
        li.splice(i, 1)

    li.push(cb)
    return cb.next ? cb : body
  }

  function once(type, callback){
    (callback = callback || observable()).once = true
    return body.on(type, callback)
  }

  function off(type, cb) {
    var li = (body.on[type] || [])
      , i  = li.length

    if (cb && cb == li.source) 
      return delete li.source

    while (~--i && (cb == li[i] || !cb))
      li.splice(i, 1)
  }

  function observable() {
    var o = promise()
    o.listeners = []
    o.i = 0

    o.map = function(fn) {
      var n = observable()
      o.listeners.push(function(d, i){ n.next(fn(d, i, n)) })
      o.listeners[o.listeners.length - 1].fn = fn
      return n
    }

    o.filter = function(fn) {
      var n = observable()
      o.listeners.push(function(d, i){ fn(d, i, n) && n.next(d) })
      o.listeners[o.listeners.length - 1].fn = fn
      return n
    }

    o.reduce = function(fn, seed) {
      var n = observable()
      o.listeners.push(function(d, i){ n.next(seed = fn(seed, d, i, n)) })
      o.listeners[o.listeners.length - 1].fn = fn
      return n
    }

    o.next = function(d) {
      o.resolve(d)
      o.listeners.map(function(fn){ fn(d, o.i) })
      o.i++
      return o
    }

    o.off = function(fn){
      var i = o.listeners.length

      while (~--i && (fn == o.listeners[i].fn || !fn))
        o.listeners.splice(i, 1)
      return o
    }

    return o

  }
}
},{"./def":28,"./promise":70}],34:[function(require,module,exports){
var is = require('./is')
  , to = require('./to')
  , owner = require('./owner')

module.exports = function err(ns){
  return function(d){
    if (!owner.console || !console.error.apply) return d;
    is.arr(arguments[2]) && (arguments[2] = arguments[2].length)
    var args = to.arr(arguments)
      , prefix = '[err][' + (new Date()).toISOString() + ']' + ns

    args.unshift(prefix.red ? prefix.red : prefix)
    return console.error.apply(console, args), d
  }
}
},{"./is":51,"./owner":64,"./to":87}],35:[function(require,module,exports){
module.exports = function escape(str) {
  return str.replace(/[&<>'"]/g, function(char){
    return safe[char]
  })
}

var safe = { 
  "&": "&amp;"
, "<": "&lt;"
, ">": "&gt;"
, '"': "&quot;"
, "'": "&#39;"
}

},{}],36:[function(require,module,exports){
var is = require('./is')
  , not = require('./not')
  , keys = require('./keys')
  , copy = require('./copy')

module.exports = function extend(to){ 
  return function(from){
    keys(from)
      .filter(not(is.in(to)))
      .map(copy(from, to))

    return to
  }
}
},{"./copy":24,"./is":51,"./keys":54,"./not":60}],37:[function(require,module,exports){
module.exports = function falsy(){
  return false
}
},{}],38:[function(require,module,exports){
module.exports = function first(d){
  return d && d[0]
}
},{}],39:[function(require,module,exports){
var is = require('./is')  

module.exports = function flatten(p,v){ 
  is.arr(v) && (v = v.reduce(flatten, []))
  return (p = p || []), p.concat(v) 
}

},{"./is":51}],40:[function(require,module,exports){
var is = require('./is')

module.exports = function fn(candid){
  return is.fn(candid) ? candid
       : (new Function("return " + candid))()
}
},{"./is":51}],41:[function(require,module,exports){
var includes  = require('./includes')
  , attr = require('./attr')
  , all = require('./all')

module.exports = function form(root) {
  var name = attr('name')
    , values = {}
    , invalid = []

  all('[name]', root)
    .map(function(el){ 
      var n = name(el)
        , v = values[n] = 
            el.state              ? el.state.value 
          : el.files              ? el.files
          : el.type == 'checkbox' ? (values[n] || []).concat(el.checked ? el.value : [])
          : el.type == 'radio'    ? (el.checked ? el.value : values[n])
                                  : el.value

      if (includes('is-invalid')(el.className)) invalid.push(el)
    })

  return { values: values, invalid: invalid }
}
},{"./all":15,"./attr":18,"./includes":50}],42:[function(require,module,exports){
var datum = require('./datum')
  , key = require('./key')

module.exports = from
from.parent = fromParent

function from(o){
  return function(k){
    return key(k)(o)
  }
}

function fromParent(k){
  return datum(this.parentNode)[k]
}
},{"./datum":25,"./key":53}],43:[function(require,module,exports){
var to = require('./to')
  , is = require('./is')

module.exports = function grep(o, k, regex){
  var original = o[k] 
  o[k] = function(){ 
    var d = to.arr(arguments).filter(is.str).join(' ')
    return d.match(regex) && original.apply(this, arguments) 
  }
  return original
}
},{"./is":51,"./to":87}],44:[function(require,module,exports){
var client = require('./client')
  , owner = require('./owner')
  , noop = require('./noop')

module.exports = function group(prefix, fn){
  if (!owner.console) return fn()
  if (!console.groupCollapsed) polyfill()
  console.groupCollapsed(prefix)
  var ret = fn()
  console.groupEnd(prefix)
  return ret
}

function polyfill() {
  console.groupCollapsed = console.groupEnd = function(d){
    (console.log || noop)('*****', d, '*****')
  }
}
},{"./client":21,"./noop":59,"./owner":64}],45:[function(require,module,exports){
module.exports = function has(o, k) {
  return k in o
}
},{}],46:[function(require,module,exports){
module.exports = function hashcode(str) {
  var hash = 0
  if (!str) return hash
  for (var i = 0; i < str.length; i++) {
    var char = str.charCodeAt(i)
    hash = ((hash<<5)-hash)+char
    hash = hash & hash
  }
  return hash
}

},{}],47:[function(require,module,exports){
var key = require('./key')

module.exports = function header(header, value) {
  var getter = arguments.length == 1
  return function(d){ 
    return !d || !d.headers ? null
         : getter ? key(header)(d.headers)
                  : key(header)(d.headers) == value
  }
}
},{"./key":53}],48:[function(require,module,exports){
module.exports = function identity(d) {
  return d
}
},{}],49:[function(require,module,exports){
module.exports = function iff(condition){
  return function(handler){
    return function(){
      if (condition.apply(this, arguments))
        return handler.apply(this, arguments)
    }
  }
}
},{}],50:[function(require,module,exports){
module.exports = function includes(pattern){
  return function(d){
    return d && d.indexOf && ~d.indexOf(pattern)
  }
}
},{}],51:[function(require,module,exports){
module.exports = is
is.fn      = isFunction
is.str     = isString
is.num     = isNumber
is.obj     = isObject
is.lit     = isLiteral
is.bol     = isBoolean
is.truthy  = isTruthy
is.falsy   = isFalsy
is.arr     = isArray
is.null    = isNull
is.def     = isDef
is.in      = isIn
is.promise = isPromise

function is(v){
  return function(d){
    return d == v
  }
}

function isFunction(d) {
  return typeof d == 'function'
}

function isBoolean(d) {
  return typeof d == 'boolean'
}

function isString(d) {
  return typeof d == 'string'
}

function isNumber(d) {
  return typeof d == 'number'
}

function isObject(d) {
  return typeof d == 'object'
}

function isLiteral(d) {
  return typeof d == 'object' 
      && !(d instanceof Array)
}

function isTruthy(d) {
  return !!d == true
}

function isFalsy(d) {
  return !!d == false
}

function isArray(d) {
  return d instanceof Array
}

function isNull(d) {
  return d === null
}

function isDef(d) {
  return typeof d !== 'undefined'
}

function isPromise(d) {
  return d instanceof Promise
}

function isIn(set) {
  return function(d){
    return !set ? false  
         : set.indexOf ? ~set.indexOf(d)
         : d in set
  }
}
},{}],52:[function(require,module,exports){
var clone = require('./clone')
  , key = require('./key')
  , by = require('./by')
  , is = require('./is')

module.exports = function join(left, right){
  if (arguments.length == 1) {
    right = left
    left = null
  }

  return function(d, uid){
    if (d === null || d === undefined) return undefined
    var table = right || [], field = null
    if (!uid || is.num(uid)) uid = 'id'
    if (is.str(right)) {
      var array = right.split('.')
      table = ripple(array.shift())
      field = array.join('.')
    }
    
    var id  = key(left)(d)
      , val = table
                .filter(by(uid, id))
                .map(key(field))
                .pop() || {}

    return left 
      ? key(left, val)(d) 
      : val
  }
}

},{"./by":20,"./clone":22,"./is":51,"./key":53}],53:[function(require,module,exports){
var str = require('./str')
  , is = require('./is')

module.exports = function key(k, v){ 
  var set = arguments.length > 1
    , keys = is.fn(k) ? [] : str(k).split('.')
    , root = keys.shift()

  return function deep(o, i){
    var masked = {}
    
    return !o ? undefined 
         : !is.num(k) && !k ? o
         : is.arr(k) ? (k.map(copy), masked)
         : o[k] || !keys.length ? (set ? ((o[k] = is.fn(v) ? v(o[k], i) : v), o)
                                       :  (is.fn(k) ? k(o) : o[k]))
                                : (set ? (key(keys.join('.'), v)(o[root] ? o[root] : (o[root] = {})), o)
                                       :  key(keys.join('.'))(o[root]))

    function copy(k){
      var val = key(k)(o)
      ;(val != undefined) && key(k, val)(masked)
    }
  }
}
},{"./is":51,"./str":82}],54:[function(require,module,exports){
var is = require('./is')

module.exports = function keys(o) { 
  return Object.keys(is.obj(o) || is.fn(o) ? o : {})
}
},{"./is":51}],55:[function(require,module,exports){
module.exports =  function last(d) {
  return d && d[d.length-1]
}
},{}],56:[function(require,module,exports){
module.exports = function lo(d){
  return (d || '').toLowerCase()
}

},{}],57:[function(require,module,exports){
var is = require('./is')
  , to = require('./to')
  , owner = require('./owner')

module.exports = function log(ns){
  return function(d){
    if (!owner.console || !console.log.apply) return d;
    is.arr(arguments[2]) && (arguments[2] = arguments[2].length)
    var args = to.arr(arguments)
      , prefix = '[log][' + (new Date()).toISOString() + ']' + ns

    args.unshift(prefix.grey ? prefix.grey : prefix)
    return console.log.apply(console, args), d
  }
}
},{"./is":51,"./owner":64,"./to":87}],58:[function(require,module,exports){
var owner = require('./owner')

module.exports = mo
mo.format = moFormat
mo.iso = moIso

function mo(d){
  return owner.moment(d)
}

function moFormat(format) {
  return function(d){
    return mo(d).format(format)
  }
}

function moIso(d) {
  return mo(d).format('YYYY-MM-DD')
}
},{"./owner":64}],59:[function(require,module,exports){
module.exports = function noop(){}
},{}],60:[function(require,module,exports){
module.exports = function not(fn){
  return function(){
    return !fn.apply(this, arguments)
  }
}
},{}],61:[function(require,module,exports){
var is = require('./is')

module.exports = function nullify(fn){
  return is.fn(fn) ? function(){
      return fn.apply(this, arguments) ? true : null
    } 
  : fn ? true
  : null
}
},{"./is":51}],62:[function(require,module,exports){
'use strict'

var emitterify = require('./emitterify')  
  , keys = require('./keys')
  , key = require('./key')
  , deep = key
  , rsplit = /([^\.\[]*)/

module.exports = once

function once(nodes, enter, exit) {
  var n = c.nodes = Array === nodes.constructor ? nodes
        : 'string' === typeof nodes ? document.querySelectorAll(nodes)
        : [nodes]

  var p = n.length
  while (p-- > 0) if (!n[p].evented) event(n[p], p)

  c.node  = function() { return n[0] }
  c.enter = function() { return once(enter) }
  c.exit  = function() { return once(exit) }
  c.size  = function() { return n.length }

  c.text  = function(value){ 
    var fn = 'function' === typeof value
    return arguments.length === 0 ? n[0].textContent : (this.each(function(n, d, i){
      var r = '' + (fn ? value.call(this, d, i) : value), t
      if (this.textContent !== r) 
        !(t = this.firstChild) ? this.appendChild(document.createTextNode(r))
        : t.nodeName === '#text' ? t.nodeValue = r
        : this.textContent = r
    }), this)
  }
  c.html = function(value){
    var fn = 'function' === typeof value
    return arguments.length === 0 ? n[0].innerHTML : (this.each(function(n, d, i){
      var r = '' + (fn ? value.call(this, d, i) : value), t
      if (this.innerHTML !== r) this.innerHTML = r
    }), this)
  }
  c.attr = function(key, value){
    var fn = 'function' === typeof value
    return arguments.length === 1 ? n[0].getAttribute(key) : (this.each(function(n, d, i){
      var r = fn ? value.call(this, d, i) : value
           if (!r && this.hasAttribute(key)) this.removeAttribute(key)
      else if ( r && this.getAttribute(key) !== r) this.setAttribute(key, r)
    }), this) 
  }
  c.classed = function(key, value){
    var fn = 'function' === typeof value
    return arguments.length === 1 ? n[0].classList.contains(key) : (this.each(function(n, d, i){
      var r = fn ? value.call(this, d, i) : value
           if ( r && !this.classList.contains(key)) this.classList.add(key)
      else if (!r &&  this.classList.contains(key)) this.classList.remove(key)
    }), this) 
  }
  c.property = function(key, value){
    var fn = 'function' === typeof value
    return arguments.length === 1 ? deep(key)(n[0]) : (this.each(function(n, d, i){
      var r = fn ? value.call(this, d, i) : value
      if (r !== undefined && deep(key)(this) !== r) deep(key, function(){ return r })(this)
    }), this) 
  }
  c.each = function(fn){
    p = -1; while(n[++p])
      fn.call(n[p], n[p], n[p].__data__, p)
    return this
  }
  c.remove = function(){
    this.each(function(){
      var el = this.host && this.host.nodeName ? this.host : this
      el.parentNode.removeChild(el)
    }) 
    return this
  }  
  c.closest = function(tag){ 
    return once(n
      .map(function(d){ return d.closest(tag) })
      .filter(Boolean))
  }
  c.draw = proxy('draw', c)
  c.once = proxy('once', c)
  c.emit = proxy('emit', c)
  c.on   = proxy('on', c)

  return c
  
  function c(s, d, k, b) {
    var selector
      , data
      , tnodes = []
      , tenter = []
      , texit  = []
      , j = -1
      , p = -1
      , l = -1
      , t = -1

    // reselect
    if (arguments.length === 1) {
      if ('string' !== typeof s) return once(s)

      while (n[++p]) 
        tnodes = tnodes.concat(Array.prototype.slice.call(n[p].querySelectorAll(s), 0))

      return once(tnodes)
    }

    // shortcut
    if (d === 1 && arguments.length == 2) {
      while (n[++p]) { 
        j = n[p].children.length
        selector = s.call ? s(n[p].__data__ || 1, 0) : s
        while (n[p].children[--j])  {
          if (n[p].children[j].matches(selector)) {
            (tnodes[++t] = n[p].children[j]).__data__ = n[p].__data__ || 1
            break
          }
        }

        if (j < 0) n[p].appendChild(tnodes[++t] = tenter[tenter.length] = create(selector, [n[p].__data__ || 1], 0))
        if ('function' === typeof tnodes[t].draw) tnodes[t].draw()
      }

      return once(tnodes, tenter, texit)
    }

    // main loop
    while (n[++p]) {
      selector = 'function' === typeof s ? s(n[p].__data__) : s
      data     = 'function' === typeof d ? d(n[p].__data__) : d
      
      if (d === 1)                    data = n[p].__data__ || [1]
      if ('string' === typeof data)   data = [data]
      if (!data)                      data = []
      if (data.constructor !== Array) data = [data]
      
      if (k) {
        byKey(selector, data, k, b, n[p], tnodes, tenter, texit)
        continue
      }

      l = -1
      j = -1

      while (n[p].children[++j]) { 
        if (!n[p].children[j].matches(selector)) continue
        if (++l >= data.length) { // exit
          n[p].removeChild(texit[texit.length] = n[p].children[j]), --j
          continue 
        }

        (tnodes[++t] = n[p].children[j]).__data__ = data[l] // update
        if ('function' === typeof n[p].children[j].draw) n[p].children[j].draw()
      }

      // enter
      if (typeof selector === 'string') { 
        n[p].templates = n[p].templates || {}
        n[p].templates[selector] = n[p].templates[selector] || create(selector, [], 0)
        while (++l < data.length) { 
          (b ? n[p].insertBefore(tnodes[++t] = tenter[tenter.length] = n[p].templates[selector].cloneNode(false), n[p].querySelector(b)) 
             : n[p].appendChild( tnodes[++t] = tenter[tenter.length] = n[p].templates[selector].cloneNode(false)))
             .__data__ = data[l]
          if ('function' === typeof tnodes[t].draw) tnodes[t].draw()
        }
      } else {
        while (++l < data.length) { 
          (b ? n[p].insertBefore(tnodes[++t] = tenter[tenter.length] = create(selector, data, l), n[p].querySelector(b)) 
             : n[p].appendChild( tnodes[++t] = tenter[tenter.length] = create(selector, data, l)))
          if ('function' === typeof tnodes[t].draw) tnodes[t].draw()
        }
      }
    }
  
    return once(tnodes, tenter, texit)
  }

}

function event(node, index) {
  node = node.host && node.host.nodeName ? node.host : node
  if (node.evented) return
  if (!node.on) emitterify(node)
  var on = node.on
    , emit = node.emit
    , old = keys(node.on)

  node.evented = true

  node.on = function(type) {
    node.addEventListener(type.split('.').shift(), reemit)
    on.apply(node, arguments)
    return node
  }

  node.emit = function(event, detail) {
    node.dispatchEvent(event instanceof window.Event 
      ? event
      : new window.CustomEvent(event, { detail: detail, bubbles: false, cancelable: true }))
    return node
  }

  old.map(function(event){
    node.on[event] = on[event]
    node.on(event)
  })

  function reemit(event){
    if ('object' === typeof window.d3) window.d3.event = event
    emit(event.type, [this.__data__, index, this, event])
  }
}

function proxy(fn, c) {
  return function(){
    var args = arguments
    c.each(function(){
      var node = this.host && this.host.nodeName ? this.host : this
      node[fn] && node[fn].apply(node, args)
    }) 
    return c 
  }
}

function create(s, d, j) {
  var i     = 0
    , attrs = []
    , css   = []
    , sel   = s.call ? s(d[j], j) : s
    , tag   = rsplit.exec(sel)[1] || 'div'
    , node  = document.createElement(tag)

  ;(s.call ? s.toString() : s)
    .replace(/\[(.+?)="(.*?)"\]/g, function($1, $2, $3){ return attrs[attrs.length] = [$2, $3], '' })
    .replace(/\.([^.]+)/g, function($1, $2){ return css[css.length] = $2, ''})

  for (i = 0; i < attrs.length; i++) 
    node.setAttribute(attrs[i][0], attrs[i][1])

  for (i = 0; i < css.length; i++) 
    node.classList.add(css[i])

  node.__data__ = d[j] || 1
  return node
}

function byKey(selector, data, key, b, parent, tnodes, tenter, texit) {
  var c = -1
    , d = data.length
    , k
    , indexNodes = {}
    , child
    , next

  while (parent.children[++c]) 
    if (!parent.children[c].matches(selector)) continue
    else indexNodes[key(parent.children[c].__data__)] = parent.children[c]

  next = b ? parent.querySelector(b) : null

  while (d--) {
    if (child = indexNodes[k = key(data[d])])
      if (child === true) continue
      else child.__data__ = data[d]
    else
      tenter.unshift(child = create(selector, data, d))
    
    indexNodes[k] = true

    if (d == data.length - 1 || next !== child.nextSibling)
      parent.insertBefore(child, next)

    tnodes.unshift(next = child)
    if ('function' === typeof child.draw) child.draw()
  }

  for (c in indexNodes)
    if (indexNodes[c] !== true)
      texit.unshift(parent.removeChild(indexNodes[c]))
}
},{"./emitterify":33,"./key":53,"./keys":54}],63:[function(require,module,exports){
var is = require('./is')
  , keys = require('./keys')
  , copy = require('./copy')

module.exports = function overwrite(to){ 
  return function(from){
    keys(from)
      .map(copy(from, to))
        
    return to
  }
}
},{"./copy":24,"./is":51,"./keys":54}],64:[function(require,module,exports){
(function (global){
var client = require('./client')
module.exports = client ? /* istanbul ignore next */ window : global
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./client":21}],65:[function(require,module,exports){
module.exports = function parse(d){
  return d && JSON.parse(d)
}
},{}],66:[function(require,module,exports){
var keys = require('./keys')
  , set = require('./set')
  
module.exports = function patch(key, values){
  return function(o){
    return keys(values)
      .map(function(k){
        return set({ key: key + '.' + k, value: values[k], type: 'update' })(o)
      }), o
  }
}
},{"./keys":54,"./set":78}],67:[function(require,module,exports){
(function (process){
var log = require('./log')('[perf]')
  , client = require('./client')

module.exports =  function perf(fn, msg) {
  return function(){
    /* istanbul ignore next */
    var start  = client ? performance.now() : process.hrtime()
      , retval = fn.apply(this, arguments)
      , diff   = client ? performance.now() - start : process.hrtime(start)

    !client && (diff = (diff[0]*1e3 + diff[1]/1e6))
    diff = Math.round(diff*100)/100
    log(msg || fn.name, diff, 'ms'), diff
    return retval
  }
}
}).call(this,require('_process'))
},{"./client":21,"./log":57,"_process":14}],68:[function(require,module,exports){
var last = require('./last')
  , set = require('./set')
  , is = require('./is')

module.exports = function pop(o){
  return is.arr(o) 
       ? set({ key: o.length - 1, value: last(o), type: 'remove' })(o)
       : o 
}
},{"./is":51,"./last":55,"./set":78}],69:[function(require,module,exports){
module.exports = function prepend(v) {
  return function(d){
    return v+d
  }
}
},{}],70:[function(require,module,exports){
module.exports = promise

function promise() {
  var resolve
    , reject
    , p = new Promise(function(res, rej){ 
        resolve = res, reject = rej
      })

  arguments.length && resolve(arguments[0])
  p.resolve = resolve
  p.reject  = reject
  return p
}
},{}],71:[function(require,module,exports){
var is = require('./is')
  , identity = require('./identity')

module.exports = function proxy(fn, ret, ctx){ 
  return function(){
    var result = (fn || identity).apply(ctx || this, arguments)
    return is.fn(ret) ? ret.call(ctx || this, result) : ret || result
  }
}
},{"./identity":48,"./is":51}],72:[function(require,module,exports){
exports.all = require("./all")
exports.append = require("./append")
exports.args = require("./args")
exports.attr = require("./attr")
exports.az = require("./az")
exports.by = require("./by")
exports.client = require("./client")
exports.clone = require("./clone")
exports.colorfill = require("./colorfill")
exports.copy = require("./copy")
exports.datum = require("./datum")
exports.debounce = require("./debounce")
exports.deb = require("./deb")
exports.def = require("./def")
exports.defaults = require("./defaults")
exports.delay = require("./delay")
exports.done = require("./done")
exports.el = require("./el")
exports.emitterify = require("./emitterify")
exports.err = require("./err")
exports.escape = require("./escape")
exports.extend = require("./extend")
exports.falsy = require("./falsy")
exports.file = require("./file")
exports.first = require("./first")
exports.flatten = require("./flatten")
exports.fn = require("./fn")
exports.form = require("./form")
exports.from = require("./from")
exports.grep = require("./grep")
exports.group = require("./group")
exports.has = require("./has")
exports.hashcode = require("./hashcode")
exports.header = require("./header")
exports.identity = require("./identity")
exports.iff = require("./iff")
exports.includes = require("./includes")
exports.is = require("./is")
exports.join = require("./join")
exports.key = require("./key")
exports.keys = require("./keys")
exports.last = require("./last")
exports.lo = require("./lo")
exports.log = require("./log")
exports.mo = require("./mo")
exports.noop = require("./noop")
exports.not = require("./not")
exports.nullify = require("./nullify")
exports.once = require("./once")
exports.overwrite = require("./overwrite")
exports.owner = require("./owner")
exports.parse = require("./parse")
exports.pause = require("./pause")
exports.patch = require("./patch")
exports.perf = require("./perf")
exports.pop = require("./pop")
exports.prepend = require("./prepend")
exports.promise = require("./promise")
exports.proxy = require("./proxy")
exports.push = require("./push")
exports.raw = require("./raw")
exports.ready = require("./ready")
exports.remove = require("./remove")
exports.replace = require("./replace")
exports.send = require("./send")
exports.set = require("./set")
exports.slice = require("./slice")
exports.sort = require("./sort")
exports.split = require("./split")
exports.str = require("./str")
exports.stripws = require("./stripws")
exports.tdraw = require("./tdraw")
exports.th = require("./th")
exports.time = require("./time")
exports.to = require("./to")
exports.unique = require("./unique")
exports.update = require("./update")
exports.values = require("./values")
exports.via = require("./via")
exports.wait = require("./wait")
exports.wrap = require("./wrap")
exports.za = require("./za")

},{"./all":15,"./append":16,"./args":17,"./attr":18,"./az":19,"./by":20,"./client":21,"./clone":22,"./colorfill":23,"./copy":24,"./datum":25,"./deb":26,"./debounce":27,"./def":28,"./defaults":29,"./delay":30,"./done":31,"./el":32,"./emitterify":33,"./err":34,"./escape":35,"./extend":36,"./falsy":37,"./file":2,"./first":38,"./flatten":39,"./fn":40,"./form":41,"./from":42,"./grep":43,"./group":44,"./has":45,"./hashcode":46,"./header":47,"./identity":48,"./iff":49,"./includes":50,"./is":51,"./join":52,"./key":53,"./keys":54,"./last":55,"./lo":56,"./log":57,"./mo":58,"./noop":59,"./not":60,"./nullify":61,"./once":62,"./overwrite":63,"./owner":64,"./parse":65,"./patch":66,"./pause":2,"./perf":67,"./pop":68,"./prepend":69,"./promise":70,"./proxy":71,"./push":73,"./raw":74,"./ready":75,"./remove":76,"./replace":77,"./send":2,"./set":78,"./slice":79,"./sort":80,"./split":81,"./str":82,"./stripws":83,"./tdraw":84,"./th":85,"./time":86,"./to":87,"./unique":88,"./update":89,"./values":90,"./via":2,"./wait":91,"./wrap":92,"./za":93}],73:[function(require,module,exports){
var set = require('./set')
  , is = require('./is')

module.exports = function push(value){
  return function(o){
    return is.arr(o) 
         ? set({ key: o.length, value: value, type: 'add' })(o)
         : o 
  }
}
},{"./is":51,"./set":78}],74:[function(require,module,exports){
module.exports = function raw(selector, doc){
  var prefix = !doc && document.head.createShadowRoot ? 'html /deep/ ' : ''
  return (doc ? doc : document).querySelector(prefix+selector)
}
},{}],75:[function(require,module,exports){
module.exports = function ready(fn){
  return document.body ? fn() : document.addEventListener('DOMContentLoaded', fn.bind(this))
}

},{}],76:[function(require,module,exports){
var set = require('./set')
  , key = require('./key')
  
module.exports = function remove(k){
  return function(o){
    return set({ key: k, value: key(k)(o), type: 'remove' })(o)
  }
}
},{"./key":53,"./set":78}],77:[function(require,module,exports){
module.exports = function replace(from, to){
  return function(d){
    return d.replace(from, to)
  }
}
},{}],78:[function(require,module,exports){
var act = { add: add, update: update, remove: remove }
  , emitterify = require('./emitterify')
  , def = require('./def')
  , is  = require('./is')
  , str = JSON.stringify
  , parse = JSON.parse

module.exports = function set(d, skipEmit) {
  return function(o, existing, max) {
    if (!is.obj(o))
      return o

    if (!is.obj(d)) { 
      var log = existing || o.log || []
        , root = o

      if (!is.def(max)) max = log.max || 0
      if (!max)    log = []
      if (max < 0) log = log.concat(null)
      if (max > 0) {
        var s = str(o)
        root = parse(s) 
        log = log.concat({ type: 'update', value: parse(s), time: log.length })
      } 

      def(log, 'max', max)
      
      root.log 
        ? (root.log = log)
        : def(emitterify(root, null), 'log', log, 1)

      return root
    }

    if (is.def(d.key)) {
      if (!apply(o, d.type, (d.key = '' + d.key).split('.'), d.value))
        return false
    } else
      return false

    if (o.log && o.log.max) 
      o.log.push((d.time = o.log.length, o.log.max > 0 ? d : null))

    if (!skipEmit && o.emit)
      o.emit('change', d)

    return o
  }
}

function apply(body, type, path, value) {
  var next = path.shift()

  if (!act[type]) 
    return false
  if (path.length) { 
    if (!(next in body)) 
      if (type == 'remove') return true
      else body[next] = {}
    return apply(body[next], type, path, value)
  }
  else {
    act[type](body, next, value)
    return true
  }
}

function add(o, k, v) {
  is.arr(o) 
    ? o.splice(k, 0, v) 
    : (o[k] = v)
}

function update(o, k, v) { 
  o[k] = v 
}

function remove(o, k, v) { 
  is.arr(o) 
    ? o.splice(k, 1)
    : delete o[k]
}
},{"./def":28,"./emitterify":33,"./is":51}],79:[function(require,module,exports){
module.exports = function slice(from, to){
  return function(d){
    return d.slice(from, to)
  }
}
},{}],80:[function(require,module,exports){
module.exports = function sort(fn){
  return function(arr){
    return arr.sort(fn)
  }
}

},{}],81:[function(require,module,exports){
module.exports = function split(delimiter){
  return function(d){
    return d.split(delimiter)
  }
}

},{}],82:[function(require,module,exports){
var is = require('./is') 

module.exports = function str(d){
  return d === 0 ? '0'
       : !d ? ''
       : is.fn(d) ? '' + d
       : is.obj(d) ? JSON.stringify(d)
       : String(d)
}
},{"./is":51}],83:[function(require,module,exports){
var is = require('./is')

module.exports = function stripws(d){
  return (is.arr(d) ? d[0] : d)
    .replace(/([\s]{2,}|[\n])/gim, '')
}
},{"./is":51}],84:[function(require,module,exports){
module.exports = function draw(host, fn, state) {
  var el = host.node ? host.node() : host
  el.state = state || {}
  el.draw = function(d){ return fn && fn.call(el, el.state) }
  el.draw()
  return host
}
},{}],85:[function(require,module,exports){
module.exports = function th(fn) {
  return function(){
    return fn(this).apply(this, arguments)
  }
}

},{}],86:[function(require,module,exports){
module.exports = function time(ms, fn) {
  return arguments.length === 1 
       ? setTimeout(ms)
       : setTimeout(fn, ms)
}
},{}],87:[function(require,module,exports){
var is = require('./is')

module.exports = { 
  arr: toArray
, obj: toObject
}

function toArray(d){
  return Array.prototype.slice.call(d, 0)
}

function toObject(d) {
  var by = 'id'
    , o = {}

  return arguments.length == 1 
    ? (by = d, reduce)
    : reduce.apply(this, arguments)

  function reduce(p,v,i){
    if (i === 0) p = {}
    p[is.fn(by) ? by(v, i) : v[by]] = v
    return p
  }
}
},{"./is":51}],88:[function(require,module,exports){
var is = require('./is')

module.exports = function unique(d, i){
  if (!i) unique.matched = []
  return !is.in(unique.matched)(d) 
       ? unique.matched.push(d)
       : false 
}

},{"./is":51}],89:[function(require,module,exports){
var set = require('./set')
  
module.exports = function update(key, value){
  return function(o){
    return set({ key: key, value: value, type: 'update' })(o)
  }
}
},{"./set":78}],90:[function(require,module,exports){
var keys = require('./keys')
  , from = require('./from')

module.exports = function values(o) {
  return !o ? [] : keys(o).map(from(o))
}
},{"./from":42,"./keys":54}],91:[function(require,module,exports){
module.exports = function wait(condition){
  return function(handler){
    return function(){
      var result = condition.apply(this, arguments)
      result
        ? handler.apply(this, arguments)
        : this.once('change', wait(condition)(handler))
    }
  }
}
},{}],92:[function(require,module,exports){
module.exports = function wrap(d){
  return function(){
    return d
  }
}
},{}],93:[function(require,module,exports){
var key = require('./key')

module.exports = function za(k) {
  return function(a, b){
    var ka = key(k)(a) || ''
      , kb = key(k)(b) || ''

    return ka > kb ? -1 
         : ka < kb ?  1 
                   :  0
  }
}

},{"./key":53}]},{},[1]);
