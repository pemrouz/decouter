'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = router;

var _emitterify = require('utilise/emitterify');

var _emitterify2 = _interopRequireDefault(_emitterify);

var _client = require('utilise/client');

var _client2 = _interopRequireDefault(_client);

var _first = require('utilise/first');

var _first2 = _interopRequireDefault(_first);

var _last = require('utilise/last');

var _last2 = _interopRequireDefault(_last);

/* istanbul ignore next */
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = require('utilise/log')('[router]');
var strip = function strip(d) {
  return (0, _last2.default)(d) == '?' ? d.slice(1, -1) : d.slice(1);
};
var extract = function extract(routes) {
/* istanbul ignore next */
  var o = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
  return function (page) {
    return routes.some(function (r) {
      return o = match(page)(r);
    }) ? o : false;
  };
};
var go = function go(url) {
  return (d3 && d3.event && d3.event.preventDefault(), true), history.pushState({}, '', url), window.emit('change'), url;
};

// redirect to url we should be on
function router(routes) {
  return !_client2.default ? resolve : resolve({ url: location.pathname });

  function resolve(req, res, next) {
    var from = req.url,
        params = req.params = extract(routes)(from),
        to = routes.redirects ? routes.redirects(req) : from;

    if (from != to) log('router redirecting', from, to);

    return _client2.default && from !== to ? { params: extract(routes)(to), url: go(to) } : !_client2.default && from !== to ? res.redirect(to) : !_client2.default ? next() : { params: params, url: to };
  }
}

// match page parts against candidate route parts
function match(page) {
  return function (route) {
    var partsRoute = route.split('/').filter(Boolean),
        partsPage = page.split('/').filter(Boolean),
        vars = {};

    return partsRoute.every(matches) ? vars : false;

    function matches(d, i) {
      var r = partsRoute[i],
          p = partsPage[i];

      return r == p ? true // fixed segment
      : (0, _last2.default)(r) == '?' ? (vars[strip(r)] = p, true // optional variable segment
      ) : (0, _first2.default)(r) == ':' ? vars[strip(r)] = p : // variable segment
      false;
    }
  };
}

if (_client2.default) {
  (0, _emitterify2.default)(window).addEventListener('popstate', function (d) {
    return window.emit('change');
  });
  window.go = go;
  window.router = router;
}