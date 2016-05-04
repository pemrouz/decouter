import emitterify from 'utilise/emitterify'
import client from 'utilise/client'
import keys from 'utilise/keys'

const log = require('utilise/log')('[router]')
const go  = url => ((window.event && window.event.preventDefault(), true)
                   , history.pushState({}, '', url)
                   , window.emit('change')
                   , url)

const router = resolve => {
  return !client ? route : route({ url: location.pathname }) 

  function route(req, res, next) { 
    const from = req.url
        , resolved = resolve(req)
        , to = resolved.url

    if (from !== to) log('router redirecting', from, to)

    return client && from !== to ? (go(to), resolved)
        : !client && from !== to ? res.redirect(to)
        : !client                ? next()
        : resolved
  } 
}

const resolve = root => (req, from) => {
  const params = {}
      , url = from || req.url
      , to = root({ req, params, next: next(req, url, params) })

  return to !== true ? resolve(root)(req, to)
       : { url, params }
}

const next = (req, url, params) => handlers => {
  var { first, last } = segment(url)
    , li = keys(handlers)
    , pm = li[0][0] == ':' ? li[0] : null
    , to = ''

  if (pm) {
    params[pm.slice(1)] = first
    to = handlers[pm]({ req, next: next(req, last, params), params }) 
  } else if (first in handlers)
    to = handlers[first]({ req, next: next(req, last, params), params })

  // console.log(url, to, pm)
  return to
}

function segment(url) {
  const segments = url.split('/').filter(Boolean)
  return { first: segments.shift(), last: segments.join('/') }
}

if (client) {
  emitterify(window).addEventListener('popstate', d => window.emit('change'))
  window.go = go
  window.router = router
}

export { router, resolve }