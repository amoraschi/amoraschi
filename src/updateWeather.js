import { config } from 'dotenv'
import fetch from 'node-fetch'
import { Octokit } from '@octokit/core'
import { ChartJSNodeCanvas } from 'chartjs-node-canvas'
import { writeFileSync } from 'fs'

config()

function getUVIndex (index) {
  return index <= 2 ? 'Low' : ((index >= 3 && index <= 5) ? 'Moderate' : ((index >= 6 && index <= 7) ? 'High' : ((index >= 8 && index <= 10) ? 'Very High' : 'Extreme')))
} 

async function fetchWeather () {
  const res = await fetch(`http://api.weatherapi.com/v1/forecast.json?key=${process.env.KEY}&q=${process.env.POS}`)
  const parsed = await res.json()

  const day = parsed.forecast.forecastday[0].day
  const current = parsed.current
  const astro = parsed.forecast.forecastday[0].astro
  const hour = parsed.forecast.forecastday[0].hour

  return {
    lastupdate: current.last_updated,
    date: parsed.forecast.forecastday[0].date,
    temperature: {
      maxcs: day.maxtemp_c,
      maxft: day.maxtemp_f,
      mincs: day.mintemp_c,
      minft: day.mintemp_f,
      currentcs: current.temp_c,
      currentft: current.temp_f
    },
    wind: {
      kph: current.wind_kph,
      mph: current.wind_mph,
      direction: current.wind_dir,
      degree: current.wind_degree
    },
    precipitation: {
      mm: current.precip_mm,
      in: current.precip_in
    },
    visibility: {
      km: current.vis_km,
      miles: current.vis_miles
    },
    humidity: current.humidity,
    uv: {
      index: current.uv,
      text: getUVIndex(current.uv)
    },
    condition: {
      text: current.condition.text,
      icon: current.condition.icon
    },
    sun: {
      rise: astro.sunrise,
      set: astro.sunset
    },
    moon: {
      phase: astro.moon_phase,
      illumination: astro.moon_illumination
    },
    hours: hour.map(h => {
      return {
        time: new Date(h.time).getHours(),
        tempcs: h.temp_c,
        tempft: h.temp_f,
        condition: {
          text: h.condition.text,
          icon: h.condition.icon
        },
        wind: {
          kph: h.wind_kph,
          mph: h.wind_mph
        },
        precipitation: {
          mm: h.precip_mm,
          in: h.precip_in
        },
        humidity: h.humidity,
        uv: h.uv
      }
    })
  }
}

async function fetchReadme () {
  const res = await fetch('https://api.github.com/repos/amoraschi/amoraschi/contents/README.md')
  const parsed = await res.json()

  return {
    sha: parsed.sha,
    content: parsed.content
  }
}

async function fetchImage () {
  const res = await fetch('https://api.github.com/repos/amoraschi/amoraschi/contents/data/hourly.png')
  const parsed = await res.json()

  return {
    sha: parsed.sha
  }
}

function findPosition (content) {
  const start = content.indexOf('<!-- WEATHER -->')
  const end = content.indexOf('<!-- WEATHER END -->')

  return {
    start,
    end
  }
}

function newData (weather) {
  const date = weather.lastupdate.replace(/-/g, '/')
  const currentHours = weather.hours.slice(new Date().getHours())

  return '<!-- WEATHER -->\n' +
  '<p align="center">\n' +
  '  <a href="https://www.weatherapi.com/" target="_blank">\n' +
  `    <img src="https:${weather.condition.icon}" alt="Weather icon">\n` +
  '  </a>\n' +
  '  <br />\n' +
  `  <strong>${date}</strong>\n` +
  '  <br />\n' +
  '  <strong>Today\'s forecast</strong>\n' +
  '  <br />\n' +
  `  ${weather.condition.text} - ${weather.temperature.currentcs} ºC (${weather.temperature.currentft} ºF)\n` +
  `  <p align="center">🔼 ${weather.temperature.maxcs} ºC (${weather.temperature.maxft} ºF) 🔽 ${weather.temperature.mincs} ºC (${weather.temperature.minft} ºF)</p>\n` +
  '  <details align="center">\n' +
  '    <summary>🕐 Hourly forecast</summary>\n' +
  '    <table align="center">\n' +
  '      <thead>\n' +
  '        <tr>\n' +
    currentHours.map(h => 
  `          <th>${h.time}:00</th>\n`).join('') +
  '        </tr>\n' +
  '      </thead>\n' +
  '      <tbody>\n' +
  '        <tr>\n' +
    currentHours.map(h =>
  `          <td><img src="https:${h.condition.icon}" alt="Weather icon"><br />${h.condition.text}<br />${h.tempcs} ºC (${h.tempft} ºF)</td>\n`).join('') +
  '        </tr>\n' +
  '      </tbody>\n' +
  '    </table>\n' +
  '    <a href="https://www.weatherapi.com/" target="_blank">\n' +
  '      <img src="https://raw.githubusercontent.com/amoraschi/amoraschi/master/data/hourly.png" alt="Hourly forecast">\n' +
  '    </a>\n' +
  '  </details>\n' +
  '  <details align="center">\n' +
  '    <summary>⛅ Weather information</summary>\n' +
  '    <p align="center">\n' +
  `      Wind - ${weather.wind.direction} ${weather.wind.kph} km/h (${weather.wind.mph} miles/h)\n` +
  '      <br />\n' +
  `      Precipitation - ${weather.precipitation.mm} mm (${weather.precipitation.in} in)\n` +
  '      <br />\n' +
  `      Visibility - ${weather.visibility.km} km (${weather.visibility.miles} miles)\n` +
  '      <br />\n' +
  `      Humidity - ${weather.humidity}%\n` +
  '      <br />\n' +
  `      UV Index - ${weather.uv.index} (${weather.uv.text})\n` +
  '    </p>\n' +
  '  </details>\n' +
  '  <details align="center">\n' +
  '    <summary>🌍 Planetary information</summary>\n' +
  '    <p align="center">\n' +
  `      Sunrise - ${weather.sun.rise}\n` +
  '      <br />\n' +
  `      Sunset - ${weather.sun.set}\n` +
  '      <br />\n' +
  `      Moon phase - ${weather.moon.phase}\n` +
  '      <br />\n' +
  `      Moon illumination - ${weather.moon.illumination}%\n` +
  '    </p>\n' +
  '  </details>\n' +
  '</p>\n'
}

