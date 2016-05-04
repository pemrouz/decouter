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
  return !whos(req).email ? '/login' : next({ classes: classes, teachers: teachers, middle: middle }) || '/dashboard/classes/' + today;
};

var teachers = function teachers(_ref4) {
  var next = _ref4.next;
  return next({ ':op': function op(_ref5) {
      var params = _ref5.params;
      return params.op && params.op !== 'add' ? '/dashboard/teachers' : true;
    } });
};

var classes = function classes(_ref6) {
  var next = _ref6.next;
  return next({ ':date': function date(_ref7) {
      var params = _ref7.params;
      return !!params.date || '/dashboard/classes/' + today;
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

_tap2.default.test('pure resolution', function (t) {
  var _require = require('./');

  var router = _require.router;
  var resolve = _require.resolve;

  t.same(resolve(app)({ url: '/foo' }), { url: '/login', params: {} });

  t.same(resolve(app)({ url: '/login' }), { url: '/login', params: {} });

  t.same(resolve(app)({ url: '/login', email: true }), { url: '/dashboard/classes/today', params: { date: 'today' } });

  t.same(resolve(app)({ url: '/dashboard' }), { url: '/login', params: {} });

  t.same(resolve(app)({ url: '/dashboard', email: true }), { url: '/dashboard/classes/today', params: { date: 'today' } });

  t.same(resolve(app)({ url: '/dashboard/baz', email: true }), { url: '/dashboard/classes/today', params: { date: 'today' } });

  t.same(resolve(app)({ url: '/dashboard/classes', email: true }), { url: '/dashboard/classes/today', params: { date: 'today' } });

  t.same(resolve(app)({ url: '/dashboard/classes/tom', email: true }), { url: '/dashboard/classes/tom', params: { date: 'tom' } });

  t.same(resolve(app)({ url: '/dashboard/teachers', email: true }), { url: '/dashboard/teachers', params: { op: undefined } });

  t.same(resolve(app)({ url: '/dashboard/teachers/foo', email: true }), { url: '/dashboard/teachers', params: { op: undefined } });

  t.same(resolve(app)({ url: '/dashboard/teachers/add', email: true }), { url: '/dashboard/teachers/add', params: { op: 'add' } });

  t.same(resolve(app)({ url: '/dashboard/middle/foo/bar/baz', email: true }), { url: '/dashboard/middle/foo/bar/baz', params: { foo: 'foo', baz: 'baz' } });

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
      pass = function pass(req) {
    return req;
  },
      skip = function skip(req) {
    return { url: '/bar' };
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
    return pushed = [state, title, url];
  },
      pushed,
      changed;

  keys(require.cache).map(function (d) {
    return delete require.cache[d];
  });
  require('browserenv');
  global.window = { addEventListener: noop };
  global.location = { pathname: '/foo' };
  global.history = { pushState: pushState };
  keys(require.cache).map(function (d) {
    return delete require.cache[d];
  });

  var _require3 = require('./');

  var router = _require3.router;
  var resolve = _require3.resolve;

  var pass = function pass(req) {
    return req;
  },
      skip = function skip(req) {
    return { url: '/bar' };
  };

  window.on('change', function (d) {
    return changed = true;
  });

  pushed = changed = false;
  t.same(router(pass), { url: '/foo' });
  t.notOk(changed);

  pushed = changed = false;
  t.same(router(skip), { url: '/bar' });
  t.ok(changed);

  t.end();
});

_tap2.default.test('should allow manual navigations', function (t) {
  var pushState = function pushState(state, title, url) {
    return pushed = [state, title, url];
  };
  var pushed, prevented, changed;

  keys(require.cache).map(function (d) {
    return delete require.cache[d];
  });
  require('browserenv');
  global.window.addEventListener = noop;
  global.window.event = { preventDefault: function preventDefault(d) {
      return prevented = true;
    } };
  global.location = {};
  global.history = { pushState: pushState };
  keys(require.cache).map(function (d) {
    return delete require.cache[d];
  });

  var _require4 = require('./');

  var router = _require4.router;
  var resolve = _require4.resolve;

  window.on('change', function (d) {
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
  var listeners = [],
      changed = false;
  var addEventListener = function addEventListener(type, fn) {
    return listeners.push(fn);
  };

  keys(require.cache).map(function (d) {
    return delete require.cache[d];
  });
  require('browserenv');
  global.window = { addEventListener: addEventListener };
  keys(require.cache).map(function (d) {
    return delete require.cache[d];
  });

  var _require5 = require('./');

  var router = _require5.router;
  var resolve = _require5.resolve;

  window.on('change', function (d) {
    return changed = true;
  });
  listeners.map(function (d) {
    return d();
  });
  t.ok(changed);
  t.end();
});

