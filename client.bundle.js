var decouter = (function (exports) {
'use strict';

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};





function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var client = typeof window != 'undefined';

var is_1 = is;
is.fn      = isFunction;
is.str     = isString;
is.num     = isNumber;
is.obj     = isObject;
is.lit     = isLiteral;
is.bol     = isBoolean;
is.truthy  = isTruthy;
is.falsy   = isFalsy;
is.arr     = isArray;
is.null    = isNull;
is.def     = isDef;
is.in      = isIn;
is.promise = isPromise;
is.stream  = isStream;

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

function isStream(d) {
  return !!(d && d.next)
}

function isIn(set) {
  return function(d){
    return !set ? false  
         : set.indexOf ? ~set.indexOf(d)
         : d in set
  }
}

var keys = function keys(o) { 
  return Object.keys(is_1.obj(o) || is_1.fn(o) ? o : {})
};

var to = { 
  arr: toArray
, obj: toObject
};

function toArray(d){
  return Array.prototype.slice.call(d, 0)
}

function toObject(d) {
  var by = 'id';

  return arguments.length == 1 
    ? (by = d, reduce)
    : reduce.apply(this, arguments)

  function reduce(p,v,i){
    if (i === 0) { p = {}; }
    p[is_1.fn(by) ? by(v, i) : v[by]] = v;
    return p
  }
}

var owner = client ? /* istanbul ignore next */ window : commonjsGlobal;

var log = function log(ns){
  return function(d){
    if (!owner.console || !console.log.apply) { return d; }
    is_1.arr(arguments[2]) && (arguments[2] = arguments[2].length);
    var args = to.arr(arguments)
      , prefix = '[log][' + (new Date()).toISOString() + ']' + ns;

    args.unshift(prefix.grey ? prefix.grey : prefix);
    return console.log.apply(console, args), d
  }
};

var decouter = createCommonjsModule(function (module) {
var log$$1 = log('[router]')
    , go  = function (url) {
        if (window.event) { window.event.preventDefault(); }
        history.pushState({}, '', url);
        window.dispatchEvent(new CustomEvent('change'));
        return url
      };

var router = function (routes) {
  return !client ? route : route({ url: location.pathname }) 

  function route(req, res, next) { 
    var from = req.url
        , resolved = resolve(routes)(req)
        , finish = function (ref) {
            var url = ref.url;
            var params = ref.params;

            if (from !== url) { log$$1('router redirecting', from, url); }
            if (client) { location.params = params; }

            return client && from !== url ? (go(url), { url: url, params: params })
                : !client && from !== url ? res.redirect(url)
                : !client                 ? next()
                : { url: url, params: params }
        };
        
    return is_1.promise(resolved) ? resolved.then(finish) : finish(resolved)
  } 
};

var resolve = function (routes) { return function (req, url) {
  if ( url === void 0 ) url = req.url;

  var params = {}
      , to = next(req, params, url, routes)
      , finish = function (to) { return to == '../' || to == '..' ? resolve(routes)(req, '/' + url.split('/').filter(Boolean).slice(0, -1).join('/'))
         : !to ? false
         : to !== true ? resolve(routes)(req, to)
         : { url: url, params: params }; };

  return is_1.promise(to) ? to.then(finish) : finish(to)
}; };

var next = function (req, params, url, value, variable) {
  if ( params === void 0 ) params = {};

  var ref = segment(url);
  var cur = ref.cur;
  var remainder = ref.remainder;

  return is_1.promise(value) ? value.then(function (v) { return next(req, params, url, v, variable); })
       : is_1.str(value) || is_1.bol(value) ? value
       : is_1.fn(value) && !is_1.def(variable) ? next(req, params, url, value(req))
       : is_1.fn(value) ? next(req, params, url, value(variable, req))
       : cur in value ? next(req, params, remainder, value[cur])
       : !cur && value[':'] ? next(req, params, remainder, value[':'])
       : variables(
           params
         , function (route) { return next(req, params, remainder, value[route.key], cur || false); }
         , function (route, result) { return result === true && route.name && (params[route.name] = cur); }
         , keys(value)
             .filter(function (ref) {
               var f = ref[0];

               return f == ':';
  })
             .map(function (k) { return ({ key: k, name: k.slice(1) }); })
         )
};

var variables = function (params, match, success, routes, route) {
    if ( route === void 0 ) route = routes.shift();

    return !route ? false : Promise.resolve(match(route))
    .then(function (result) { return result 
       ? (success(route, result), result)
       : variables(params, match, success, routes); }
    );
};

function segment(url) {
  var segments = url.split('/').filter(Boolean);
  return { cur: segments.shift(), remainder: '/' + segments.join('/') }
}

if (client) {
  window.go = go;
  window.router = router;
  window.router.resolve = resolve;
  window.addEventListener('popstate', function (e) { return window.dispatchEvent(new CustomEvent('change')); });
  window.addEventListener('change', function (e) { 
    e.target == window && window.app && app.render();
  });
  document.addEventListener('click', function (e) {
    var a = e.path ? e.path.shift() : e.target;
    if (!a.matches('a[href]:not([href^=javascript]):not([bypass])') || a.matches('[bypass] *')) { return }
    if (is_1.def(a.origin) && a.origin != location.origin) { return }
    e.preventDefault();
    go(a.href);
  });
}

module.exports = { router: router, resolve: resolve };
});

var decouter_1 = decouter.router;
var decouter_2 = decouter.resolve;

exports['default'] = decouter;
exports.router = decouter_1;
exports.resolve = decouter_2;

return exports;

}({}));