async function getImage (hours) {
  const width = 600
  const height = 300
  const backgroundColour = 'black'

  const config = {
    type: 'line',
    data: {
      labels: hours.map(d => `${d.time}:00`),
      datasets: [
        {
          label: 'º Celsius',
          data: hours.map(d => d.tempcs),
          borderColor: [ 'rgba(255, 99, 132, 1)' ],
          backgroundColor: [ 'rgba(255, 99, 132, 0.2)' ],
          yAxisID: 'celsius'
        },
        {
          label: 'º Fahrenheit',
          data: hours.map(d => d.tempft),
          borderColor: [ 'rgba(54, 162, 235, 1)' ],
          backgroundColor: [ 'rgba(54, 162, 235, 0.2)' ],
          yAxisID: 'fahrenheit'
        }
      ],
      borderWidth: 1
    },
    options: {
      animation: false,
      scales: {
        celsius: {
          type: 'linear',
          position: 'left',
          ticks: {
            callback: (value) => ` ${value}ºC`
          }
        },
        fahrenheit: {
          type: 'linear',
          position: 'right',
          ticks: {
            callback: (value) => `${value}ºF`
          }
        }
      }
    },
    plugins: [{
      id: 'background-colour',
      beforeDraw: (chart) => {
        const ctx = chart.ctx
        ctx.save()
        ctx.fillStyle = backgroundColour
        ctx.fillRect(0, 0, width, height)
        ctx.restore()
      }
    }]
  }

  const chartCallback = (ChartJS) => {
    ChartJS.defaults.responsive = true
    ChartJS.defaults.maintainAspectRatio = true
    // font color
    ChartJS.defaults.color = 'white'
  }

  const chart = new ChartJSNodeCanvas({ width, height, chartCallback })

  const buffer = await chart.renderToBuffer(config)
  return buffer.toString('base64')
}

async function updateFiles (oldReadme, weather, image, oldImage) {
  const octokit = new Octokit({ auth: process.env.PERSTOKEN })
  const oldContent = Buffer.from(oldReadme.content, 'base64').toString('utf-8')
  const position = findPosition(oldContent)
  const newContent = oldContent.slice(0, position.start) + newData(weather) + oldContent.slice(position.end)

  // writeFileSync('TEST.md', newContent)
  // return

  console.log('Updating image')
  await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
    owner: 'amoraschi',
    repo: 'amoraschi',
    path: 'data/hourly.png',
    message: `Image update for ${weather.lastupdate}`,
    content: image,
    sha: oldImage.sha
  })

  console.log('Updating readme')
  await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
    owner: 'amoraschi',
    repo: 'amoraschi',
    path: 'README.md',
    message: `Weather update for ${weather.lastupdate}`,
    content: Buffer.from(newContent).toString('base64'),
    sha: oldReadme.sha
  })

  console.log(`Updated readme and image for ${weather.lastupdate}`)
}

async function updateAll () {
  console.log('Fetching weather and image')
  const weather = await fetchWeather()
  const image = await getImage(weather.hours)

  // writeFileSync('weather.json', JSON.stringify(weather, null, 2))
  // return

  console.log('Fetching old readme and image')
  const oldReadme = await fetchReadme()
  const oldImage = await fetchImage()

  await updateFiles(oldReadme, weather, image, oldImage)
}

updateAll()
