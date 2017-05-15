export let rng;
import { KEY_SIZE } from '../constants'

const crypto = global.crypto || global.msCrypto
if (crypto && crypto.getRandomValues) {
  const rnds8 = new Uint8Array(KEY_SIZE)
  rng = function whatwgRNG() {
    crypto.getRandomValues(rnds8)
    return rnds8
  };
}

if (!rng) {
  const rnds = new Array(KEY_SIZE);
  rng = function() {
    for (let i = 0, r; i < KEY_SIZE; i++) {
      if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
      rnds[i] = r >>> ((i & 0x03) << 3) & 0xff
    }

    return rnds
  }
}

