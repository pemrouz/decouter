'use strict';

require('utilise');

var _rijs = require('rijs.core');

var _rijs2 = _interopRequireDefault(_rijs);

var _rijs3 = require('rijs.data');

var _rijs4 = _interopRequireDefault(_rijs3);

var _tap = require('tap');

var _tap2 = _interopRequireDefault(_tap);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var today = 'today';

var whos = function whos(req) {
  return req;
};

var app = function app(_ref) {
  var next = _ref.next;
  return next({ dashboard: dashboard, login: login }) || '/login';
};

var login = function login(_ref2) {
  var req = _ref2.req;
  return whos(req).email ? '/dashboard' : true;
};

var dashboard = function dashboard(_ref3) {
  var req = _ref3.req;
  var next = _ref3.next;
  return !whos(req).email ? '/login' : next({ classes: classes, teachers: teachers, middle: middle, ':society': society }) || '/dashboard/classes/' + today;
};

var teachers = function teachers(_ref4) {
  var next = _ref4.next;
  return next({ ':op': function op(_ref5) {
      var current = _ref5.current;
      return current && current !== 'add' ? '/dashboard/teachers' : true;
    } });
};

var classes = function classes(_ref6) {
  var next = _ref6.next;
  return next({ ':date': function date(_ref7) {
      var current = _ref7.current;
      return !!current || '/dashboard/classes/' + today;
    } });
};

var middle = function middle(_ref8) {
  var next = _ref8.next;
  return next({ ':foo': foo });
};
var foo = function foo(_ref9) {
  var next = _ref9.next;
  return next({ 'bar': bar });
};
var bar = function bar(_ref10) {
  var next = _ref10.next;
  return next({ ':baz': baz });
};
var baz = function baz(_ref11) {
  var next = _ref11.next;
  return true;
};

var society = function society(_ref12) {
  var current = _ref12.current;
  var next = _ref12.next;
  return next({ ':event': event }) || is.str(current);
};

var event = function event(_ref13) {
  var current = _ref13.current;
  return current > 0;
};

_tap2.default.test('pure resolution', function (t) {
  var _require = require('./');

  var router = _require.router;
  var resolve = _require.resolve;

  t.same(resolve(app)({ url: '/foo' }), { url: '/login', params: {} });

  t.same(resolve(app)({ url: '/login' }), { url: '/login', params: {} });

  t.same(resolve(app)({ url: '/login', email: true }), { url: '/dashboard/classes/today', params: { date: 'today' } });

  t.same(resolve(app)({ url: '/dashboard' }), { url: '/login', params: {} });

  t.same(resolve(app)({ url: '/dashboard', email: true }), { url: '/dashboard/classes/today', params: { date: 'today' } });

  // t.same(resolve(app)(
  //   { url: '/dashboard/baz', email: true }),
  //   { url: '/dashboard/classes/today', params: { date: 'today' } }
  // )

  t.same(resolve(app)({ url: '/dashboard/classes', email: true }), { url: '/dashboard/classes/today', params: { date: 'today' } });

  t.same(resolve(app)({ url: '/dashboard/classes/tom', email: true }), { url: '/dashboard/classes/tom', params: { date: 'tom' } });

  t.same(resolve(app)({ url: '/dashboard/teachers', email: true }), { url: '/dashboard/teachers', params: { op: undefined } });

  t.same(resolve(app)({ url: '/dashboard/teachers/foo', email: true }), { url: '/dashboard/teachers', params: { op: undefined } });

  t.same(resolve(app)({ url: '/dashboard/teachers/add', email: true }), { url: '/dashboard/teachers/add', params: { op: 'add' } });

  t.same(resolve(app)({ url: '/dashboard/middle/foo/bar/baz', email: true }), { url: '/dashboard/middle/foo/bar/baz', params: { foo: 'foo', baz: 'baz' } });

  t.same(resolve(app)({ url: '/dashboard/middle/foo/bar/baz', email: true }), { url: '/dashboard/middle/foo/bar/baz', params: { foo: 'foo', baz: 'baz' } });

  t.same(resolve(app)({ url: '/dashboard/imperial', email: true }), { url: '/dashboard/imperial', params: { society: 'imperial' } });

  t.same(resolve(app)({ url: '/dashboard/imperial/50', email: true }), { url: '/dashboard/imperial/50', params: { society: 'imperial', event: '50' } });

  time(100, t.end);
});

