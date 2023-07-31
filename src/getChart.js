import { ChartJSNodeCanvas } from 'chartjs-node-canvas'

async function getChart (hours) {
  const width = 600
  const height = 300
  const backgroundColor = 'black'

  const config = {
    type: 'line',
    data: {
      labels: hours.map(d => `${d.time}:00`),
      datasets: [
        {
          label: 'º Celsius',
          data: hours.map(d => d.tempcs),
          borderColor: ['rgba(255, 99, 132, 1)'],
          backgroundColor: ['rgba(255, 99, 132, 0.2)'],
          yAxisID: 'celsius'
        },
        {
          label: 'º Fahrenheit',
          data: hours.map(d => d.tempft),
          borderColor: ['rgba(54, 162, 235, 1)'],
          backgroundColor: ['rgba(54, 162, 235, 0.2)'],
          yAxisID: 'fahrenheit'
        }
      ],
      borderWidth: 1
    },
    options: {
      animation: false,
      scales: {
        celsius: {
          type: 'linear',
          position: 'left',
          ticks: {
            callback: (value) => ` ${value} ºC`
          }
        },
        fahrenheit: {
          type: 'linear',
          position: 'right',
          ticks: {
            callback: (value) => `${value} ºF `
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
    ChartJS.defaults.responsive = true
    ChartJS.defaults.maintainAspectRatio = true
    ChartJS.defaults.color = 'white'
  }

  const chart = new ChartJSNodeCanvas({ width, height, chartCallback })

  const buffer = await chart.renderToBuffer(config)
  return buffer.toString('base64')
}

export {
  getChart
}
