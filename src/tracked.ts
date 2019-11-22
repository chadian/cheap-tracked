import {getCurrentTracker} from './tracker';
import {tagForProperty} from './tag';


export function tracked(target: any, propertyKey: string): any {
  console.log({target, propertyKey})

  let value: any

  return {
    get() {
      console.log('getting value', {value})

      const currentTracker = getCurrentTracker();
      if (currentTracker) {
        currentTracker.addTag(tagForProperty(target, propertyKey))
      }

      return value
    },

    set(newValue: any) {
      console.log('setting value', {newValue})

      const tag = tagForProperty(target, propertyKey)
      tag.dirty()
      value = newValue
    }
  }
}
