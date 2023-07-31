function findPosition (content) {
  const start = content.indexOf('<!-- WEATHER -->')
  const end = content.indexOf('<!-- WEATHER END -->')

  return {
    start,
    end
  }
}

function getUVIndex (index) {
  return index <= 2 ? 'Low' : ((index >= 3 && index <= 5) ? 'Moderate' : ((index >= 6 && index <= 7) ? 'High' : ((index >= 8 && index <= 10) ? 'Very High' : 'Extreme')))
}

export {
  findPosition,
  getUVIndex
}
