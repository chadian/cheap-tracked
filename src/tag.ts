let REVISION = 1

export class Tag {
  revision = 1
  lastRevisionChecked = 1

  check() {
    this.lastRevisionChecked = REVISION
  }

  dirty() {
    this.revision = ++REVISION
  }
}

export function currentRevision() {
  return REVISION
}

const META = Symbol()
export function tagForProperty(object: any, property: string): Tag {
  object[META] = object[META] || {}
  object[META][property] = object[META][property] || {}
  object[META][property].tag = object[META][property].tag || new Tag()

  return object[META][property].tag
}
