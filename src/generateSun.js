import SunCalc from 'suncalc'
import { createCanvas, Image } from 'canvas'
// import { writeFileSync } from 'fs'
import { getMoon } from './getMoon.js'

const width = 900
const height = 600

// let j = 0
// let k = 0
// for (let i = 0; i < 365; i++) {
//   if (i > 30) {
//     i = 0
//     j++
//   }

//   if (j > 11) {
//     j = 0
//   }

//   k++
//   if (k > 23) {
//     k = 0
//   }

//   console.log(i, j)
//   const now = new Date(2023, j, i, k, 0, 0)
//   generateSun(now)
//   await new Promise(resolve => setTimeout(resolve, 250))
// }

// generateSun(new Date(), '37.39,-6')
async function generateSun (now, pos) {
  const location = {
    latitude: parseFloat(pos.split(',')[0]),
    longitude: parseFloat(pos.split(',')[1])
  }

  const localDate = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Europe/Madrid' })
  const localHour = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/Madrid' })
  const moon = await getMoon()

  // const canvas = createCanvas(width, height)
  const canvas = createCanvas(width, height, 'svg')
  const ctx = canvas.getContext('2d')

  // Background
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, width, height)

  // Solar Data
  // function middleDate (date1, date2) {
  //   const diff = date2.getTime() - date1.getTime()
  //   return new Date(date1.getTime() + diff / 2)
  // }

  function getSolarPosition (date, deg) {
    const position = SunCalc.getPosition(date, location.latitude, location.longitude)
    return {
      azimuth: deg ? position.azimuth * 180 / Math.PI : position.azimuth,
      altitude: deg ? position.altitude * 180 / Math.PI : position.altitude
    }
  }

  function getSolarTimes (date) {
    return SunCalc.getTimes(date, location.latitude, location.longitude)
  }

  function getSolarData (date) {
    const times = getSolarTimes(date)
    const positions = Object.keys(times).reduce((acc, key) => {
      acc[key] = getSolarPosition(times[key])
      acc[key].time = times[key]
      return acc
    }, {})

    return positions
  }

  function getLunarPosition (date, deg) {
    const position = SunCalc.getMoonPosition(date, location.latitude, location.longitude)
    return {
      azimuth: deg ? position.azimuth * 180 / Math.PI : position.azimuth,
      altitude: deg ? position.altitude * 180 / Math.PI : position.altitude,
      distance: position.distance,
      parallacticAngle: position.parallacticAngle
    }
  }

  function getLunarTimes (date) {
    return SunCalc.getMoonTimes(date, location.latitude, location.longitude)
  }

  function getLunarIllumination (date) {
    return SunCalc.getMoonIllumination(date)
  }

  function getLunarPhase (phase) {
    if (phase === 0 || phase === 1) {
      return 'New Moon'
    } else if (phase > 0 && phase < 0.25) {
      return 'Waxing Crescent'
    } else if (phase === 0.25) {
      return 'First Quarter'
    } else if (phase > 0.25 && phase < 0.5) {
      return 'Waxing Gibbous'
    } else if (phase === 0.5) {
      return 'Full Moon'
    } else if (phase > 0.5 && phase < 0.75) {
      return 'Waning Gibbous'
    } else if (phase === 0.75) {
      return 'Last Quarter'
    } else if (phase > 0.75 && phase < 1) {
      return 'Waning Crescent'
    }
  }

  function toTitleCase (str) {
    return str.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
  }

  // White Circumference
  ctx.strokeStyle = 'white'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(width / 2, height / 2, 200, 0, 2 * Math.PI)
  ctx.stroke()
  ctx.lineWidth = 1

  const solarData = getSolarData(now)
  // GoldenHourEnd-GoldenHour
  const goldenHourEnd = solarData.goldenHourEnd
  const goldenHour = solarData.goldenHour
  // Sunrise-GoldenHourEnd, GoldenHour-Sunset
  const sunrise = solarData.sunrise
  const sunset = solarData.sunset
  // Skip sunriseEnd and sunsetStart
  // Dawn-Sunrise, Sunset-Dusk
  const dawn = solarData.dawn
  const dusk = solarData.dusk
  // NauticalDawn-Dawn, Dusk-NauticalDusk
  const nauticalDawn = solarData.nauticalDawn
  const nauticalDusk = solarData.nauticalDusk
  // NightEnd-NauticalDawn, NauticalDusk-Night
  const nightEnd = solarData.nightEnd
  const night = solarData.night

  function drawArc (from, to, color) {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(width / 2, height / 2, 200, from.azimuth - Math.PI / 2, to.azimuth - Math.PI / 2)
    ctx.lineTo(width / 2, height / 2)
    ctx.fill()
  }

  const segments = [
    { from: sunrise, to: sunset, color: '#87a0fa' },
    { from: sunrise, to: goldenHourEnd, color: '#5c7df9' },
    { from: goldenHour, to: sunset, color: '#5c7df9' },
    { from: dawn, to: sunrise, color: '#2c4cf9' },
    { from: sunset, to: dusk, color: '#2c4cf9' },
    { from: nauticalDawn, to: dawn, color: '#0c1ef9' },
    { from: dusk, to: nauticalDusk, color: '#0c1ef9' },
    { from: nightEnd, to: nauticalDawn, color: '#000040' },
    { from: nauticalDusk, to: night, color: '#000040' }
  ]

  segments.forEach(segment => drawArc(segment.from, segment.to, segment.color))

  // Line And Name For Position
  Object.keys(solarData).forEach(key => {
    if (key === 'sunriseEnd' || key === 'sunsetStart') return
    const position = solarData[key]
    const x = Math.cos(position.azimuth - Math.PI / 2) * 200
    const y = Math.sin(position.azimuth - Math.PI / 2) * 200
    ctx.beginPath()
    ctx.moveTo(width / 2, height / 2)
    ctx.lineTo(width / 2 + x, height / 2 + y)
    ctx.stroke()

    // Name And Date
    ctx.fillStyle = 'white'
    ctx.font = 'bold 15px Arial'
    const localString = position.time.toLocaleString('en-US', { timeZone: 'Europe/Madrid', hour12: false })
    const props = {
      hours: localString.split(',')[1].split(':')[0],
      minutes: localString.split(',')[1].split(':')[1]
    }

    let text = toTitleCase(key)
    if (x < 0) {
      text += ' - ' + props.hours + ':' + props.minutes
    } else {
      text = props.hours + ':' + props.minutes + ' - ' + text
    }

    const textWidth = ctx.measureText(text).width
    const separation = 30
    if (key === 'solarNoon' || key === 'nadir') {
      ctx.fillText(text, width / 2 + x - textWidth / 2, height / 2 + y + (y > 0 ? 35 : -25))
    } else {
      ctx.fillText(text, width / 2 + x + (x > 0 ? separation : -separation) + (x > 0 ? 0 : -textWidth), height / 2 + y + y * 0.25)
    }
  })

  // Moon
  const moonPosition = getLunarPosition(now)
  const moonX = Math.cos(moonPosition.azimuth - Math.PI / 2) * 200
  const moonY = Math.sin(moonPosition.azimuth - Math.PI / 2) * 200
  ctx.fillStyle = '#e0e0e0'
  ctx.beginPath()
  ctx.arc(width / 2 + moonX, height / 2 + moonY, 12.5, 0, 2 * Math.PI)
  ctx.fill()

  // Moon Phase
  const moonPhase = getLunarIllumination(now)
  ctx.fillStyle = '#000000'
  ctx.beginPath()
  ctx.arc(width / 2 + moonX, height / 2 + moonY, 11.5, 2 * Math.PI * moonPhase.fraction, 0)
  ctx.fill()

  // Moon phase text
  ctx.fillStyle = 'white'
  ctx.font = 'bold 15px Arial'
  const moonPhaseText = toTitleCase(getLunarPhase(moonPhase.phase)) + ` - ${Math.round(moonPhase.fraction * 100)}%`
  const moonPhaseTextWidth = ctx.measureText(moonPhaseText).width
  ctx.fillText(moonPhaseText, 7.5, height - 10, moonPhaseTextWidth)

  // Sun
  const sunPosition = getSolarPosition(now)
  const sunX = Math.cos(sunPosition.azimuth - Math.PI / 2) * 200
  const sunY = Math.sin(sunPosition.azimuth - Math.PI / 2) * 200
  if (sunPosition.altitude > 0) {
    ctx.fillStyle = 'yellow'
    ctx.strokeStyle = 'yellow'
    ctx.lineWidth = 2
    for (let i = 0; i < 360; i += 30) {
      const x1 = width / 2 + sunX + 20 * Math.cos(i * Math.PI / 180)
      const y1 = height / 2 + sunY + 20 * Math.sin(i * Math.PI / 180)
      const x2 = width / 2 + sunX + 25 * Math.cos(i * Math.PI / 180)
      const y2 = height / 2 + sunY + 25 * Math.sin(i * Math.PI / 180)
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
    }

    ctx.lineWidth = 1
  } else {
    ctx.fillStyle = '#707000'
  }

  ctx.beginPath()
  ctx.arc(width / 2 + sunX, height / 2 + sunY, 15, 0, 2 * Math.PI)
  ctx.fill()

  // Date And Hour
  ctx.fillStyle = 'white'
  ctx.font = 'bold 15px Arial'
  const dateWidth = ctx.measureText(localDate).width
  const hourWidth = ctx.measureText(localHour).width
  ctx.fillText(localDate, width - dateWidth - 10, height - 10)
  ctx.fillText(localHour, width - hourWidth - 10, height - 25 - 10)

  // Moon
  const svg = new Image()
  const image = new Image()
  svg.onload = () => ctx.drawImage(svg, 10, 10, 100, 100)
  image.onload = () => ctx.drawImage(image, 10, 10, 100, 100)

  svg.src = `data:content/type;base64,${moon.svg}`
  image.src = `data:content/type;base64,${moon.image}`

  // writeFileSync('test.png', canvas.toBuffer())
  return canvas.toBuffer()
}

export {
  generateSun
}
