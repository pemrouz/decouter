import emitterify from 'utilise/emitterify'
import client from 'utilise/client'
import first from 'utilise/first'
import last from 'utilise/last'

const log     = require('utilise/log')('[router]')
const strip   = d => last(d) == '?' ? d.slice(1, -1) : d.slice(1)
const extract = (routes, o = {}) => page => routes.some(r => o = match(page)(r)) ? o : false
const go      = url => ((window.event && window.event.preventDefault(), true)
                  , history.pushState({}, '', url)
                  , window.emit('change')
                  , url)

// redirect to url we should be on
export default function router(routes){ 
  return !client ? resolve : resolve({ url: location.pathname }) 

  function resolve(req, res, next) {
    const from   = req.url
        , params = req.params = extract(routes)(from)
        , to     = routes.redirects ? routes.redirects(req) : from

    if (from != to) log('router redirecting', from, to)

    return  client && from !== to ? { params: extract(routes)(to), url: go(to) }
         : !client && from !== to ? res.redirect(to)
         : !client                ? next()
         : { params, url: to }
  }
}


// match page parts against candidate route parts
function match(page) {
  return function (route) {
    var partsRoute = route.split('/').filter(Boolean)
      , partsPage  = page.split('/').filter(Boolean)
      , vars = {}

    return partsRoute.every(matches) ? vars : false

    function matches(d, i) {
      const r = partsRoute[i]
          , p = partsPage[i]

      return r == p          ? true                       // fixed segment
           : last(r)  == '?' ? (vars[strip(r)] = p, true) // optional variable segment
           : first(r) == ':' ? (vars[strip(r)] = p)       // variable segment
           : false
    }
  }
}

if (client) {
  emitterify(window).addEventListener('popstate', d => window.emit('change'))
  window.go = go
  window.router = router
}
