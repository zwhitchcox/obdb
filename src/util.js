/* @flow */
export function isPrimitive(val: any) {
  return typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean'
}

export function isPlainObject(value: any) {
  if (value === null || typeof value !== "object")
    return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}
