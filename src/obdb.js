import { getId } from './global'
import { getKey } from './keys'
import type { TPath } from './path'
type ISoul = {| '#': string |}
type TDatum = string | number | boolean | ISoul
export type IData = {
  [key: string]: TDatum
}
interface IObdbOptions {
  peers?: string[] | string,
  startData?: {[key: string]: string},
  file?: string,
}

// data: IData = {}
export class Obdb {
  data: IData = {}
  map = new WeakMap
  observed = {}
  changed = {}
  constructor(start: IData = {}) {
    this.data = {}
  }

  set(path: TPath, val: any) {
    return []
      .concat(path)
      .slice(0, path.length - 1)
      .reduce((prev, cur) => prev[cur] || this.create(prev, cur), this.data)
        [path[path.length - 1]] = val
  }

  get(path: TPath) {
    return []
      .concat(path)
      .reduce((prev, cur) => prev[cur] || this.create(prev, cur)), this.data)
  }

  create(path) {
    const key = getKey()
    Object.defineProperty(parent, path, {
      set = (newVal) => {
        this.changed[key] = true
        this.data[key] = newVal
      },

      get => () {
        this.observed[key] = true
      },

      enumerable: true,
      configurable: true,
    })
    this.map.set(parent[path], key)
    return parent[path]
  }
}
