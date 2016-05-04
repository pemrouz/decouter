import 'utilise'
import core from 'rijs.core'
import data from 'rijs.data'
import t from 'tap'

const today = 'today'

const whos = req => req

const app = ({ next }) => 
  next({ dashboard, login }) ||  '/login'

const login = ({ req }) => 
  whos(req).email ? '/dashboard' : true

const dashboard = ({ req, next }) => 
    !whos(req).email ? '/login' 
   : next({ classes, teachers, middle }) 
  || `/dashboard/classes/${today}`

const teachers = ({ next }) => 
  next({ ':op': ({ params }) => params.op && params.op !== 'add' ? '/dashboard/teachers' : true })

const classes = ({ next }) => 
  next({ ':date': ({ params }) => !!params.date || `/dashboard/classes/${today}` })

const middle = ({ next }) => next({ ':foo': foo })
const foo    = ({ next }) => next({  'bar': bar })
const bar    = ({ next }) => next({ ':baz': baz })
const baz    = ({ next }) => true

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

  t.same(resolve(app)(
    { url: '/dashboard/baz', email: true }), 
    { url: '/dashboard/classes/today', params: { date: 'today' } }
  )

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

  time(100, t.end)
})

t.test('side effects - server', t => {
  const { router, resolve } = require('./')

  var redirect = d => redirected = d
    , next = d => passed = true
    , pass = req => req
    , skip = req => ({ url: '/bar' })
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
  var pushState = (state, title, url) => pushed = [state, title, url]
    , pushed, changed
  
  keys(require.cache).map(d => delete require.cache[d])
  require('browserenv')
  global.window = { addEventListener: noop }
  global.location = { pathname: '/foo' }
  global.history = { pushState }
  keys(require.cache).map(d => delete require.cache[d])

  const { router, resolve } = require('./')

  var pass = req => req
    , skip = req => ({ url: '/bar' })
  
  window.on('change', d => changed = true)

  pushed = changed = false
  t.same(router(pass), { url: '/foo' })
  t.notOk(changed)

  pushed = changed = false
  t.same(router(skip), { url: '/bar' })
  t.ok(changed)
  
  t.end()
})

t.test('should allow manual navigations', t => {
  const pushState = (state, title, url) => pushed = [state, title, url]
  var pushed, prevented, changed

  keys(require.cache).map(d => delete require.cache[d])
  require('browserenv')
  global.window.addEventListener = noop 
  global.window.event = { preventDefault: d => prevented = true }
  global.location = { }
  global.history = { pushState }
  keys(require.cache).map(d => delete require.cache[d])

  const { router, resolve } = require('./')

  window.on('change', d => changed = true)
  const go = window.go

  t.same(go('/path'), '/path')
  t.same(pushed, [{}, '', '/path'])
  t.ok(prevented)
  t.ok(changed)
  t.end()
})

t.test('should trigger change on popstate', t => {
  var listeners = [], changed = false
  const addEventListener = (type, fn) => listeners.push(fn)
  
  keys(require.cache).map(d => delete require.cache[d])
  require('browserenv')
  global.window = { addEventListener }
  keys(require.cache).map(d => delete require.cache[d])
  const { router, resolve } = require('./')
  
  window.on('change', d => changed = true)
  listeners.map(d => d())
  t.ok(changed)
  t.end()
})
