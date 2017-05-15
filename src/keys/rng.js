import { randomBytes as rb } from 'crypto'
import { KEY_SIZE } from '../constants'

export const rng: () => Buffer = () => rb(KEY_SIZE)
