const client = true

function l(ns){
  return function(d){
    if (!window.console || !console.log.apply) return d;
    var args = Array.prototype.slice.call(arguments, 0)
      , prefix = '[log][' + (new Date()).toISOString() + ']' + ns
    args.unshift(prefix)
    return console.log.apply(console, args), d
  }
}

const log = l('[router]')
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
        , to = resolved.url

    if (from !== to) log('router redirecting', from, to)
    if (client) location.params = resolved.params

    return client && from !== to ? (go(to), resolved)
        : !client && from !== to ? res.redirect(to)
        : !client                ? next()
        : resolved
  } 
}

const resolve = routes => (req, url = req.url) => {
  const params = {}
      , to = next(req, params, url, routes)

  return to == '../' || to == '..' ? resolve(routes)(req, '/' + url.split('/').filter(Boolean).slice(0, -1).join('/'))
       : !to ? false
       : to !== true ? resolve(routes)(req, to)
       : { url, params }
}

const next = (req, params = {}, url, value, variable) => {
  const { cur, remainder } = segment(url)

  return typeof value == 'string' || typeof value == 'boolean' ? value
       : typeof value == 'function' && typeof variable != 'undefined' ? next(req, params, url, value(req))
       : typeof value == 'function' ? next(req, params, url, value(variable, req))
       : cur in value ? next(req, params, remainder, value[cur])
       : !cur && value[':'] ? next(req, params, remainder, value[':'])
       : (variables(value)
            .find(d => (((d.value = next(req, params, remainder, value[d.key], cur || false)))
              ? (d.value === true && d.name && (params[d.name] = cur), true) 
              : false
              )
            ) || {}).value
}

const variables = o => Object.keys(typeof o == 'object' || typeof o == 'function' ? o : {})
  .filter(([f]) => f == ':')
  .map(k => ({ key: k, name: k.slice(1) }))

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
    if (!a.matches('a[href]:not([href^=javascript]):not(.bypass)')) return
    if (a.origin != location.origin) return
    e.preventDefault()
    go(a.href)
  })
}

export { router, resolve }