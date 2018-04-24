import uuid from 'uuid/v4'

const noop = _ => {}
let tracking = true
let cur_watcher = noop
export function report_retrieved(id) {
  cur_watcher(id)
}

export function report_changed(id) {
  //if (noop !== cur_watcher) return console.error('can\'t change during reaction')
  const cur_reactions = reactions_for_id[id]
  for (const reaction_id in cur_reactions) {
    const reaction = reactions[reaction_id]
    watch(reaction, reaction, reaction_id)
  }
}

export function watch(fn, reaction, reaction_id) {
  reaction_id = reaction_id || uuid()
  reactions[reaction_id] = reaction
  const prev_watcher = cur_watcher
  cur_watcher = observed_id => {
    (reactions_for_id[observed_id] || (reactions_for_id[observed_id] = {}))[reaction_id] = true
  }
  const return_val = fn()
  cur_watcher = prev_watcher
  return return_val
}

export const reactions = {}
export const reactions_for_id = {}

export function untracked(fn) {
  tracking = false
  fn()
  tracking = true
}

export function transaction(fn) {
  fn()
}
