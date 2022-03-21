const http = require('http')
const express = require('express')
const WebSocket = require('ws')
const dotenv = require('dotenv').config()
const Pump = require('./pump')

const app = express()
const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

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

const { DEFAULT_FRAME_RATE } = process.env
let clients = []
let frameRate
wss.on('connection', ws => {
    const myCreator = packetGenerator
    const myHandler = pkt => ws.send(JSON.stringify({ packet: pkt }))
    const delay = Math.floor(1 / (frameRate ?? DEFAULT_FRAME_RATE) * 1000)
    const sim = new Pump(myCreator, myHandler, delay)
    clients.push([ws, sim])

    sim.start()
    ws.on('close', () => clients = clients.filter(c => c.ws !== ws))
    ws.on('message', msg => {
        frameRate = JSON.parse(msg).frameRate

        clients.forEach(([ws, sim]) => {
            sim.delay = Math.floor(1 / JSON.parse(msg).frameRate * 1000)
            ws.send(JSON.stringify({ config: { frameRate } }))
        })
    })
})

app.use(express.static('webapp'))

app.get('/config', (req, res) => {
    const data = JSON.stringify({
        config: { frameRate: frameRate ?? DEFAULT_FRAME_RATE }
    })
    return res.status(200).send(data)
})

const { PORT } = process.env
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}!`)
})