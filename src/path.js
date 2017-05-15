import { getKey } from './keys/get-key'
import type { IData } from './obdb'
export type TPath = string | string[]
export function mkp(path: TPath, data: IData) {
  path = [].concat(path).reverse()
  let datum, i = path.length, name, key;

  // follow path until you see non-existent reference
  while ((datum = data[path[i]]) && (key = datum['#']) && (datum = data[key]) && --i);
  if (!i) return datum

  // make remaining path
  while ((name = path[i]) && --i) {
    const key = getKey()
    datum[name] = { '#': key }
    datum = data[key] = {}
  }
  return datum
}
