import { createCanvas, registerFont } from 'canvas'
import { writeFileSync } from 'fs'

const canvas = createCanvas(500, 200)
const ctx = canvas.getContext('2d')

const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)

gradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
gradient.addColorStop(1, 'rgba(255, 255, 255, 0.5)')
ctx.fillStyle = gradient
ctx.fillRect(0, 0, canvas.width, canvas.height)

ctx.strokeStyle = 'rgba(0, 0, 0, 1)'
ctx.lineWidth = 5
ctx.strokeRect(0, 0, canvas.width, canvas.height)

ctx.font = 'bold 30px Arial'
ctx.fillStyle = 'white'
ctx.textAlign = 'center'
ctx.fillText('Angelo Moraschi', canvas.width / 2, canvas.height / 2 + 10)

ctx.font = 'bold 15px Arial'
ctx.fillStyle = 'white'
ctx.textAlign = 'center'
ctx.fillText('Software Engineering Student', canvas.width / 2, canvas.height / 2 + 35)

writeFileSync('./data/profile.png', canvas.toBuffer())
