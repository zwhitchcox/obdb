/* @flow */
import uuid from 'uuid/v4'
import global from './global'

export function isPrim(val: any) {
  return typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean' ||
    val === null || val === undefined
}

export function isPlain(value: any) {
  if (value === null || typeof value !== "object")
    return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

export function isSoul(val) {
  return isPlain(val) && Object.keys(val) == '#' && val['#']
}
export const getId = (process.env.NODE_ENV === 'test') ? () => global.id++ : uuid
