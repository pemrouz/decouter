# Decouter

## [![Coverage Status](https://coveralls.io/repos/pemrouz/decouter/badge.svg?branch=master)](https://coveralls.io/r/pemrouz/decouter?branch=master) [![Build](https://api.travis-ci.org/pemrouz/decouter.svg)](https://travis-ci.org/pemrouz/decouter)

* **Trie-based structure:** The main goal is to deliver a tighter UX around URL's. As your routes grow, it becomes difficult to reason about your them as a flat-list, and they often become flaky. Decouter allows you to specifiy your routes as a tree.
* **Fast:**: O(1) with respect to number of routes
* **Client & Server:** Avoid sending client to wrong page just to redirect + avoid duplicating route logic
* **Intuitive & Expressive:**: Each level can return a boolean to indicate a match, a string to indicate a redirect, an object to, or a promise that resolves to either of these values, or a function that returns either of these values.
* **Pure + Batteries-Included Version:** Works as middleware with express, `go(url)` for programmatic control, automatic redirects, works with history API, anchor tags (event inside Shadow DOM), extends `location` with `params` object after successful match.
* **Small:** ~1kB min+gzip (ES6 version is smaller)
* **Lazy-loading:** Because any segment can return a promise, you can chunk up your route logic into separate parts.

Decouter offers two main functions
* **`resolve`** - a pure function that given a request, will resolve it against a set of routes, returning the `url` and `params`.
* **`router`** - uses the `resolve` function, but takes the appropiate side-effects on the client and server.

By separating the pure resolution, from the side-effects, it becomes really nice and easy to test your route logic for your app in isolation.

## Resolution

```js
import { resolve } from 'decouter'

const routes = {
  foo: {
    bar: true
  , baz: '/foo/bar'
  }
}

const { url, params } = resolve(routes)({ url: '/foo/bar' })
assert(url, '/foo/bar')

const { url, params } = resolve(routes)({ url: '/foo/baz' })
assert(url, '/foo/bar')
```

For variable segments, just prepend the key with a `:`. You can then access the value using a function:

```js
const routes = {
  foo: {
    ':bar': bar => bar == 'boo' ? true : '/foo/boo'
  }
}

const { url, params } = resolve(routes)({ url: '/foo/bar' })
assert(url, '/foo/boo')
```

You can have a default (`:`) handler for when there is no further segment to match, or other fixed and variable handlers didn't match:

```js
const routes = {
  foo: {
    ':fail1': false
    ':fail2': false
    ':' true
  }
}

const { url, params } = resolve(routes)({ url: '/foo/bar' })
assert(url, '/foo/bar')
```

You can also do relative redirects (`..`, `../`). Here is an example with multi-level variables:

```js
const routes = {
  ':org': org => !isValidOrd(org) ? '..' : {
    ':repo': repo => !isValidRepo(repo) ? '..' : true
  }
}

const { url, params } = resolve(routes)({ url: '/valid-org/valid-repo' })
assert(url, '/valid-org/valid-repo')

const { url, params } = resolve(routes)({ url: '/valid-org/invalid-repo' })
assert(url, '/valid-org')

const { url, params } = resolve(routes)({ url: '/invalid-org' })
assert(url, '/')
```

Normally you will want to do some auth before proceeding a level deeper. You can access the request object as the first parameter of functions (or the second for variable functions):

```js
const isLoggedIn = req => req.token === 'valid'

const routes = {
  dashboard: req => !isLoggedIn(req) ? '/login' : true
, login: req => isLoggedIn(req) ? '/dashboard' : true
}

const { url, params } = resolve(routes)({ url: '/dashboard', token: 'valid' })
assert(url, '/dashboard')

const { url, params } = resolve(routes)({ url: '/dashboard' })
assert(url, '/login')

const { url, params } = resolve(routes)({ url: '/login', token: 'valid' })
assert(url, '/dashboard')

const { url, params } = resolve(routes)({ url: '/login' })
assert(url, '/login')
```

## Server-Side

```js
app.use(router(routes))
```

This will use the same routing logic to redirect requests to the right place before proceeding.

## Client-side

In your top-level component/application:

```js
function app(node, { routes }){
  const { url, params } = router(routes) 
}
```

This will use the same routing logic to return the correct URL and params the user should be on. You can use the result to determine which components to draw. It will also: 

* Change the URL to match accordingly
* Extend the `location` object with any `params` it has matched, in case you don't want to manually pass this down deeply to children

You can also programmatically control navigation with:

```js
go('/login')
```

Any navigation (including redirects) will emit a `change` event on window so you can redraw your app:

```js
window.addEventListener('change', app.draw)
```