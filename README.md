# Decouter

_100% Test Coverage, but Travis is currently messed :/_

A refined and pure approach to routing

* [Inversion of Control]()
* [Deeply Nested Routes]()
* [Universal]()
* [Dynamic Routing]()
* [Progressive Enhancement]()
* [API - Routes]()
* [API - Redirects]()
* [Go]()
* [Standardised Change]()

## Inversion of Control

A lot of routers are coupled tightly with a particular framework:

```jsx
<Route path="about" component={About} />
```

Instead, this module takes a purer approach. Given a set of routes, it will just return the page it _should_ be on, with any parameters parsed:

```js
const { url, params } = router(routes)
```

You can then render different components based on the result:

```js
export default app(){
  const { url, params } = router(routes)
      , o = once(this)
      
  o('page-login'    , url == '/login')
  o('page-dashboard', url == '/dashboard')
}
```

The only side-effect it will make is if, on the client, it's on a different page than it should be, then it will return the result of what it should be on as well invoke `pushState` (via `go`) to update the browser history - since you will _always_ want that to be in sync.

## Deeply Nested Routes

In React Router, the entire application structure is described in the router:

```js
render((
  <Router>
    <Route path="/" component={App}>
      <Route path="about" component={About} />
      <Route path="inbox" component={Inbox}>
        {/* add some nested routes where we want the UI to nest */}
        {/* render the stats page when at `/inbox` */}
        <IndexRoute component={InboxStats}/>
        {/* render the message component at /inbox/messages/123 */}
        <Route path="messages/:id" component={Message} />
      </Route>
    </Route>
  </Router>
), document.body)
```

This is a brittle approach since the internal structure of components is now duplicated here. A more robust approach would be for each parent component to transform and pass down any data a child might need to make a decision of what to render:

```js
o('page-login'    , url == '/login' && params)
o('page-dashboard', url == '/dashboard' && params.panel)

function pageDashboard({ panel }){
  const o = once(this)
  o('panel-events' , panel == 'events')
  o('panel-profile', panel == 'profile')
}
```

## Universal

Most SPA's tend to serve the entire app bundle under one route and then _after_ the client loads, it performs any necessary redirects. This is a very inefficient approach. We should never overfetch, and we definitely should not mistakenly load something only to be then redirected to somewhere else. Instead we can evaluate the same routes and redirects on the server as an Express middleware:

```js
app.use(router(routes))
```

This is particularly important if you're also into server-side rendering:

```js
app.use(ssr) // expand components before sending over the wire
```

## Dynamic Routing

Dynamic Routing is achieved by registering your routes as a resource. It's not a direct concern of this module:

```js
routes(ripple('routes'))
```

Alternatively you can declare it as a data dependency on your app which will then invoke and inject into your app once it's ready:

```html
<my-app data="routes">
```

```js
function myApp({ routes }){
  const { url, params } = router(routes)
  ..
}
```

## Progressive Enhancement

Uses the History API or a polyfill if present.

## API - Routes

`routes` is an array of all possible routes. You can have fixed, variable, or optionally variable segments following the Express syntax:

```js
[
  '/path'       // fixed paths
, '/path/:var'  // variables
, '/path/:var?' // optional vars
]
```

This array is used to find the first match, then destructure the parameters into the `params` object.

## API - Redirects

If `routes.redirects` exists, it will be invoked to determine which path we should be on. On the client it receives the current `{ url, params }`. On the server, it receives the Express `req`, which has `url` and `params` properties amongst other stuff (e.g. `sessionID`):

```js
// redirect to /dashboard if logged in, or /login otherwise
routes.redirects = function(req){
  const me = client ? ripple('user') : ripple('user').whos(req)
  return me ? '/dashboard' : '/login'
}
```

```js
// if we're not logged in, always go to /login 
// if we're logged in and not on the dashboard, redirect to /dashboard
// if we're logged in and on dashboard but not selected a panel, redirect to a default one
// if we're logged in and on dashboard and selected a panel, then we just return what we are on (no redirect)
routes.redirects = function(req){
  const { url, params } = req
      , panel = params.panel
      , me = client ? ripple('user') : ripple('user').whos(req)
      , dashboard = starts('dashboard')(url)
      
  return !me                         ? '/login' 
       :  me && !dashboard           ? '/dashboard'
       :  me &&  dashboard && !panel ? '/dashboard/events'
                                     :  url
}
```

You will see a pattern emerge as your declarative redirects grow. You can break this out into sub-functions (e.g. all logic to deal with dashboard in one, and login logic in another) and then aggregate them by composing return values to return the final value. 

## Go

`go(url)` is a simple utility to update the location of the page. This is useful for testing/debugging, but also to navigate to a different URL in response to some action:

```js
o('nav.main', 1)
  ('a', navItems)
    .classed('is-active', by('href', includes(panel)))
    .on('click.nav', d => go(d.href))
    .attr('href', key('href'))
    .text(key('label'))
```

Most components should not make assumptions about their environments and perform side-effects directly though, so it would be better to bubble up a navigation event and then act on it higher up:

```diff
- .on('click.nav', d => go(d.href))
+ .on('click.nav', d => this.emit('nav', d.href))

// higher up:
.on('nav', go)
```

## Standardised Change Event

Changes via browser back buttons, `go` or a router redirect will all emit a change event on the window.

You can listen for changes and redraw your app to update the view accordingly, so the complete app would then look like:

```js
export default app({ routes }){
  const { url, params } = router(routes)
      , o = once(this)
      
  o('page-login'    , url == '/login')
  o('page-dashboard', url == '/dashboard')
    .on('nav.go', go)

  window.on('change.app', this.draw)
}
```
