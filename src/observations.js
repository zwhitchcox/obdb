import uuid from 'uuid/v4'

const noop = _ => {}
let cur_watcher = noop
export function report_retrieved(id) {
  cur_watcher(id)
}

export function report_changed(id) {
  console.log('changed', id)
}

export function watch(fn) {
  const ids = []
  const prev_watcher = cur_watcher
  cur_watcher = observed_id => {
    ids.push(observed_id)
  }
  const return_val = fn()
  cur_watcher = prev_watcher
  return [return_val, ids]
}
