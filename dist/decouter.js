(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = require('utilise/log')('[router]');
var strip = function strip(d) {
  return (0, _last2.default)(d) == '?' ? d.slice(1, -1) : d.slice(1);
};
var extract = function extract(routes) {
  var o = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
  return function (page) {
    return routes.some(function (r) {
      return o = match(page)(r);
    }) ? o : false;
  };
};
var go = function go(url) {
  return (window.event && window.event.preventDefault(), true), history.pushState({}, '', url), window.emit('change'), url;
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
},{"utilise/client":2,"utilise/emitterify":4,"utilise/first":6,"utilise/last":10,"utilise/log":11}],2:[function(require,module,exports){
module.exports = typeof window != 'undefined'
},{}],3:[function(require,module,exports){
var has = require('utilise/has')

module.exports = function def(o, p, v, w){
  !has(o, p) && Object.defineProperty(o, p, { value: v, writable: w })
  return o[p]
}

},{"utilise/has":7}],4:[function(require,module,exports){
var err  = require('utilise/err')('[emitterify]')
  , keys = require('utilise/keys')
  , def  = require('utilise/def')
  , not  = require('utilise/not')
  , is   = require('utilise/is')
  
module.exports = function emitterify(body) {
  return def(body, 'on', on, 1)
       , def(body, 'once', once, 1)
       , def(body, 'emit', emit, 1)
       , body

  function emit(type, param, filter) {
    var ns = type.split('.')[1]
      , id = type.split('.')[0]
      , li = body.on[id] || []
      , tt = li.length-1
      , pm = is.arr(param) ? param : [param || body]

    if (ns) return invoke(li, ns, pm), body

    for (var i = li.length; i >=0; i--)
      invoke(li, i, pm)

    keys(li)
      .filter(not(isFinite))
      .filter(filter || Boolean)
      .map(function(n){ return invoke(li, n, pm) })

    return body
  }

  function invoke(o, k, p){
    if (!o[k]) return
    var fn = o[k]
    o[k].once && (isFinite(k) ? o.splice(k, 1) : delete o[k])
    try { fn.apply(body, p) } catch(e) { err(e, e.stack)  }
   }

  function on(type, callback) {
    var ns = type.split('.')[1]
      , id = type.split('.')[0]

    body.on[id] = body.on[id] || []
    return !callback && !ns ? (body.on[id])
         : !callback &&  ns ? (body.on[id][ns])
         :  ns              ? (body.on[id][ns] = callback, body)
                            : (body.on[id].push(callback), body)
  }

  function once(type, callback){
    return callback.once = true, body.on(type, callback), body
  }
}
},{"utilise/def":3,"utilise/err":5,"utilise/is":8,"utilise/keys":9,"utilise/not":12}],5:[function(require,module,exports){
var owner = require('utilise/owner')
  , to = require('utilise/to')

module.exports = function err(prefix){
  return function(d){
    if (!owner.console || !console.error.apply) return d;
    var args = to.arr(arguments)
    args.unshift(prefix.red ? prefix.red : prefix)
    return console.error.apply(console, args), d
  }
}
},{"utilise/owner":13,"utilise/to":14}],6:[function(require,module,exports){
module.exports = function first(d){
  return d[0]
}
},{}],7:[function(require,module,exports){
module.exports = function has(o, k) {
  return k in o
}
},{}],8:[function(require,module,exports){
module.exports = is
is.fn     = isFunction
is.str    = isString
is.num    = isNumber
is.obj    = isObject
is.lit    = isLiteral
is.bol    = isBoolean
is.truthy = isTruthy
is.falsy  = isFalsy
is.arr    = isArray
is.null   = isNull
is.def    = isDef
is.in     = isIn

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

function isIn(set) {
  return function(d){
    return !set ? false  
         : set.indexOf ? ~set.indexOf(d)
         : d in set
  }
}
},{}],9:[function(require,module,exports){
module.exports = function keys(o) {
  return Object.keys(o || {})
}
},{}],10:[function(require,module,exports){
module.exports =  function last(d) {
  return d[d.length-1]
}
},{}],11:[function(require,module,exports){
var is = require('utilise/is')
  , to = require('utilise/to')
  , owner = require('utilise/owner')

module.exports = function log(prefix){
  return function(d){
    if (!owner.console || !console.log.apply) return d;
    is.arr(arguments[2]) && (arguments[2] = arguments[2].length)
    var args = to.arr(arguments)
    args.unshift(prefix.grey ? prefix.grey : prefix)
    return console.log.apply(console, args), d
  }
}
},{"utilise/is":8,"utilise/owner":13,"utilise/to":14}],12:[function(require,module,exports){
module.exports = function not(fn){
  return function(){
    return !fn.apply(this, arguments)
  }
}
},{}],13:[function(require,module,exports){
(function (global){
module.exports = require('utilise/client') ? /* istanbul ignore next */ window : global
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"utilise/client":2}],14:[function(require,module,exports){
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
    p[v[by]] = v
    return p
  }
}
},{}]},{},[1]);
