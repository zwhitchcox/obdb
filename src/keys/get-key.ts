import { rng } from './rng'
import { bytesToUuid } from './bytesToUuid'

export const getKey = ():string  => bytesToUuid(rng())
