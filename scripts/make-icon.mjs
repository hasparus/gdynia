// Pads art/arka.png onto a transparent square canvas and writes
// assets/icon.png — the source Plasmo derives the manifest icon sizes from.
// Padding keeps Plasmo from squashing non-square art into a square.
import zlib from "node:zlib"
import fs from "node:fs"

const SRC = "art/arka.png"
const DST = "assets/icon.png"

// --- decode source PNG (expects 8-bit RGB/RGBA, non-interlaced) ---
const buf = fs.readFileSync(SRC)
let ihdr
const idat = []
for (let p = 8; p < buf.length; ) {
  const len = buf.readUInt32BE(p)
  const type = buf.toString("ascii", p + 4, p + 8)
  const data = buf.subarray(p + 8, p + 8 + len)
  p += 12 + len
  if (type === "IHDR") ihdr = data
  else if (type === "IDAT") idat.push(data)
  else if (type === "IEND") break
}
const w = ihdr.readUInt32BE(0)
const h = ihdr.readUInt32BE(4)
const colorType = ihdr[9]
if (ihdr[8] !== 8 || (colorType !== 2 && colorType !== 6)) {
  throw new Error(`expected 8-bit RGB/RGBA, got depth=${ihdr[8]} colorType=${colorType}`)
}

const bpp = colorType === 6 ? 4 : 3
const stride = w * bpp
const inflated = zlib.inflateSync(Buffer.concat(idat))
const pix = Buffer.alloc(h * stride)
const paeth = (a, b, c) => {
  const p = a + b - c
  const pa = Math.abs(p - a)
  const pb = Math.abs(p - b)
  const pc = Math.abs(p - c)
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c
}
let q = 0
for (let y = 0; y < h; y++) {
  const filter = inflated[q++]
  for (let i = 0; i < stride; i++) {
    const raw = inflated[q++]
    const a = i >= bpp ? pix[y * stride + i - bpp] : 0
    const b = y > 0 ? pix[(y - 1) * stride + i] : 0
    const c = i >= bpp && y > 0 ? pix[(y - 1) * stride + i - bpp] : 0
    let v
    switch (filter) {
      case 0: v = raw; break
      case 1: v = raw + a; break
      case 2: v = raw + b; break
      case 3: v = raw + ((a + b) >> 1); break
      case 4: v = raw + paeth(a, b, c); break
      default: throw new Error("bad PNG filter " + filter)
    }
    pix[y * stride + i] = v & 0xff
  }
}

// --- composite centered onto a transparent square ---
const S = Math.max(w, h)
const ox = (S - w) >> 1
const oy = (S - h) >> 1
const canvas = Buffer.alloc(S * (1 + S * 4)) // zero-filled: transparent + filter 0
for (let y = 0; y < h; y++) {
  const dstRow = (oy + y) * (1 + S * 4) + 1
  for (let x = 0; x < w; x++) {
    const s = (y * w + x) * bpp
    const d = dstRow + (ox + x) * 4
    canvas[d] = pix[s]
    canvas[d + 1] = pix[s + 1]
    canvas[d + 2] = pix[s + 2]
    canvas[d + 3] = bpp === 4 ? pix[s + 3] : 255
  }
}

// --- encode RGBA PNG ---
const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})
const crc32 = (b) => {
  let c = 0xffffffff
  for (const x of b) c = crcTable[(c ^ x) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
const chunk = (type, data) => {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, "ascii"), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}
const outIhdr = Buffer.alloc(13)
outIhdr.writeUInt32BE(S, 0)
outIhdr.writeUInt32BE(S, 4)
outIhdr[8] = 8
outIhdr[9] = 6 // RGBA

const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk("IHDR", outIhdr),
  chunk("IDAT", zlib.deflateSync(canvas, { level: 9 })),
  chunk("IEND", Buffer.alloc(0))
])
fs.writeFileSync(DST, png)
console.log(`${SRC} ${w}×${h} → ${DST} ${S}×${S} (${png.length} bytes)`)
