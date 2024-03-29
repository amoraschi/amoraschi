function generateReadme (weather, moonImage) {
  const date = weather.lastupdate.replace(/-/g, '/')

  return '<!-- WEATHER -->\n' +
  '<details align="center">\n' +
  '  <summary>Weather project</summary>\n' +
  '  <p align="center">\n' +
  '    <a href="https://www.weatherapi.com/" target="_blank">\n' +
  `      <img src="${weather.condition.icon}" alt="Weather icon">\n` +
  '    </a>\n' +
  '    <br />\n' +
  `    <strong>${date}</strong>\n` +
  '    <br />\n' +
  '    <strong>Today\'s forecast</strong>\n' +
  '    <br />\n' +
  `    ${weather.condition.text} - ${weather.temperature.currentcs} ºC (${weather.temperature.currentft} ºF)\n` +
  `    <p align="center">🔼 ${weather.temperature.maxcs} ºC (${weather.temperature.maxft} ºF) 🔽 ${weather.temperature.mincs} ºC (${weather.temperature.minft} ºF)</p>\n` +
  '    <details align="center">\n' +
  '      <summary>📈 Forecast graph</summary>\n' +
  '      <img src="https://raw.githubusercontent.com/amoraschi/amoraschi/master/data/hourly.svg" alt="Hourly forecast">\n' +
  '    </details>\n' +
  // '    <details align="center">\n' +
  // '      <summary>⛅ Weather information</summary>\n' +
  // '      <p align="center">\n' +
  // `        Wind - ${weather.wind.direction} ${weather.wind.kph} km/h (${weather.wind.mph} miles/h)\n` +
  // '        <br />\n' +
  // `        Precipitation - ${weather.precipitation.mm} mm (${weather.precipitation.in} in)\n` +
  // '        <br />\n' +
  // `        Visibility - ${weather.visibility.km} km (${weather.visibility.miles} miles)\n` +
  // '        <br />\n' +
  // `        Humidity - ${weather.humidity}%\n` +
  // '        <br />\n' +
  // `        UV Index - ${weather.uv.index} (${weather.uv.text})\n` +
  // '      </p>\n' +
  // '    </details>\n' +
  '    <details align="center">\n' +
  '      <summary>🌍 Planetary information</summary>\n' +
  '      <p align="center">\n' +
  `        <img src="https://raw.githubusercontent.com/amoraschi/amoraschi/master/data/drawing.svg" alt="Sun and Moon">\n` +
  '      </p>\n' +
  '    </details>\n' +
  '  </p>\n' +
  '  <em>Powered by <a href="https://www.weatherapi.com/" title="Free Weather API">WeatherAPI.com</a> and <a href="https://www.icalendar37.net/lunar/app/" title="Lunar Calendar API">iCalendar</a></em>\n' +
  '</details>\n'
}

export {
  generateReadme
}
