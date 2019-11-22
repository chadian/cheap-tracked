# `@tracked`

```js
const someObject = {
  @tracked
  firstName = 'Marco'

  @tracked
  lastName = 'Polo'

  get fullName() {
    return `${this.firstName} ${this.lastName}`
  }
}
```

This project offers a "cheap" version of change tracking based on the
`@tracked` decorator introduced in Ember and glimmer.js. It is not
considered feature complete compared to those implementations.

It does not include:
  * combining tags from a tracker
  * sub-tags

This project is mostly an attempt for me to help wrap my mind around how this change
detection system is implemented and its pros/cons. Hopefully this simpler implementation
does give some insights into how this tracking system works under the hood. There might
be holes in my understanding, so please open an [issue]() or reach out on [twitter]().

## "pull-based" tracking
The main idea behind the `@tracked` method of change detection is that
it's "pull-based". By pulling a value, then seeing what it depends on,
then pulling on that, we can know everything that the one property depends on.
This should be done without having to annotate or tell the system anything
about the dependencies.

`@tracked` focuses on identifying mutable properties,
that is the properties that could change, and then knowing:
1. If they have been changed since the last check (are in a "dirty" state)
2. In what "unit of work" or "work frame" they participate as a dependency

Previously, Ember used a push-based system for detecting changes. That relied
on declaring dependencies on the property. When one of dependencies would change
the dependent property would be marked as "dirty", if that newly dirtied dependent
property had dependents they would be marked dirty also, continuing until everything
affected by the change had been marked.

## Changes are tracked by "tags"

1. One tag exists per property
2. A Tag tracks the last revision they were changed, or dirtied (`.dirty()`)
3. A Tag tracks the last revision they were checked (`.check()`)

Tags contain a revision property that marks when the revision they were changed on,
and also a revision checked to mark the last revision the tag was checked. These
revisions are managed by the `.dirty()` and `.check()` methods, respectivately.

## Tracking "window" or "frame"

When there is a unit of work in which we want to track and "pull" all dependencies
we can use `track()`. A "unit of work" captures is captured by a callback. When we
pass this callabck to `track()` it will call the callback meanwhile using a `Tracker`
to capture any `get`s on properties with their corresponding `Tag`s that were installed
by `@tracked`. At the end of this tracking execution frame `track()` returns the
`Tracker` used which contains all `Tag`s.

A simple unit of work could be an individual "get" on a property. This would give us all
the dependencies for that property, ie using the `Person` class example from the top:

```
const person = new Person()
const tracker = track(() => person.fullName)
```
In this case `tracker.tags` would contain the tags for `firstName` and `lastName`.

## Marking tags as checked after tracking

Once we know an operation (defined by a callback) has a list of its dependencies
(by `Tracker.tags`) we can check those tags for changes. The example used in this
project in the tests is to use a render function that takes some context object.
Tags are collected in the process of rendering the context passed to a template.
The next time a re-render is requested we can check the tags that were used
previously, check if they are behind the current revision checked, that is they
are considered "dirty". If they are considered "dirty" we re-render, otherwise
we rely on the cache. On each re-render we mark each tag as "checked" to
acknowledge that we have reconciled with the changed state and that we're
"all caught up".
