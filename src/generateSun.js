import { createCanvas } from 'canvas'
// import { writeFileSync } from 'fs'

function isDay (azimuth) {
  return azimuth < 360 && azimuth >= 180
}

// generateSun({ sun_azimuth: 190 }, { sun: { rise: '09:00 AM', set: '09:00 PM' } })

// for (let i = 0; i < 720; i+=5) {
//   if (i === 360) {
//     i = 0
//   }

//   const sun = { sun_azimuth: i }
//   const weather = { sun: { rise: '09:00 AM', set: '09:00 PM' } }
//   generateSun(sun, weather)
//   await new Promise(resolve => setTimeout(resolve, 250))
// }

function generateSun (sun, weather) {
  const adjustedAzimuth = sun.sun_azimuth + 90

  const width = 500
  const height = 300

  const canvas = createCanvas(width, height, 'svg')
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#87a0fa'
  ctx.fillRect(0, 0, width, height)

  ctx.strokeStyle = 'white'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, height / 2)
  ctx.lineTo(width, height / 2)
  ctx.stroke()

  const azimuthRad = (adjustedAzimuth * Math.PI / 180) > Math.PI * 2 ? ((adjustedAzimuth * Math.PI / 180) - Math.PI * 2) : (adjustedAzimuth * Math.PI / 180)
  const startAngleRad = isDay(adjustedAzimuth) ? Math.PI : 0
  const endAngleRad = isDay(adjustedAzimuth) ? Math.PI : 0

  const x = (width / 2) + 200 * Math.cos(adjustedAzimuth * Math.PI / 180)
  const y = (height / 2) + 100 * Math.sin(adjustedAzimuth * Math.PI / 180)

  ctx.fillStyle = 'black'
  ctx.fillRect(0, height / 2, width, height / 2)

  if (adjustedAzimuth % 90 !== 0) {
    ctx.lineWidth = 1

    ctx.strokeStyle = isDay(adjustedAzimuth) ? 'yellow' : 'white'
    ctx.beginPath()
    ctx.ellipse(width / 2, height / 2, 200, 100, 0, startAngleRad, azimuthRad)
    ctx.stroke()

    ctx.strokeStyle = 'white'
    ctx.beginPath()
    ctx.ellipse(width / 2, height / 2, 200, 100, 0, azimuthRad, endAngleRad)
    ctx.setLineDash([5, 5])
    ctx.stroke()
    ctx.setLineDash([])
  }

  if (isDay(adjustedAzimuth)) {
    ctx.fillStyle = 'yellow'
    ctx.strokeStyle = 'yellow'
  } else {
    ctx.fillStyle = 'white'
    ctx.strokeStyle = 'white'
  }

  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.ellipse(x, y, 10, 10, 0, 0, Math.PI * 2)
  ctx.fill()

  if (isDay(adjustedAzimuth)) {
    for (let i = 0; i < 360; i += 30) {
      const x1 = x + 15 * Math.cos(i * Math.PI / 180)
      const y1 = y + 15 * Math.sin(i * Math.PI / 180)
      const x2 = x + 20 * Math.cos(i * Math.PI / 180)
      const y2 = y + 20 * Math.sin(i * Math.PI / 180)
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
    }
  }

  ctx.fillStyle = 'black'
  ctx.font = 'bold 15px Arial'
  const minusX = 490 - ctx.measureText(weather.sun.set).width
  ctx.fillText(weather.sun.rise, 10, 75)
  ctx.fillText(weather.sun.set, minusX, 75)

  // writeFileSync('test.png', canvas.toBuffer())
  // return
  return canvas.toBuffer()
}

export {
  generateSun
}
