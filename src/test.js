import 'utilise'
import core from 'rijs.core'
import data from 'rijs.data'
import t from 'tap'

const today = 'today'

const whos = req => req

const app = ({ next }) => 
  next({ dashboard, login, relative }) ||  '/login'

const login = ({ req }) => 
  whos(req).email ? '/dashboard' : true

const dashboard = ({ req, next }) => 
    !whos(req).email ? '/login' 
   : next({ classes, teachers, middle, ':society': society }) 
  || `/dashboard/classes/${today}`

const relative = ({ next }) => next({ redirect1, redirect2 }) || true

const redirect1 = ({ }) => '../'

const redirect2 = ({ }) => '..'

const teachers = ({ next }) => 
  next({ ':op': ({ current }) => current && current !== 'add' ? '/dashboard/teachers' : true })

const classes = ({ next }) => 
  next({ ':date': ({ current }) => !!current || `/dashboard/classes/${today}` })

const middle = ({ next }) => next({ ':foo': foo })
const foo    = ({ next }) => next({  'bar': bar })
const bar    = ({ next }) => next({ ':baz': baz })
const baz    = ({ next }) => true

const society = ({ current, next }) =>
  next({ ':event': event }) || is.str(current)

const event = ({ current }) => current > 0

t.test('pure resolution', t => {
  const { router, resolve } = require('./')

  t.same(resolve(app)(
    { url: '/foo' }), 
    { url: '/login', params: {} }
  )

  t.same(resolve(app)(
    { url: '/login' }), 
    { url: '/login', params: {} }
  )

  t.same(resolve(app)(
    { url: '/login', email: true }), 
    { url: '/dashboard/classes/today', params: { date: 'today' } }
  )

  t.same(resolve(app)(
    { url: '/dashboard' }), 
    { url: '/login', params: {} }
  )

  t.same(resolve(app)(
    { url: '/dashboard', email: true }), 
    { url: '/dashboard/classes/today', params: { date: 'today' } }
  )

  // t.same(resolve(app)(
  //   { url: '/dashboard/baz', email: true }), 
  //   { url: '/dashboard/classes/today', params: { date: 'today' } }
  // )

  t.same(resolve(app)(
    { url: '/dashboard/classes', email: true }), 
    { url: '/dashboard/classes/today', params: { date: 'today' }}
  )

  t.same(resolve(app)(
    { url: '/dashboard/classes/tom', email: true }), 
    { url: '/dashboard/classes/tom', params: { date: 'tom' }}
  )

  t.same(resolve(app)
    ({ url: '/dashboard/teachers', email: true }), 
    { url: '/dashboard/teachers', params: { op: undefined }}
  )

  t.same(resolve(app)(
    { url: '/dashboard/teachers/foo', email: true }), 
    { url: '/dashboard/teachers', params: { op: undefined }}
  )

  t.same(resolve(app)(
    { url: '/dashboard/teachers/add', email: true }), 
    { url: '/dashboard/teachers/add', params: { op: 'add' }}
  )

  t.same(resolve(app)(
    { url: '/dashboard/middle/foo/bar/baz', email: true }), 
    { url: '/dashboard/middle/foo/bar/baz', params: { foo: 'foo', baz: 'baz' }}
  )

  t.same(resolve(app)(
    { url: '/dashboard/middle/foo/bar/baz', email: true }), 
    { url: '/dashboard/middle/foo/bar/baz', params: { foo: 'foo', baz: 'baz' }}
  )

  t.same(resolve(app)(
    { url: '/dashboard/imperial', email: true }), 
    { url: '/dashboard/imperial', params: { society: 'imperial' }}
  )

  t.same(resolve(app)(
    { url: '/dashboard/imperial/50', email: true }), 
    { url: '/dashboard/imperial/50', params: { society: 'imperial', event: '50' }}
  )

  t.same(resolve(app)(
    { url: '/relative/redirect1' }), 
    { url: '/relative', params: {} }
  )

  t.same(resolve(app)(
    { url: '/relative/redirect2' }), 
    { url: '/relative', params: {} }
  )

  time(100, t.end)
})

t.test('side effects - server', t => {
  const { router, resolve } = require('./')

  var redirect = d => redirected = d
    , next = d => passed = true
    , pass = ({ url }) => true
    , skip = ({ url }) => url == '/bar' || '/bar'
    , redirected = false
    , passed = false
    , url = '/foo'

  router(pass)({ url }, { redirect }, next)
  t.ok(passed)
  t.notOk(redirected)

  passed = redirected = false
  router(skip)({ url }, { redirect }, next)
  t.notOk(passed)
  t.same(redirected, '/bar')

  t.end()
})

t.test('side effects - client', t => {
  var pushState = (state, title, url) => (pushed = [state, title, url], location.pathname = url)
    , pushed, changed
  
  delete global.window
  delete global.document
  keys(require.cache).map(d => delete require.cache[d])
  require('browserenv')
  global.CustomEvent = global.window.CustomEvent
  global.location = { pathname: '/foo' }
  global.history = { pushState }
  keys(require.cache).map(d => delete require.cache[d])

  const { router, resolve } = require('./')

  var pass = ({ url  }) => true
    , skip = ({ url  }) => url == '/bar' || '/bar'
    , args = ({ next }) => next({ foo: ({ next }) => next({ ':bar': d => true }) }) || '/foo/baz'
  
  window.addEventListener('change', e => changed = true)

  pushed = changed = false
  t.same(router(pass), { url: '/foo', params: {} })
  t.same(location, { pathname: '/foo', params: {} })
  t.notOk(changed)

  pushed = changed = false
  t.same(router(skip), { url: '/bar', params: {} })
  t.same(location, { pathname: '/bar', params: {} })
  t.ok(changed)

  pushed = changed = false
  t.same(router(args), { url: '/foo/baz', params: { bar: 'baz' } })
  t.same(location, { pathname: '/foo/baz', params: { bar: 'baz' } })
  t.ok(changed)
  
  t.end()
})

t.test('should allow manual navigations', t => {
  const pushState = (state, title, url) => pushed = [state, title, url]
  var pushed, prevented, changed

  delete global.window
  delete global.document
  keys(require.cache).map(d => delete require.cache[d])
  require('browserenv')
  global.window.event = { preventDefault: d => prevented = true }
  global.CustomEvent = global.window.CustomEvent
  global.location = { }
  global.history = { pushState }
  keys(require.cache).map(d => delete require.cache[d])

  const { router, resolve } = require('./')

  window.addEventListener('change', e => changed = true)
  const go = window.go

  t.same(go('/path'), '/path')
  t.same(pushed, [{}, '', '/path'])
  t.ok(prevented)
  t.ok(changed)
  t.end()
})

t.test('should trigger change on popstate', t => {
  var changed = false
  
  delete global.window
  delete global.document
  keys(require.cache).map(d => delete require.cache[d])
  require('browserenv')
  global.CustomEvent = global.window.CustomEvent
  keys(require.cache).map(d => delete require.cache[d])
  
  const { router, resolve } = require('./')
  window.addEventListener('change', e => changed = true)
  window.dispatchEvent(new CustomEvent('popstate'))

  t.ok(changed)
  t.end()
})
