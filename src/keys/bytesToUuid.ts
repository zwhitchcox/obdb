type bthType = string[]
const byteToHex: bthType = []
for (let i: number = 0; i < 256; ++i) {
  byteToHex[i] = (i + 0x100).toString(16).substr(1)
}

export function bytesToUuid(buf) {
  const bth: bthType = byteToHex
  let i:number  = 0
  return  bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]]
}
