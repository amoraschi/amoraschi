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
  const current = parsed.current
  const astro = parsed.forecast.forecastday[0].astro

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
  const date = weather.date.split('-').join(' - ')

  return '<!-- WEATHER -->\n' +
  '<p align="center">\n' +
  `  <img src="https:${weather.condition.icon}" alt="Weather icon">\n` +
  '  <br />\n' +
  `  <strong>${date}</strong>\n` +
  '  <br />\n' +
  '  <strong>Today\'s forecast</strong>\n' +
  '  <br />\n' +
  `  ${weather.condition.text} - ${weather.temperature.currentcs} ºC (${weather.temperature.currentft} ºF)\n` +
  `  <p align="center">🔼 ${weather.temperature.maxcs} ºC (${weather.temperature.maxft} ºF) 🔽 ${weather.temperature.mincs} ºC (${weather.temperature.minft} ºF)</p>\n` +
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
    message: `Weather update for ${weather.last_updated}`,
    content: Buffer.from(newContent).toString('base64'),
    sha: readme.sha
  })

  console.log(`Updated readme for ${weather.date}`)
}

async function updateAll () {
  console.log('Fetching weather')
  const weather = await fetchWeather()
  console.log('Fetching readme')
  const readme = await fetchReadme()

  await updateReadme(readme, weather)
}

updateAll()