_tap2.default.test('side effects - server', function (t) {
  var _require2 = require('./');

  var router = _require2.router;
  var resolve = _require2.resolve;

  var redirect = function redirect(d) {
    return redirected = d;
  },
      next = function next(d) {
    return passed = true;
  },
      pass = function pass(_ref14) {
    var url = _ref14.url;
    return true;
  },
      skip = function skip(_ref15) {
    var url = _ref15.url;
    return url == '/bar' || '/bar';
  },
      redirected = false,
      passed = false,
      url = '/foo';

  router(pass)({ url: url }, { redirect: redirect }, next);
  t.ok(passed);
  t.notOk(redirected);

  passed = redirected = false;
  router(skip)({ url: url }, { redirect: redirect }, next);
  t.notOk(passed);
  t.same(redirected, '/bar');

  t.end();
});

_tap2.default.test('side effects - client', function (t) {
  var pushState = function pushState(state, title, url) {
    return pushed = [state, title, url], location.pathname = url;
  },
      pushed,
      changed;

  delete global.window;
  delete global.document;
  keys(require.cache).map(function (d) {
    return delete require.cache[d];
  });
  require('browserenv');
  global.CustomEvent = global.window.CustomEvent;
  global.location = { pathname: '/foo' };
  global.history = { pushState: pushState };
  keys(require.cache).map(function (d) {
    return delete require.cache[d];
  });

  var _require3 = require('./');

  var router = _require3.router;
  var resolve = _require3.resolve;

  var pass = function pass(_ref16) {
    var url = _ref16.url;
    return true;
  },
      skip = function skip(_ref17) {
    var url = _ref17.url;
    return url == '/bar' || '/bar';
  },
      args = function args(_ref18) {
    var next = _ref18.next;
    return next({ foo: function foo(_ref19) {
        var next = _ref19.next;
        return next({ ':bar': function bar(d) {
            return true;
          } });
      } }) || '/foo/baz';
  };

  window.addEventListener('change', function (e) {
    return changed = true;
  });

  pushed = changed = false;
  t.same(router(pass), { url: '/foo', params: {} });
  t.same(location, { pathname: '/foo', params: {} });
  t.notOk(changed);

  pushed = changed = false;
  t.same(router(skip), { url: '/bar', params: {} });
  t.same(location, { pathname: '/bar', params: {} });
  t.ok(changed);

  pushed = changed = false;
  t.same(router(args), { url: '/foo/baz', params: { bar: 'baz' } });
  t.same(location, { pathname: '/foo/baz', params: { bar: 'baz' } });
  t.ok(changed);

  t.end();
});

_tap2.default.test('should allow manual navigations', function (t) {
  var pushState = function pushState(state, title, url) {
    return pushed = [state, title, url];
  };
  var pushed, prevented, changed;

  delete global.window;
  delete global.document;
  keys(require.cache).map(function (d) {
    return delete require.cache[d];
  });
  require('browserenv');
  global.window.event = { preventDefault: function preventDefault(d) {
      return prevented = true;
    } };
  global.CustomEvent = global.window.CustomEvent;
  global.location = {};
  global.history = { pushState: pushState };
  keys(require.cache).map(function (d) {
    return delete require.cache[d];
  });

  var _require4 = require('./');

  var router = _require4.router;
  var resolve = _require4.resolve;

  window.addEventListener('change', function (e) {
    return changed = true;
  });
  var go = window.go;

  t.same(go('/path'), '/path');
  t.same(pushed, [{}, '', '/path']);
  t.ok(prevented);
  t.ok(changed);
  t.end();
});

_tap2.default.test('should trigger change on popstate', function (t) {
  var changed = false;

  delete global.window;
  delete global.document;
  keys(require.cache).map(function (d) {
    return delete require.cache[d];
  });
  require('browserenv');
  global.CustomEvent = global.window.CustomEvent;
  keys(require.cache).map(function (d) {
    return delete require.cache[d];
  });

  var _require5 = require('./');

  var router = _require5.router;
  var resolve = _require5.resolve;

  window.addEventListener('change', function (e) {
    return changed = true;
  });
  window.dispatchEvent(new CustomEvent('popstate'));

  t.ok(changed);
  t.end();
});