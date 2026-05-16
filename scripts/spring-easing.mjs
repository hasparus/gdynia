// Generates the CSS linear() spring easing used by the copy toast in
// background.ts. Samples a damped-spring step response into linear() points.
// Run: bun scripts/spring-easing.mjs
const z = 0.55 // damping ratio — lower is bouncier (0.55 ≈ 12% overshoot)
const wn = 4 / z // natural frequency — settles to ~2% at normalized t = 1
const wd = wn * Math.sqrt(1 - z * z) // damped frequency
const k = z / Math.sqrt(1 - z * z)
const N = 24 // sample count

const pts = []
for (let i = 0; i <= N; i++) {
  const t = i / N
  const x =
    i === N
      ? 1
      : 1 - Math.exp(-z * wn * t) * (Math.cos(wd * t) + k * Math.sin(wd * t))
  pts.push(Math.round(x * 1e4) / 1e4)
}

console.log(`linear(${pts.join(",")})`)
console.error(`overshoot peak: ${Math.max(...pts).toFixed(4)}`)
