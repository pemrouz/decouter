'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolve = exports.router = undefined;

var _emitterify = require('utilise/emitterify');

var _emitterify2 = _interopRequireDefault(_emitterify);

var _client = require('utilise/client');

var _client2 = _interopRequireDefault(_client);

var _parse = require('utilise/parse');

var _parse2 = _interopRequireDefault(_parse);

var _keys = require('utilise/keys');

var _keys2 = _interopRequireDefault(_keys);

var _str = require('utilise/str');

var _str2 = _interopRequireDefault(_str);

/* istanbul ignore next */
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = require('utilise/log')('[router]');
var go = function go(url) {
  return (window.event && window.event.preventDefault(), true), history.pushState({}, '', url), window.emit('change'), url;
};

var router = function router(routes) {
  return !_client2.default ? route : route({ url: location.pathname });

  function route(req, res, next) {
    var from = req.url,
        resolved = resolve(routes)(req),
        to = resolved.url;

    if (from !== to) log('router redirecting', from, to);
    if (_client2.default) location.params = resolved.params;

    return _client2.default && from !== to ? (go(to), resolved) : !_client2.default && from !== to ? res.redirect(to) : !_client2.default ? next() : resolved;
  }
};

var resolve = function resolve(root) {
  return function (req, from) {
    var params = {},
        url = from || req.url,
        to = root({ url: url, req: req, params: params, next: next(req, url, params) });

    return to !== true ? resolve(root)(req, to) : { url: url, params: params };
  };
};

var next = function next(req, url, params) {
  return function (handlers) {
    var _segment = segment(url);

    var first = _segment.first;
    var last = _segment.last;
    var to = '';

    return first in handlers ? handlers[first]({ req: req, next: next(req, last, params), params: params, current: first }) : (0, _keys2.default)(handlers).filter(function (k) {
      return k[0] == ':';
    }).some(function (k) {
      var pm = k.slice(1);
      if (to = handlers[k]({ req: req, next: next(req, last, params), params: params, current: first })) params[pm] = first;

      return to;
    }) && to;
  };
};

function segment(url) {
  var segments = url.split('/').filter(Boolean);
  return { first: segments.shift(), last: segments.join('/') };
}

if (_client2.default) {
  (0, _emitterify2.default)(window).addEventListener('popstate', function (d) {
    return window.emit('change');
  });
  window.go = go;
  window.router = router;
}

exports.router = router;
exports.resolve = resolve;