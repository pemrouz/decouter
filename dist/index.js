'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolve = exports.router = undefined;

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
/* istanbul ignore next */
    var url = arguments.length <= 1 || arguments[1] === undefined ? req.url : arguments[1];

    var params = {},
        to = next(req, params, url, routes);

    return to == '../' || to == '..' ? resolve(routes)(req, '/' + url.split('/').filter(Boolean).slice(0, -1).join('/')) : !to ? false : to !== true ? resolve(routes)(req, to) : { url: url, params: params };
  };
};

var next = function next(req) {
/* istanbul ignore next */
  var params = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
  var url = arguments[2];
  var value = arguments[3];
  var variable = arguments[4];

  var _segment = segment(url);

  var cur = _segment.cur;
  var remainder = _segment.remainder;

  return _pure.is.str(value) || _pure.is.bol(value) ? value : _pure.is.fn(value) && !_pure.is.def(variable) ? next(req, params, url, value(req)) : _pure.is.fn(value) ? next(req, params, url, value(variable, req)) : cur in value ? next(req, params, remainder, value[cur]) : !cur && value[':'] ? next(req, params, remainder, value[':']) : (0, _pure.key)('value')(variables(value).find(function (d) {
    return (d.value = next(req, params, remainder, value[d.key], cur || false)) ? (d.value === true && d.name && (params[d.name] = cur), true) : false;
  }));
};

var variables = function variables(routes) {
  return (0, _pure.keys)(routes).filter(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 1);

    var f = _ref2[0];
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
  (function () {
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
  })();
}

exports.router = router;
exports.resolve = resolve;