import { config } from 'dotenv'
import fetch from 'node-fetch'

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

console.log(await fetchWeather())
