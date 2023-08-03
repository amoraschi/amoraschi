import { createCanvas } from 'canvas'

function isSunRising (azimuth) {
  return azimuth > 180
}

function generateSun (sun, weather) {
  const canvas = createCanvas(500, 300, 'svg')
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, 500, 300)

  ctx.strokeStyle = 'white'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, 150)
  ctx.lineTo(500, 150)
  ctx.stroke()

  ctx.strokeStyle = 'white'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.ellipse(250, 150, 200, 100, 0, 0, Math.PI, true)
  ctx.stroke()

  ctx.strokeStyle = 'white'
  ctx.beginPath()
  ctx.ellipse(250, 150, 200, 100, 0, Math.PI, Math.PI * 2, true)
  ctx.setLineDash([5, 5])
  ctx.stroke()
  ctx.setLineDash([])

  ctx.lineWidth = 2

  console.log(sun.sun_azimuth, sun.sun_altitude)
  
  const x = isSunRising(sun.sun_azimuth) ? 250 + 200 * Math.cos(sun.sun_altitude * Math.PI / 180) : 250 + 200 * -Math.cos(sun.sun_altitude * Math.PI / 180)
  const y = 150 - 100 * Math.sin(sun.sun_altitude * Math.PI / 180)

  if (sun.sun_altitude >= 0) {
    ctx.fillStyle = 'yellow'
  } else {
    ctx.strokeStyle = 'white'
  }

  ctx.beginPath()
  ctx.ellipse(x, y, 10, 10, 0, 0, Math.PI * 2)
  if (sun.sun_altitude >= 0) {
    ctx.fill()
  } else {
    ctx.stroke()
  }

  ctx.strokeStyle = 'white'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(250, 150)
  ctx.lineTo(x, y)
  ctx.stroke()

  ctx.fillStyle = 'white'
  ctx.font = 'bold 15px monospace'
  const minusX = 490 - ctx.measureText(weather.sun.set).width
  ctx.fillText(weather.sun.rise, 10, 80)
  ctx.fillText(weather.sun.set, minusX, 80)

  return canvas.toBuffer()
}

export {
  generateSun
}
