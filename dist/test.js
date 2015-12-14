'use strict';

var _noop = require('utilise/noop');

var _noop2 = _interopRequireDefault(_noop);

var _mockery = require('mockery');

var _mockery2 = _interopRequireDefault(_mockery);

var _chai = require('chai');

/* istanbul ignore next */
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('router', function () {

    beforeEach(function () {
        _mockery2.default.disable();
        _mockery2.default.enable({ useCleanCache: true });
        _mockery2.default.warnOnUnregistered(false);
    });

    it('should work with simple route - server', function (done) {
        var _require = require('..');

        var router = _require.default;
        var routes = ['/pathA'];
        var req = { url: '/pathA' };
        var res = { redirect: _noop2.default };
        var next = done;

        router(routes)(req, res, next);
    });

    it('should deal with redirects - server', function () {
        var _require2 = require('..');

        var router = _require2.default;
        var routes = ['/pathA'];
        var redirects = routes.redirects = function (req) {
            return '/pathA';
        };
        var res = { redirect: function redirect(d) {
                return redirected = true;
            } };
        var next = function next(d) {
            return continued = true;
        };

        var redirected, continued;

        redirected = continued = false;
        router(routes)({ url: '/pathA' }, res, next);
        (0, _chai.expect)(continued).to.be.ok;
        (0, _chai.expect)(redirected).to.be.not.ok;

        redirected = continued = false;
        router(routes)({ url: '/pathB' }, res, next);
        (0, _chai.expect)(continued).to.be.not.ok;
        (0, _chai.expect)(redirected).to.be.ok;
    });

    it('should deal with params - server', function () {
        var _require3 = require('..');

        var router = _require3.default;
        var routes = ['/path/:param', '/opt/:p1?/:p2?'];
        var redirects = routes.redirects = function (req) {
            var _req;

            return _req = req, params = _req.params, url = _req.url, _req;
        };
        var res = { redirect: _noop2.default };
        var next = _noop2.default;

        var params, url;

        // required param
        router(routes)({ url: '/path/foo' }, res, next);
        (0, _chai.expect)(params).to.be.eql({ param: 'foo' });

        router(routes)({ url: '/path/bar' }, res, next);
        (0, _chai.expect)(params).to.be.eql({ param: 'bar' });

        router(routes)({ url: '/path/foo/bar' }, res, next);
        (0, _chai.expect)(params).to.be.eql({ param: 'foo' });

        router(routes)({ url: '/path' }, res, next);
        (0, _chai.expect)(params).to.be.eql(false);

        // optional param
        router(routes)({ url: '/opt' }, res, next);
        (0, _chai.expect)(params).to.be.eql({ p1: undefined, p2: undefined });

        router(routes)({ url: '/opt/1' }, res, next);
        (0, _chai.expect)(params).to.be.eql({ p1: '1', p2: undefined });

        router(routes)({ url: '/opt/1/2' }, res, next);
        (0, _chai.expect)(params).to.be.eql({ p1: '1', p2: '2' });
    });

    it('should work with simple route - client', function () {
        global.window = { addEventListener: _noop2.default };
        global.location = {};
        _mockery2.default.registerMock('utilise/client', true);
        require('..');

        var router = window.router,
            routes = ['/pathA'];

        var params, url;

        location.pathname = '/pathA';
        var _router = router(routes);

        params = _router.params;
        url = _router.url;

        (0, _chai.expect)(url).to.be.eql('/pathA');
        (0, _chai.expect)(params).to.be.eql({});

        location.pathname = '/pathB';
        var _router2 = router(routes);

        params = _router2.params;
        url = _router2.url;

        (0, _chai.expect)(url).to.be.eql('/pathB');
        (0, _chai.expect)(params).to.be.eql(false);
    });

    it('should work with simple route - client', function () {
        global.window = { addEventListener: _noop2.default };
        global.location = {};
        _mockery2.default.registerMock('utilise/client', true);
        require('..');

        var router = window.router,
            routes = ['/path/:param', '/opt/:p1?/:p2?'];

        var params, url;

        // required param
        location.pathname = '/path/foo';
        var _router3 = router(routes);

        params = _router3.params;
        url = _router3.url;

        (0, _chai.expect)(url).to.be.eql('/path/foo');
        (0, _chai.expect)(params).to.be.eql({ param: 'foo' });

        location.pathname = '/path/bar';
        var _router4 = router(routes);

        params = _router4.params;
        url = _router4.url;

        (0, _chai.expect)(url).to.be.eql('/path/bar');
        (0, _chai.expect)(params).to.be.eql({ param: 'bar' });

        location.pathname = '/path/foo/bar';
        var _router5 = router(routes);

        params = _router5.params;
        url = _router5.url;

        (0, _chai.expect)(url).to.be.eql('/path/foo/bar');
        (0, _chai.expect)(params).to.be.eql({ param: 'foo' });

        location.pathname = '/path';
        var _router6 = router(routes);

        params = _router6.params;
        url = _router6.url;

        (0, _chai.expect)(url).to.be.eql('/path');
        (0, _chai.expect)(params).to.be.eql(false);

        // optional param
        location.pathname = '/opt';
        var _router7 = router(routes);

        params = _router7.params;
        url = _router7.url;

        (0, _chai.expect)(url).to.be.eql('/opt');
        (0, _chai.expect)(params).to.be.eql({ p1: undefined, p2: undefined });

        location.pathname = '/opt/1';
        var _router8 = router(routes);

        params = _router8.params;
        url = _router8.url;

        (0, _chai.expect)(url).to.be.eql('/opt/1');
        (0, _chai.expect)(params).to.be.eql({ p1: '1', p2: undefined });

        location.pathname = '/opt/1/2';
        var _router9 = router(routes);

        params = _router9.params;
        url = _router9.url;

        (0, _chai.expect)(url).to.be.eql('/opt/1/2');
        (0, _chai.expect)(params).to.be.eql({ p1: '1', p2: '2' });
    });

    it('should allow manual navigations - client', function () {
        var pushState = function pushState(state, title, url) {
            return pushed = [state, title, url];
        };
        var pushed, prevented, changed;

        global.window = { addEventListener: _noop2.default };
        global.location = {};
        global.history = { pushState: pushState };
        global.d3 = { event: { preventDefault: function preventDefault(d) {
                    return prevented = true;
                } } };
        _mockery2.default.registerMock('utilise/client', true);
        require('..');

        window.on('change', function (d) {
            return changed = true;
        });
        var go = window.go;

        (0, _chai.expect)(go('/path')).to.be.eql('/path');
        (0, _chai.expect)(pushed).to.eql([{}, '', '/path']);
        (0, _chai.expect)(prevented).to.be.ok;
        (0, _chai.expect)(changed).to.be.ok;
    });

    it('should trigger change on popstate - client', function () {
        var listeners = [],
            changed = false;
        var addEventListener = function addEventListener(type, fn) {
            return listeners.push(fn);
        };
        global.window = { addEventListener: addEventListener };
        _mockery2.default.registerMock('utilise/client', true);
        require('..');

        window.on('change', function (d) {
            return changed = true;
        });
        listeners.map(function (d) {
            return d();
        });
        (0, _chai.expect)(changed).to.be.ok;
    });

    it('should deal with redirects - client', function () {
        var params, url, changed;

        global.window = { addEventListener: _noop2.default };
        global.location = {};
        _mockery2.default.registerMock('utilise/client', true);
        require('..');

        window.on('change', function (d) {
            return changed = true;
        });

        var router = window.router,
            routes = ['/pathA'],
            redirects = routes.redirects = function (req) {
            return '/pathA';
        };

        changed = false;
        location.pathname = '/pathA';
        var _router10 = router(routes);

        params = _router10.params;
        url = _router10.url;

        (0, _chai.expect)(changed).to.be.not.ok;
        (0, _chai.expect)(url).to.be.eql('/pathA');
        (0, _chai.expect)(params).to.be.eql({});

        changed = false;
        location.pathname = '/pathB';
        var _router11 = router(routes);

        params = _router11.params;
        url = _router11.url;

        (0, _chai.expect)(changed).to.be.ok;
        (0, _chai.expect)(url).to.be.eql('/pathA');
        (0, _chai.expect)(params).to.be.eql({});
    });
});

