import { ChartJSNodeCanvas } from 'chartjs-node-canvas'

async function generateChart (hours) {
  const width = 900
  const height = 400
  const backgroundColor = 'black'

  const config = {
    type: 'line',
    data: {
      labels: hours.map(d => {
        return `${d.time < 10 ? '0' : ''}${d.time}:00`
      }),
      datasets: [
        {
          label: 'Temperature (ºC)',
          data: hours.map(d => d.tempcs),
          borderColor: ['rgba(255, 99, 132, 1)'],
          yAxisID: 'temperature'
        },
        {
          label: 'Precipitation (mm)',
          data: hours.map(d => d.precipitation.mm),
          borderColor: ['rgba(54, 162, 235, 1)'],
          yAxisID: 'precipitation'
        },
        {
          label: 'Wind (km/h)',
          data: hours.map(d => d.wind.kph),
          borderColor: ['rgba(255, 255, 255, 1)'],
          yAxisID: 'wind'
        },
        {
          label: 'Humidity (%)',
          data: hours.map(d => d.humidity),
          borderColor: ['rgba(75, 192, 192, 1)'],
          yAxisID: 'humidity'
        }
      ],
      borderWidth: 1
    },
    options: {
      tension: 0.25,
      animation: false,
      scales: {
        temperature: {
          type: 'linear',
          position: 'left',
          ticks: {
            callback: (value) => ` ${value} ºC`
          }
        },
        precipitation: {
          type: 'linear',
          position: 'right',
          ticks: {
            callback: (value) => `${value} mm `
          },
          min: 0
        },
        wind: {
          type: 'linear',
          position: 'left',
          ticks: {
            callback: (value) => ` ${value} km/h`
          }
        },
        humidity: {
          type: 'linear',
          position: 'right',
          ticks: {
            callback: (value) => `${value}% `
          }
        }
      }
    },
    plugins: [{
      id: 'background-colour',
      beforeDraw: (chart) => {
        const ctx = chart.ctx
        ctx.save()
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, width, height)
        ctx.restore()
      }
    }]
  }

  const chartCallback = (ChartJS) => {
    ChartJS.defaults.maintainAspectRatio = true
    ChartJS.defaults.color = 'white'
    ChartJS.defaults.font.weight = 'bold'
  }

  const chart = new ChartJSNodeCanvas({ width, height, chartCallback, type: 'svg' })

  const buffer = chart.renderToBufferSync(config, 'image/svg+xml')

  return buffer
}

export {
  generateChart
}
