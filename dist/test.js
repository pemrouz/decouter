'use strict';

var _tap = require('tap');

var _pure = require('utilise/pure');

var _2 = require('./');

(0, _tap.test)('pure resolution', function (_ref) {
  var same = _ref.same;
  var end = _ref.end;

  same((0, _2.resolve)(function (req) {
    return { foo: true };
  })({ url: '/foo' }), { url: '/foo', params: {} }, 'top-level fn');

  same((0, _2.resolve)(true)({ url: '/always-true' }), { url: '/always-true', params: {} }, 'always true');

  same((0, _2.resolve)({ foo: true })({ url: '/foo' }), { url: '/foo', params: {} }, 'fixed path');

  same((0, _2.resolve)({ foo: true })({ url: '/not-foo' }), false, 'fixed path unmatched');

  same((0, _2.resolve)({ ':foo': true })({ url: '/var-foo' }), { url: '/var-foo', params: { foo: 'var-foo' } }, 'variable path - always true');

  same((0, _2.resolve)({ foo: { bar: true } })({ url: '/foo/bar' }), { url: '/foo/bar', params: {} }, 'two-level - always true');

  same((0, _2.resolve)({ foo: { bar: '/baz/boo' }, baz: { boo: true } })({ url: '/foo/bar' }), { url: '/baz/boo', params: {} }, 'two-level - redirect');

  same((0, _2.resolve)({ foo: { ':bar': true } })({ url: '/foo/bar' }), { url: '/foo/bar', params: { bar: 'bar' } }, 'two-level - variable');

  same((0, _2.resolve)({ ':soc': function soc(_soc) {
      return { ':eve': function eve(_eve) {
          return true;
        } };
    } })({ url: '/soc/eve' }), { url: '/soc/eve', params: { soc: 'soc', eve: 'eve' } }, 'two-level variables');

  same((0, _2.resolve)({ foo: { ':bar': { baz: true } } })({ url: '/foo/bar/baz' }), { url: '/foo/bar/baz', params: { bar: 'bar' } }, 'three-level - intermediate variable');

  same((0, _2.resolve)({ foo: { ':bar': false, ':baz': true } })({ url: '/foo/boo' }), { url: '/foo/boo', params: { baz: 'boo' } }, 'multi-variable');

  same((0, _2.resolve)({ ':': '/login', 'login': true })({ url: '/default' }), { url: '/login', params: {} }, 'default - string');

  same((0, _2.resolve)({ ':': function _(d) {
      return '/login';
    }, 'login': true })({ url: '/default' }), { url: '/login', params: {} }, 'default - string - fn');

  same((0, _2.resolve)({ ':': true })({ url: '/default' }), { url: '/default', params: {} }, 'default - true');

  same((0, _2.resolve)({ ':': function _(d) {
      return true;
    } })({ url: '/default' }), { url: '/default', params: {} }, 'default - true - fn');

  same((0, _2.resolve)({ foo: '..', ':': true })({ url: '/foo' }), { url: '/', params: {} }, 'relative redirect ..');

  same((0, _2.resolve)({ foo: '../', ':': true })({ url: '/foo' }), { url: '/', params: {} }, 'relative redirect ../');

  same((0, _2.resolve)({
    ':one': function one(_one) {
      same(_one, 'one', 'one');
      return {
        ':two': function two(_two) {
          same(_two, 'two', 'two');
          return true;
        }
      };
    }
  })({ url: '/one/two' }), { url: '/one/two', params: { one: 'one', two: 'two' } }, 'two-level inner variables');

  same((0, _2.resolve)({
    ':one': function one(_one2) {
      return {
        ':two': function two(_two2) {
          return '..';
        },
        ':': true
      };
    }
  })({ url: '/one/two' }), { url: '/one', params: { one: 'one' } }, 'two-level relative redirect');

  same((0, _2.resolve)({
    ':one': function one(_one3) {
      return {
        ':two': function two(_two3) {
          return '..';
        },
        ':': true
      };
    }
  })({ url: '/one/two' }), { url: '/one', params: { one: 'one' } }, 'two-level relative redirect');

  same((0, _2.resolve)({ foo: { ':bar': function bar(_bar) {
        return _bar == 'bar' ? true : '/foo';
      }, ':': true } })({ url: '/foo/bar' }), { url: '/foo/bar', params: { bar: 'bar' } }, 'default with variable');

  same((0, _2.resolve)({ foo: { ':bar': function bar(_bar2) {
        return _bar2 == 'bar' ? true : '/foo';
      }, ':': true } })({ url: '/foo/baz' }), { url: '/foo', params: {} }, 'default with variable - fallback');

  same((0, _2.resolve)({ foo: { ':bar': function bar(_bar3) {
        return _bar3 ? true : '/foo/bar';
      } } })({ url: '/foo' }), { url: '/foo/bar', params: { bar: 'bar' } }, 'no default variable');

  end();
});

