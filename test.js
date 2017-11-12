const { test } = require('tap')
    , { keys } = require('utilise/pure')
    , { resolve, router } = require('./')

test('pure resolution', async ({ same, end }) => {

  same(await resolve(req => ({ foo: true }))(
    { url: '/foo' })
  , { url: '/foo', params: {} }
  , 'top-level fn'
  )

  same(await resolve(async req => ({ foo: true }))(
    { url: '/foo' })
  , { url: '/foo', params: {} }
  , 'top-level fn'
  )

  same(await resolve(true)(
    { url: '/always-true' }), 
    { url: '/always-true', params: {} }
  , 'always true'
  )

  same(await resolve({ foo: true })(
    { url: '/foo' })
  , { url: '/foo', params: {} }
  , 'fixed path'
  )

  same(await resolve({ foo: true })(
    { url: '/not-foo' })
  , false
  , 'fixed path unmatched'
  )

  same(await resolve(async => ({ ':foo': true }))(
    { url: '/var-foo' })
  , { url: '/var-foo', params: { foo: 'var-foo' } }
  , 'variable path - always true - promise'
  )

  same(await resolve({ ':foo': true })(
    { url: '/var-foo' })
  , { url: '/var-foo', params: { foo: 'var-foo' } }
  , 'variable path - always true'
  )

  same(await resolve({ foo: { bar: true } })(
    { url: '/foo/bar' })
  , { url: '/foo/bar', params: {} }
  , 'two-level - always true'
  )

  same(await resolve({ foo: { bar: '/baz/boo' }, baz: { boo: true } })(
    { url: '/foo/bar' })
  , { url: '/baz/boo', params: {} }
  , 'two-level - redirect'
  )

  same(await resolve({ foo: { ':bar': true } })(
    { url: '/foo/bar' })
  , { url: '/foo/bar', params: { bar: 'bar' } }
  , 'two-level - variable'
  )

  same(await resolve({ ':soc': soc => ({ ':eve': eve => true }) })(
    { url: '/soc/eve' })
  , { url: '/soc/eve', params: { soc: 'soc', eve: 'eve' } }
  , 'two-level variables'
  )

  same(await resolve({ foo: { ':bar': { baz: true } } })(
    { url: '/foo/bar/baz' })
  , { url: '/foo/bar/baz', params: { bar: 'bar' } }
  , 'three-level - intermediate variable'
  )

  same(await resolve({ foo: { ':bar': false, ':baz': true } })(
    { url: '/foo/boo' })
  , { url: '/foo/boo', params: { baz: 'boo' } }
  , 'multi-variable'
  )

  same(await resolve({ ':': '/login', 'login': true })(
    { url: '/default' })
  , { url: '/login', params: {} }
  , 'default - string'
  )

  same(await resolve({ ':': d => '/login', 'login': true })(
    { url: '/default' })
  , { url: '/login', params: {} }
  , 'default - string - fn'
  )

  same(await resolve({ ':': true })(
    { url: '/default' })
  , { url: '/default', params: {} }
  , 'default - true'
  )

  same(await resolve({ ':': d => true })(
    { url: '/default' })
  , { url: '/default', params: {} }
  , 'default - true - fn'
  )

  same(await resolve({ foo: '..', ':': true })(
    { url: '/foo' })
  , { url: '/', params: {} }
  , 'relative redirect ..'
  )

  same(await resolve({ foo: '../', ':': true })(
    { url: '/foo' })
  , { url: '/', params: {} }
  , 'relative redirect ../'
  )

  same(await resolve({ 
    ':one': one => {
      same(one, 'one', 'one')
      return { 
        ':two': two => {
          same(two, 'two', 'two')
          return true 
        }
      }
    }
  })(
    { url: '/one/two' })
  , { url: '/one/two', params: { one: 'one', two: 'two' } }
  , 'two-level inner variables'
  )

  same(await resolve({ 
    ':one': one => ({
      ':two': two => '..'
    , ':': true
    })
  })  (
    { url: '/one/two' })
  , { url: '/one', params: { one: 'one' } }
  , 'two-level relative redirect'
  )

  same(await resolve({ 
    ':one': one => ({
      ':two': two => '..'
    , ':': true
    })
  })  (
    { url: '/one/two' })
  , { url: '/one', params: { one: 'one' } }
  , 'two-level relative redirect'
  )

  same(await resolve({ foo: { ':bar': bar => bar == 'bar' ? true : '/foo', ':': true } })(
    { url: '/foo/bar' })
  , { url: '/foo/bar', params: { bar: 'bar' } }
  , 'default with variable'
  )

  same(await resolve({ foo: { ':bar': bar => bar == 'bar' ? true : '/foo', ':': true } })(
    { url: '/foo/baz' })
  , { url: '/foo', params: {} }
  , 'default with variable - fallback'
  )

  same(await resolve({ foo: { ':bar': bar => bar ? true : '/foo/bar' } })(
    { url: '/foo' })
  , { url: '/foo/bar', params: { bar: 'bar' } }
  , 'no default variable'
  )

  end()
})

test('side effects - server', async ({ ok, notOk, same, end }) => {
  let redirect = d => (redirected = d)
    , next = d => (passed = true)
    , skip = { 'bar': true, ':': '/bar' }
    , redirected = false
    , passed = false
    , url = '/foo'

  router(true)({ url }, { redirect }, next)
  ok(passed, 'match passed')
  notOk(redirected, 'match not redirected')

  passed = redirected = false
  await router(skip)({ url }, { redirect }, next)
  notOk(passed, 'redirect not passed')
  same(redirected, '/bar', 'redirect')

  end()
})

test('client', ({ test, beforeEach , end }) => {
  let pushState = (state, title, url) => (pushed = [state, title, url], location.pathname = url)
    , pushed, changed, prevented

  delete global.window
  delete global.document
  keys(require.cache).map(d => delete require.cache[d])
  require('browserenv')
  global.window.event = { preventDefault: d => prevented = true }
  window.addEventListener('change', e => changed = true)
  global.CustomEvent = global.window.CustomEvent
  global.location = { pathname: '/foo' }
  global.history = { pushState }
  keys(require.cache).map(d => delete require.cache[d])
  const { router, resolve } = require('./')
  const go = window.go

  test('side effects', async ({ ok, notOk, same, end }) => {
    let pass = d => true
      , skip = d => ({ bar: true, ':': '/bar' })
      , args = d => ({ foo: { ':bar': true }, ':': '/foo/baz' })
    

    pushed = changed = false
    same(await router(pass), { url: '/foo', params: {} })
    same(location, { pathname: '/foo', params: {} })
    notOk(changed)

    pushed = changed = false
    same(await router(skip), { url: '/bar', params: {} })
    same(location, { pathname: '/bar', params: {} })
    ok(changed)

    pushed = changed = false
    same(await router(args), { url: '/foo/baz', params: { bar: 'baz' } })
    same(location, { pathname: '/foo/baz', params: { bar: 'baz' } })
    ok(changed)

    end()
  })

  test('should allow manual navigations', ({ same, ok, end }) => {
    global.location = { }
    pushed = prevented = changed = false

    same(go('/path'), '/path', 'go return value')
    same(pushed, [{}, '', '/path'], 'go pushState')
    ok(prevented, 'go preventDefault')
    ok(changed, 'go window change')
    end()
  })

  test('should trigger change on popstate', ({ ok, end }) => {
    pushed = prevented = changed = false
    window.dispatchEvent(new CustomEvent('popstate'))
    ok(changed, 'popstate change')
    end()
  })

  end()
})