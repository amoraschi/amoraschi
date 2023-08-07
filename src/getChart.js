import { ChartJSNodeCanvas } from 'chartjs-node-canvas'

async function getChart (hours) {
  const width = 800
  const height = 400
  const backgroundColor = 'black'

  const config1 = {
    type: 'line',
    data: {
      labels: hours.map(d => `${d.time}:00`),
      datasets: [
        {
          label: 'Temperature',
          data: hours.map(d => d.tempcs),
          borderColor: ['rgba(255, 99, 132, 1)'],
          backgroundColor: ['rgba(255, 99, 132, 0.2)'],
          yAxisID: 'temperature'
        },
        {
          label: 'Precipitation',
          data: hours.map(d => d.precipitation.mm),
          borderColor: ['rgba(54, 162, 235, 1)'],
          backgroundColor: ['rgba(54, 162, 235, 0.2)'],
          yAxisID: 'precipitation'
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
            callback: (value) => ` ${value} ºC (${Math.round(value * 1.8 + 32)} ºF)`
          }
        },
        precipitation: {
          type: 'linear',
          position: 'right',
          ticks: {
            callback: (value) => `${value} mm (${Math.round(value * 0.0393701 * 100) / 100} in) `
          },
          min: 0
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

  const config2 = {
    type: 'line',
    data: {
      labels: hours.map(d => `${d.time}:00`),
      datasets: [
        {
          label: 'Wind',
          data: hours.map(d => d.wind.kph),
          borderColor: ['rgba(255, 99, 132, 1)'],
          backgroundColor: ['rgba(255, 99, 132, 0.2)'],
          yAxisID: 'wind'
        },
        {
          label: 'Humidity',
          data: hours.map(d => d.humidity),
          borderColor: ['rgba(75, 192, 192, 1)'],
          backgroundColor: ['rgba(75, 192, 192, 0.2)'],
          yAxisID: 'humidity'
        }
      ],
      borderWidth: 1
    },
    options: {
      tension: 0.25,
      animation: false,
      scales: {
        wind: {
          type: 'linear',
          position: 'left',
          ticks: {
            callback: (value) => `${value} km/h (${Math.round(value / 1.609)} mph)`
          }
        },
        humidity: {
          type: 'linear',
          position: 'right',
          ticks: {
            callback: (value) => `${value}%`
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
  }

  const chart = new ChartJSNodeCanvas({ width, height, chartCallback, type: 'svg' })

  const buffer1 = chart.renderToBufferSync(config1, 'image/svg+xml')
  const buffer2 = chart.renderToBufferSync(config2, 'image/svg+xml')

  return {
    image1: buffer1,
    image2: buffer2
  }
}

export {
  getChart
}
