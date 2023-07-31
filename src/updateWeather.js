import { config } from 'dotenv'
import fetch from 'node-fetch'
import { Octokit } from '@octokit/core'
import { getChart } from './getChart.js'
import { fetchImage, fetchReadme } from './getSHA.js'
import { generateReadme } from './generateReadme.js'
import { findPosition, getUVIndex } from './utils.js'

config()

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

async function updateFiles (oldReadme, weather, image, oldImage) {
  const octokit = new Octokit({ auth: process.env.PERSTOKEN })
  const oldContent = Buffer.from(oldReadme.content, 'base64').toString('utf-8')
  const position = findPosition(oldContent)
  const newContent = oldContent.slice(0, position.start) + generateReadme(weather) + oldContent.slice(position.end)

  console.log('Updating image')
  await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
    owner: 'amoraschi',
    repo: 'amoraschi',
    path: 'data/hourly.png',
    message: `Image update for ${weather.lastupdate}`,
    content: image,
    sha: oldImage.sha
  })

  await sleep(2500)

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
  const image = await getChart(weather.hours)

  console.log('Fetching old readme and image')
  const oldReadme = await fetchReadme()
  const oldImage = await fetchImage()

  await updateFiles(oldReadme, weather, image, oldImage)
}

async function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

updateAll()
