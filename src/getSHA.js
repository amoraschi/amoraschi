import fetch from 'node-fetch'

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

export {
  fetchReadme,
  fetchImage
}
