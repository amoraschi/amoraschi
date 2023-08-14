import { config } from 'dotenv'
import fetch from 'node-fetch'
import Octo from '@octokit/core'
import { createPullRequest } from 'octokit-plugin-create-pull-request'
import { generateChart } from './generateChart.js'
import { fetchReadme } from './getSHA.js'
import { generateReadme } from './generateReadme.js'
import { findPosition, getUVIndex } from './utils.js'
import { generateSun } from './generateSun.js'

config()
const startTime = new Date().getTime()

async function fetchWeather () {
  const res = await fetch(`http://api.weatherapi.com/v1/forecast.json?key=${process.env.KEY}&q=${process.env.POS}`)
  const parsed = await res.json()

  const day = parsed.forecast.forecastday[0].day
  const current = parsed.current
  const astro = parsed.forecast.forecastday[0].astro
  const hour = parsed.forecast.forecastday[0].hour

  return {
    localtime: parsed.location.localtime_epoch,
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

async function fetchSolarData () {
  const latlong = {
    lat: process.env.POS.split(',')[0],
    long: process.env.POS.split(',')[1]
  }

  const res = await fetch(`https://api.ipgeolocation.io/astronomy?apiKey=${process.env.SUNKEY}&lat=${latlong.lat}&long=${latlong.long}`)
  const parsed = await res.json()

  return parsed
}

async function updateFiles (oldReadme, weather, images, drawing) {
  const Octokit = Octo.Octokit.plugin(createPullRequest)
  const octokit = new Octokit({ auth: process.env.PERSTOKEN })
  const oldContent = Buffer.from(oldReadme.content, 'base64').toString('utf-8')
  const position = findPosition(oldContent)
  const newContent = oldContent.slice(0, position.start) + generateReadme(weather) + oldContent.slice(position.end)

  const branchName = `update-${weather.localtime}`
  const prTitle = `Weather update for ${weather.lastupdate}`
  const prBody = `Updates the weather data and images for ${weather.lastupdate}`
  
  const sha = await octokit.request('GET /repos/{owner}/{repo}/git/refs/heads/{branch}', {
    owner: 'amoraschi',
    repo: 'amoraschi',
    branch: 'master'
  }).then(res => res.data.object.sha)

  await sleep(1000)

  await octokit.request('POST /repos/{owner}/{repo}/git/refs', {
    owner: 'amoraschi',
    repo: 'amoraschi',
    ref: `refs/heads/${branchName}`,
    sha: sha
  })

  await sleep(1000)

  console.log('Creating the PR')
  const pr = await octokit.createPullRequest({
    owner: 'amoraschi',
    repo: 'amoraschi',
    title: prTitle,
    body: prBody,
    head: branchName,
    changes: [
      {
        files: {
          'data/hourly.svg': {
            content: images.toString('base64'),
            encoding: 'base64'
          },
          'data/drawing.svg': {
            content: Buffer.from(drawing).toString('base64'),
            encoding: 'base64'
          },
          'README.md': {
            content: Buffer.from(newContent).toString('base64'),
            encoding: 'base64'
          }
        },
        commit: `Weather update for ${weather.lastupdate}`
      }
    ]
  })

  await sleep(5000)

  console.log('Merging the PR')
  await octokit.request('PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge', {
    owner: 'amoraschi',
    repo: 'amoraschi',
    pull_number: pr.data.number,
    commit_title: `Weather update for ${weather.lastupdate}`,
    commit_message: `Weather update for ${weather.lastupdate}`,
    sha: pr.data.head.sha,
    merge_method: 'merge'
  })

  await sleep(1000)

  console.log('Removing the branch')
  await octokit.request('DELETE /repos/{owner}/{repo}/git/refs/{ref}', {
    owner: 'amoraschi',
    repo: 'amoraschi',
    ref: `heads/${branchName}`
  })

  console.log(`Updated readme and image for ${weather.lastupdate}`)
  console.log(`Time taken: ${((new Date().getTime() - startTime) / 1000).toFixed(2)} seconds`)
}

async function updateAll () {
  console.log('Fetching weather and image')
  const weather = await fetchWeather()
  const images = await generateChart(weather.hours)

  console.log('Fetching old readme and image')
  const oldReadme = await fetchReadme()

  console.log('Fetching solar data')
  const date = new Date(weather.localtime * 1000)
  const drawing = await generateSun(date, process.env.POS)

  await updateFiles(oldReadme, weather, images, drawing)
}

async function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

updateAll()