(0, _tap.test)('side effects - server', function (_ref2) {
  var ok = _ref2.ok;
  var notOk = _ref2.notOk;
  var same = _ref2.same;
  var end = _ref2.end;

  var redirect = function redirect(d) {
    return redirected = d;
  },
      next = function next(d) {
    return passed = true;
  },
      skip = { 'bar': true, ':': '/bar' },
      redirected = false,
      passed = false,
      url = '/foo';

  (0, _2.router)(true)({ url: url }, { redirect: redirect }, next);
  ok(passed, 'match passed');
  notOk(redirected, 'match not redirected');

  passed = redirected = false;
  (0, _2.router)(skip)({ url: url }, { redirect: redirect }, next);
  notOk(passed, 'redirect not passed');
  same(redirected, '/bar', 'redirect');

  end();
});

(0, _tap.test)('client', function (_ref3) {
  var test = _ref3.test;
  var beforeEach = _ref3.beforeEach;
  var end = _ref3.end;

  var pushState = function pushState(state, title, url) {
    return pushed = [state, title, url], location.pathname = url;
  },
      pushed = undefined,
      changed = undefined,
      prevented = undefined;

  delete global.window;
  delete global.document;
  (0, _pure.keys)(require.cache).map(function (d) {
    return delete require.cache[d];
  });
  require('browserenv');
  global.window.event = { preventDefault: function preventDefault(d) {
      return prevented = true;
    } };
  window.addEventListener('change', function (e) {
    return changed = true;
  });
  global.CustomEvent = global.window.CustomEvent;
  global.location = { pathname: '/foo' };
  global.history = { pushState: pushState };
  (0, _pure.keys)(require.cache).map(function (d) {
    return delete require.cache[d];
  });

  var _require = require('./');

  var router = _require.router;
  var resolve = _require.resolve;

  var go = window.go;

  test('side effects', function (_ref4) {
    var ok = _ref4.ok;
    var notOk = _ref4.notOk;
    var same = _ref4.same;
    var end = _ref4.end;

    console.log("1", 1);
    var pass = function pass(d) {
      return true;
    },
        skip = function skip(d) {
      return { bar: true, ':': '/bar' };
    },
        args = function args(d) {
      return { foo: { ':bar': true }, ':': '/foo/baz' };
    };

    pushed = changed = false;
    same(router(pass), { url: '/foo', params: {} });
    same(location, { pathname: '/foo', params: {} });
    notOk(changed);

    pushed = changed = false;
    same(router(skip), { url: '/bar', params: {} });
    same(location, { pathname: '/bar', params: {} });
    ok(changed);

    pushed = changed = false;
    same(router(args), { url: '/foo/baz', params: { bar: 'baz' } });
    same(location, { pathname: '/foo/baz', params: { bar: 'baz' } });
    ok(changed);

    end();
  });

  test('should allow manual navigations', function (_ref5) {
    var same = _ref5.same;
    var ok = _ref5.ok;
    var end = _ref5.end;

    global.location = {};
    pushed = prevented = changed = false;

    same(go('/path'), '/path', 'go return value');
    same(pushed, [{}, '', '/path'], 'go pushState');
    ok(prevented, 'go preventDefault');
    ok(changed, 'go window change');
    end();
  });

  test('should trigger change on popstate', function (_ref6) {
    var ok = _ref6.ok;
    var end = _ref6.end;

    pushed = prevented = changed = false;
    window.dispatchEvent(new CustomEvent('popstate'));
    ok(changed, 'popstate change');
    end();
  });

  end();
});