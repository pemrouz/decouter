import client from 'utilise/client'
import keys from 'utilise/keys'

const log = require('utilise/log')('[router]')
const go  = url => ((window.event && window.event.preventDefault(), true)
                   , history.pushState({}, '', url)
                   , window.dispatchEvent(new CustomEvent('change'))
                   , url)

const router = routes => {
  return !client ? route : route({ url: location.pathname }) 

  function route(req, res, next) { 
    const from = req.url
        , resolved = resolve(routes)(req)
        , to = resolved.url

    if (from !== to) log('router redirecting', from, to)
    if (client) location.params = resolved.params

    return client && from !== to ? (go(to), resolved)
        : !client && from !== to ? res.redirect(to)
        : !client                ? next()
        : resolved
  } 
}

const resolve = root => (req, from) => {
  const params = {}
      , url = from || req.url
      , to = root({ url, req, params, next: next(req, url, params) })

  return to == '../' || to == '..' ? resolve(root)(req, '/' + url.split('/').filter(Boolean).slice(0, -1).join('/'))
       : to !== true ? resolve(root)(req, to)
       : { url, params }
}

const next = (req, url, params) => handlers => {
  var { first, last } = segment(url)
    , to = ''

  return first in handlers 
       ? handlers[first]({ req, next: next(req, last, params), params, current: first })
       : keys(handlers)
          .filter(k => k[0] == ':')
          .some(k => {
            const pm = k.slice(1)
            if (to = handlers[k]({ req, next: next(req, last, params), params, current: first }) )
              params[pm] = first

            return to
          }) && to
}

function segment(url) {
  const segments = url.split('/').filter(Boolean)
  return { first: segments.shift(), last: '/' + segments.join('/') }
}

if (client) {
  const draw = window.app && window.app.draw || document.draw || String
  window.go = go
  window.router = router
  window.addEventListener('popstate', e => window.dispatchEvent(new CustomEvent('change')))
  window.addEventListener('change', e => e.target == window && draw())
  document.addEventListener('click', e => {
    const a = e.path ? e.path.shift() : e.target
    if (!a.matches('a[href]:not([href^=javascript]):not(.bypass)')) return
    if (a.origin != location.origin) return
    e.preventDefault()
    go(a.href)
  })
}

export { router, resolve }