// Generates assets/icon.png — a 512×512 diagonal gradient.
// Plasmo derives the manifest icon sizes from this file.
import zlib from "node:zlib"
import fs from "node:fs"

const W = 512
const H = 512
const c1 = [0x5b, 0x3d, 0xf5] // purple
const c2 = [0xf5, 0x4d, 0xa0] // pink

const raw = Buffer.alloc(H * (1 + W * 3))
for (let y = 0; y < H; y++) {
  const row = y * (1 + W * 3)
  raw[row] = 0 // filter: none
  for (let x = 0; x < W; x++) {
    const t = (x + y) / (W + H - 2)
    const i = row + 1 + x * 3
    raw[i] = Math.round(c1[0] + (c2[0] - c1[0]) * t)
    raw[i + 1] = Math.round(c1[1] + (c2[1] - c1[1]) * t)
    raw[i + 2] = Math.round(c1[2] + (c2[2] - c1[2]) * t)
  }
}

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})
function crc32(buf) {
  let c = 0xffffffff
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, "ascii"), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

const ihdr = Buffer.alloc(13)
ihdr.writeUInt32BE(W, 0)
ihdr.writeUInt32BE(H, 4)
ihdr[8] = 8 // bit depth
ihdr[9] = 2 // color type: RGB

const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk("IHDR", ihdr),
  chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
  chunk("IEND", Buffer.alloc(0))
])

fs.mkdirSync("assets", { recursive: true })
fs.writeFileSync("assets/icon.png", png)
console.log(`wrote assets/icon.png (${png.length} bytes)`)
