import fetch from 'node-fetch'

const config = {
  lang: 'en',
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  size: 500,
  lightColor: '#f0f0ff',
  shadeColor: '#202020',
  sizeQuarter: 100,
  texturize: true
}

async function getMoon () {
  const string = `https://www.icalendar37.net/lunar/api/?${Object.keys(config).map(key => `${key}=${encodeURIComponent(config[key])}`).join('&')}&LDZ=${new Date(config.year, config.month - 1, 1) / 1000}`
  const res = await fetch(string, {
    headers: {
      'Content-Type': 'image/svg+xml'
    }
  })

  const json = await res.json()
  const today = new Date().getDate()
  const moonPhase = json.phase[today]

  const image = await fetch('https://raw.githubusercontent.com/amoraschi/amoraschi/master/data/cover.png')
  const base64 = await image.arrayBuffer()
  const decoded = Buffer.from(base64).toString('base64')

  const sanitizedString = moonPhase.svg.replace(/xlink:href/g, 'href')
  const xmlns = sanitizedString.replace(/<svg /, '<svg xmlns="http://www.w3.org/2000/svg" ')
  const toReturn = xmlns.replace(/href="(.*)"><\/image>/, `href="data:content/type;base64,${decoded}"></image>`)

  return toReturn
}

export {
  getMoon
}
