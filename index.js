const client = require('utilise/client')
    , keys = require('utilise/keys')
    , key = require('utilise/key')
    , is = require('utilise/is')

const log = require('utilise/log')('[router]')
    , go  = url => {
        if (window.event) window.event.preventDefault()
        history.pushState({}, '', url)
        window.dispatchEvent(new CustomEvent('change'))
        return url
      }

const router = routes => {
  return !client ? route : route({ url: location.pathname }) 

  function route(req, res, next) { 
    const from = req.url
        , resolved = resolve(routes)(req)
        , finish = ({ url, params }) => {
            if (from !== url) log('router redirecting', from, url)
            if (client) location.params = params

            return client && from !== url ? (go(url), { url, params })
                : !client && from !== url ? res.redirect(url)
                : !client                 ? next()
                : { url, params }
        }
        
    return is.promise(resolved) ? resolved.then(finish) : finish(resolved)
  } 
}

const resolve = routes => (req, url = req.url) => {
  const params = {}
      , to = next(req, params, url, routes)
      , finish = to => 
           to == '../' || to == '..' ? resolve(routes)(req, '/' + url.split('/').filter(Boolean).slice(0, -1).join('/'))
         : !to ? false
         : to !== true ? resolve(routes)(req, to)
         : { url, params }

  return is.promise(to) ? to.then(finish) : finish(to)
}

const next = (req, params = {}, url, value, variable) => {
  const { cur, remainder } = segment(url)

  return is.promise(value) ? value.then(v => next(req, params, url, v, variable))
       : is.str(value) || is.bol(value) ? value
       : is.fn(value) && !is.def(variable) ? next(req, params, url, value(req))
       : is.fn(value) ? next(req, params, url, value(variable, req))
       : cur in value ? next(req, params, remainder, value[cur])
       : !cur && value[':'] ? next(req, params, remainder, value[':'])
       : variables(
           params
         , (route) => next(req, params, remainder, value[route.key], cur || false)
         , (route, result) => result === true && route.name && (params[route.name] = cur)
         , keys(value)
             .filter(([f]) => f == ':')
             .map(k => ({ key: k, name: k.slice(1) }))
         )
}

const variables = (params, match, success, routes, route = routes.shift()) => 
  !route ? false : Promise.resolve(match(route))
    .then(result => result 
       ? (success(route, result), result)
       : variables(params, match, success, routes)
    )

function segment(url) {
  const segments = url.split('/').filter(Boolean)
  return { cur: segments.shift(), remainder: '/' + segments.join('/') }
}

if (client) {
  const draw = window.app && window.app.draw || document.draw || String
  window.go = go
  window.router = router
  window.router.resolve = resolve
  window.addEventListener('popstate', e => window.dispatchEvent(new CustomEvent('change')))
  window.addEventListener('change', e => e.target == window && draw())
  document.addEventListener('click', e => {
    const a = e.path ? e.path.shift() : e.target
    if (!a.matches('a[href]:not([href^=javascript]):not([bypass])') || a.matches('[bypass] *')) return
    if (a.origin != location.origin) return
    e.preventDefault()
    go(a.href)
  })
}

module.exports = { router, resolve }