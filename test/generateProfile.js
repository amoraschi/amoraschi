import { createCanvas, registerFont } from 'canvas'
import { writeFileSync } from 'fs'

const canvas = createCanvas(750, 300)
const ctx = canvas.getContext('2d')

const radius = 10

ctx.beginPath()
ctx.moveTo(0, 0)
ctx.lineTo(canvas.width - radius, 0)
ctx.quadraticCurveTo(canvas.width, 0, canvas.width, radius)
ctx.lineTo(canvas.width, canvas.height - radius)
ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - radius, canvas.height)
ctx.lineTo(radius, canvas.height)
ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - radius)
ctx.lineTo(0, radius)
ctx.quadraticCurveTo(0, 0, radius, 0)
ctx.closePath()
ctx.clip()

const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0)

gradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
gradient.addColorStop(1, 'rgba(255, 255, 255, 1)')
ctx.fillStyle = gradient
ctx.fillRect(0, 0, canvas.width, canvas.height)

ctx.font = 'bold 30px Arial'
ctx.fillStyle = '#006AFF'
ctx.textAlign = 'center'
ctx.fillText('Angelo Moraschi', canvas.width / 2, canvas.height / 2 + 10)

ctx.font = 'bold 15px Arial'
ctx.fillStyle = '#006AFF'
ctx.textAlign = 'center'
ctx.fillText('Software Engineering Student', canvas.width / 2, canvas.height / 2 + 35)

writeFileSync('./data/profile.png', canvas.toBuffer())
