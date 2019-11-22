import {Tag} from './tag';
import {track} from '../src/tracker';

let cache: string | null = null;
let tagsFromRender: Tag[] = [];

export const resetCache = () => cache = null;

export function render(context: any, template: (context: any) => string) {
  const shouldRerender = tagsFromRender.some(tag => {
    return tag.revision > tag.lastRevisionChecked
  })

  console.log('rerender ?', shouldRerender)

  if (cache === null || shouldRerender) {
    const tracker = track(() => {
      cache = template(context)
    })

    tagsFromRender = tracker.tags
    tagsFromRender.forEach(tag => tag.check())
  }

  return cache;
}
