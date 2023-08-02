function generateReadme (weather) {
  const date = weather.lastupdate.replace(/-/g, '/')

  return '<!-- WEATHER -->\n' +
  '<details align="center">\n' +
  '  <summary>🌤️ Daily weather</summary>\n' +
  '  <p align="center">\n' +
  '    <a href="https://www.weatherapi.com/" target="_blank">\n' +
  `      <img src="https:${weather.condition.icon}" alt="Weather icon">\n` +
  '    </a>\n' +
  '    <br />\n' +
  `    <strong>${date}</strong>\n` +
  '    <br />\n' +
  '    <strong>Today\'s forecast</strong>\n' +
  '    <br />\n' +
  `    ${weather.condition.text} - ${weather.temperature.currentcs} ºC (${weather.temperature.currentft} ºF)\n` +
  `    <p align="center">🔼 ${weather.temperature.maxcs} ºC (${weather.temperature.maxft} ºF) 🔽 ${weather.temperature.mincs} ºC (${weather.temperature.minft} ºF)</p>\n` +
  '    <details align="center">\n' +
  '      <summary>🕐 Hourly forecast</summary>\n' +
  '      <a href="https://www.weatherapi.com/" target="_blank">\n' +
  '        <img src="https://raw.githubusercontent.com/amoraschi/amoraschi/master/data/hourly1.png" alt="Hourly forecast">\n' +
  '      </a>\n' +
  '      <a href="https://www.weatherapi.com/" target="_blank">\n' +
  '        <img src="https://raw.githubusercontent.com/amoraschi/amoraschi/master/data/hourly2.png" alt="Hourly forecast">\n' +
  '      </a>\n' +
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
  `        Sunrise - ${weather.sun.rise}\n` +
  '        <br />\n' +
  `        Sunset - ${weather.sun.set}\n` +
  '        <br />\n' +
  `        Moon phase - ${weather.moon.phase}\n` +
  '        <br />\n' +
  `        Moon illumination - ${weather.moon.illumination}%\n` +
  '      </p>\n' +
  '    </details>\n' +
  '  </p>\n' +
  '</details>\n'
}

export {
  generateReadme
}
