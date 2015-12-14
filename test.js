import noop from 'utilise/noop'
import mockery from 'mockery'
import { expect } from 'chai'
  
describe('router', () => {
  
  beforeEach(() => {
    mockery.disable()
    mockery.enable({ useCleanCache: true })
    mockery.warnOnUnregistered(false)
  })

  it('should work with simple route - server', done => {
    const { default: router } = require('..')
        , routes = [ '/pathA' ]
        , req = { url: '/pathA' }
        , res = { redirect: noop }
        , next = done

    router(routes)(req, res, next)
  })

  it('should deal with redirects - server', () => {
    const { default: router } = require('..')
        , routes = [ '/pathA' ]
        , redirects = routes.redirects = req => '/pathA'
        , res = { redirect: d => redirected = true }
        , next = d => continued = true

    var redirected, continued

    redirected = continued = false
    router(routes)({ url: '/pathA' }, res, next)
    expect(continued).to.be.ok
    expect(redirected).to.be.not.ok

    redirected = continued = false
    router(routes)({ url: '/pathB' }, res, next)
    expect(continued).to.be.not.ok
    expect(redirected).to.be.ok
  })

  it('should deal with params - server', () => {
    const { default: router } = require('..')
        , routes = [ '/path/:param', '/opt/:p1?/:p2?' ]
        , redirects = routes.redirects = req => ({ params, url } = req)
        , res = { redirect: noop }
        , next = noop

    var params, url

    // required param
    router(routes)({ url: '/path/foo' }, res, next)
    expect(params).to.be.eql({ param: 'foo' })

    router(routes)({ url: '/path/bar' }, res, next)
    expect(params).to.be.eql({ param: 'bar' })

    router(routes)({ url: '/path/foo/bar' }, res, next)
    expect(params).to.be.eql({ param: 'foo' })

    router(routes)({ url: '/path' }, res, next)
    expect(params).to.be.eql(false)

    // optional param
    router(routes)({ url: '/opt' }, res, next)
    expect(params).to.be.eql({ p1: undefined, p2: undefined })

    router(routes)({ url: '/opt/1' }, res, next)
    expect(params).to.be.eql({ p1: '1', p2: undefined })

    router(routes)({ url: '/opt/1/2' }, res, next)
    expect(params).to.be.eql({ p1: '1', p2: '2' })
  })


  it('should work with simple route - client', () => {
    global.window = { addEventListener: noop }
    global.location = { }
    mockery.registerMock('utilise/client', true)
    require('..')

    const router = window.router
        , routes = [ '/pathA' ]

    var params, url

    location.pathname = '/pathA'
    ;({ params, url } = router(routes))
    expect(url).to.be.eql('/pathA')
    expect(params).to.be.eql({})

    location.pathname = '/pathB'
    ;({ params, url } = router(routes))
    expect(url).to.be.eql('/pathB')
    expect(params).to.be.eql(false)
  })

  it('should work with simple route - client', () => {
    global.window = { addEventListener: noop }
    global.location = { }
    mockery.registerMock('utilise/client', true)
    require('..')

    const router = window.router
        , routes = [ '/path/:param', '/opt/:p1?/:p2?' ]

    var params, url

    // required param
    location.pathname = '/path/foo'
    ;({ params, url } = router(routes))
    expect(url).to.be.eql('/path/foo')
    expect(params).to.be.eql({ param: 'foo' })

    location.pathname = '/path/bar'
    ;({ params, url } = router(routes))
    expect(url).to.be.eql('/path/bar')
    expect(params).to.be.eql({ param: 'bar' })

    location.pathname = '/path/foo/bar'
    ;({ params, url } = router(routes))
    expect(url).to.be.eql('/path/foo/bar')
    expect(params).to.be.eql({ param: 'foo' })

    location.pathname = '/path'
    ;({ params, url } = router(routes))
    expect(url).to.be.eql('/path')
    expect(params).to.be.eql(false)

    // optional param
    location.pathname = '/opt'
    ;({ params, url } = router(routes))
    expect(url).to.be.eql('/opt')
    expect(params).to.be.eql({ p1: undefined, p2: undefined })

    location.pathname = '/opt/1'
    ;({ params, url } = router(routes))
    expect(url).to.be.eql('/opt/1')
    expect(params).to.be.eql({ p1: '1', p2: undefined })

    location.pathname = '/opt/1/2'
    ;({ params, url } = router(routes))
    expect(url).to.be.eql('/opt/1/2')
    expect(params).to.be.eql({ p1: '1', p2: '2' })

  })

  it('should allow manual navigations - client', () => {
    const pushState = (state, title, url) => pushed = [state, title, url]
    var pushed, prevented, changed

    global.window = { addEventListener: noop }
    global.location = { }
    global.history = { pushState }
    global.d3 = { event: { preventDefault: d => prevented = true } }
    mockery.registerMock('utilise/client', true)
    require('..')

    window.on('change', d => changed = true)
    const go = window.go

    expect(go('/path')).to.be.eql('/path')
    expect(pushed).to.eql([{}, '', '/path'])
    expect(prevented).to.be.ok
    expect(changed).to.be.ok
  })

  it('should trigger change on popstate - client', () => {
    var listeners = [], changed = false
    const addEventListener = (type, fn) => listeners.push(fn)
    global.window = { addEventListener }
    mockery.registerMock('utilise/client', true)
    require('..')

    window.on('change', d => changed = true)
    listeners.map(d => d())
    expect(changed).to.be.ok
  })

  it('should deal with redirects - client', () => {
    var params, url, changed
    
    global.window = { addEventListener: noop }
    global.location = { }
    mockery.registerMock('utilise/client', true)
    require('..')

    window.on('change', d => changed = true)

    const router = window.router
        , routes = [ '/pathA' ]
        , redirects = routes.redirects = req => '/pathA'

    changed = false
    location.pathname = '/pathA'
    ;({ params, url } = router(routes))
    expect(changed).to.be.not.ok
    expect(url).to.be.eql('/pathA')
    expect(params).to.be.eql({ })

    changed = false
    location.pathname = '/pathB'
    ;({ params, url } = router(routes))
    expect(changed).to.be.ok
    expect(url).to.be.eql('/pathA')
    expect(params).to.be.eql({ })

  })
  
})