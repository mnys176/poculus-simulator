const http = require('http')
const express = require('express')
const WebSocket = require('ws')
const dotenv = require('dotenv').config()
const Pump = require('./pump')

const app = express()
const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

const {
    DEFAULT_FRAME_RATE,
    MIN_FRAME_RATE,
    MAX_FRAME_RATE,
    PORT,
    VIEWER_THRESHOLD
} = process.env

let cachedFrameRate

const packetGenerator = function* () {
    let i = 0
    while (true) {
        const x = Math.round(-6144 * Math.cos(i) * 10) / 10
        const y = Math.round(3328 * Math.sin(i) * 10) / 10
        const z = Math.round(3328 * Math.sin(i) * 10) / 10
        i += 0.1
        yield { x, y, z }
    }
}

wss.on('connection', ws => {
    const myCreator = packetGenerator
    const myHandler = packet => ws.send(JSON.stringify({ packet }))
    const delay = Math.floor(
        1 / (cachedFrameRate ?? parseInt(DEFAULT_FRAME_RATE)) * 1000
    )
    ws.sim = new Pump(myCreator, myHandler, delay)
    ws.sim.start()

    ws.send(JSON.stringify({
        init: {
            frameRate: cachedFrameRate ?? parseInt(DEFAULT_FRAME_RATE),
            minFrameRate: parseInt(MIN_FRAME_RATE),
            maxFrameRate: parseInt(MAX_FRAME_RATE),
            viewerThreshold: parseInt(VIEWER_THRESHOLD)
        }
    }))

    ws.on('message', msg => {
        cachedFrameRate = parseInt(JSON.parse(msg).frameRate)
        wss.clients.forEach(client => {
            client.sim.delay = Math.floor(1 / cachedFrameRate * 1000)
            client.send(JSON.stringify({
                update: { frameRate: cachedFrameRate }
            }))
        })
    })
})

app.use(express.static('webapp'))

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}!`)
})