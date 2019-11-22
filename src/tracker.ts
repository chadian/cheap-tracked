import {Tag} from './tag';

class Tracker {
  tags: Tag[] = []

  addTag(tag: Tag) {
    this.tags.push(tag)
  }
}


let currentTracker: Tracker | null = null
export const getCurrentTracker = () => currentTracker

export function track(cb: () => any) {
  const current = new Tracker()
  let previous = null

  if (currentTracker) {
    previous = currentTracker
  }

  currentTracker = current

  cb();

  currentTracker = previous;

  return current;
}
