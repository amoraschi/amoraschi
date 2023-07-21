import { config } from 'dotenv'
import fetch from 'node-fetch'
import { Octokit } from '@octokit/core'

config()

function getUVIndex (index) {
  return index <= 2 ? 'Low' : ((index >= 3 && index <= 5) ? 'Moderate' : ((index >= 6 && index <= 7) ? 'High' : ((index >= 8 && index <= 10) ? 'Very High' : 'Extreme')))
} 

async function fetchWeather () {
  const res = await fetch(`http://api.weatherapi.com/v1/forecast.json?key=${process.env.KEY}&q=${process.env.POS}`)
  const parsed = await res.json()
  const day = parsed.forecast.forecastday[0].day
  const astro = parsed.forecast.forecastday[0].astro

  return {
    temperature: {
      maxcs: day.maxtemp_c,
      maxft: day.maxtemp_f,
      mincs: day.mintemp_c,
      minft: day.mintemp_f
    },
    maxwind: {
      kph: day.maxwind_kph,
      mph: day.maxwind_mph
    },
    precipitation: {
      mm: day.totalprecip_mm,
      in: day.totalprecip_in
    },
    avgvisibility: {
      km: day.avgvis_km,
      miles: day.avgvis_miles
    },
    avghumidity: day.avghumidity,
    uv: {
      index: day.uv,
      text: getUVIndex(day.uv)
    },
    condition: {
      text: day.condition.text,
      icon: day.condition.icon
    },
    sun: {
      rise: astro.sunrise,
      set: astro.sunset
    },
    moon: {
      phase: astro.moon_phase,
      illumination: astro.moon_illumination
    }
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

function findPosition (content) {
  const start = content.indexOf('<!-- WEATHER -->')
  const end = content.indexOf('<!-- WEATHER END -->')

  return {
    start,
    end
  }
}

function newData (weather) {
  return '<!-- WEATHER -->\n' +
  '<p align="center">\n' +
  `  <img src="https:${weather.condition.icon}" alt="Weather icon">\n` +
  '  <br />\n' +
  '  <strong>Today\'s forecast</strong>\n' +
  '  <br />\n' +
  `  ${weather.condition.text}\n` +
  `  <p align="center">🔼 ${weather.temperature.maxcs} ºC (${weather.temperature.maxft} ºF) 🔽 ${weather.temperature.mincs} ºC (${weather.temperature.minft} ºF)</p>\n` +
  '  <p align="center">\n' +
  `    Wind - ${weather.maxwind.kph} km/h (${weather.maxwind.mph} miles/h)\n` +
  '    <br />\n' +
  `    Precipitation - ${weather.precipitation.mm} mm (${weather.precipitation.in} in)\n` +
  '    <br />\n' +
  `    Visibility - ${weather.avgvisibility.km} km (${weather.avgvisibility.miles} miles)\n` +
  '    <br />\n' +
  `    Humidity - ${weather.avghumidity}%\n` +
  '    <br />\n' +
  `    UV Index - ${weather.uv.index} (${weather.uv.text})\n` +
  '  </p>\n' +
  '  <p align="center">\n' +
  `    Sunrise - ${weather.sun.rise}\n` +
  '    <br />\n' +
  `    Sunset - ${weather.sun.set}\n` +
  '    <br />\n' +
  `    Moon phase - ${weather.moon.phase}\n` +
  '    <br />\n' +
  `    Moon illumination - ${weather.moon.illumination}%\n` +
  '  </p>\n' +
  '</p>\n'
}

async function updateReadme (readme, weather) {
  const octokit = new Octokit({ auth: process.env.PERSTOKEN })
  const oldContent = Buffer.from(readme.content, 'base64').toString('utf-8')
  const position = findPosition(oldContent)
  const newContent = oldContent.slice(0, position.start) + newData(weather) + oldContent.slice(position.end)

  console.log('Updating readme')
  await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
    owner: 'amoraschi',
    repo: 'amoraschi',
    path: 'README.md',
    message: 'Update weather',
    content: Buffer.from(newContent).toString('base64'),
    sha: readme.sha
  })

  console.log('Updated readme')
}

async function main () {
  console.log('Fetching weather')
  const weather = await fetchWeather()
  console.log('Fetching readme')
  const readme = await fetchReadme()

  await updateReadme(readme, weather)
}

main()
