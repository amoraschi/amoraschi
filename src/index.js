import { writeFileSync } from 'fs'
import { createCanvas } from 'canvas'
// import SUN from 'suncalc'

const { width, height } = { width: 900, height: 600 }

;(async () => {
  const canvas = createCanvas(width, height, 'png')
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#86ddfa'
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = '#a3fa86'
  ctx.fillRect(0, height / 2, width, height / 2)

  const buffer = canvas.toBuffer('image/png')

  writeFileSync('data/sun.png', buffer)
})()
