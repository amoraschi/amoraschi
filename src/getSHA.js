import fetch from 'node-fetch'

async function fetchReadme () {
  const res = await fetch('https://api.github.com/repos/amoraschi/amoraschi/contents/README.md')
  const parsed = await res.json()

  return {
    sha: parsed.sha,
    content: parsed.content
  }
}

async function fetchSHAs () {
  const res1 = await fetch('https://api.github.com/repos/amoraschi/amoraschi/contents/data/hourly1.png')
  const res2 = await fetch('https://api.github.com/repos/amoraschi/amoraschi/contents/data/hourly2.png')
  const res3 = await fetch('https://api.github.com/repos/amoraschi/amoraschi/contents/data/drawing.svg')
  const parsed1 = await res1.json()
  const parsed2 = await res2.json()
  const parsed3 = await res3.json()

  return {
    sha1: parsed1.sha,
    sha2: parsed2.sha,
    sha3: parsed3.sha
  }
}

export {
  fetchReadme,
  fetchSHAs
}
