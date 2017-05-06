import { global, getId } from './global'
import { getKey } from './keys/get-key'
import { isPrimitive } from './util'

const instances: {[key: number]: Obdb} = {}
interface Data {[key: string]: string | null}
interface Deleted {[key: string]: number}
interface Subscribers {[key: string]: string}
type Path = string[] | string


export class Obdb {
  public id: number

  constructor(public peers?: string[], public data: Data = {}) {
    this.id = getId()
    instances[this.id] = this
  }

  // make (create)
  public mk(val: any) {
    const key = getKey()
    this.up(key, val)
    return key
  }

  // remove
  public rm(key: string) {
    this.deleted[key] = +new Date
    delete this.data[key]
    this.notify(key)
  }

  // update
  public up(key: string, val: any): void {
    const proto = Object.getPrototypeOf(val)
    if (isPrimitive(val)) {
      this.data[key] = val
    } else if (Array.isArray(val)) {
      throw new Error('can\'t serialize arrays yet')
    } else if (val == null) {
      this.rm(key)
    } else if (proto === Object.prototype || proto === null) {
      this.data[key] 
    } else {
      throw new Error('can only serialize plain objects (with Object.prototype constructor)')
    }
  }

  // subscribe
  public sb(path: Path) {
    
  }

  // read
  public rd(path: Path) {
    if (typeof path === 'string')
      return this.data[path]
    let val = this.data[0];
    for (let i = 1, len = path.length; i < len; i++) {
      val = val && val[path[i]]
    }
    return val
  }

  private notify(key: string) {
    
  }

  private getDependencies(path: Path) {

  }

  private subscribers: Subscribers = {}
  private deleted: Deleted  = {}
}

export const getInstance = (i: number = 0): Obdb => instances[i]
