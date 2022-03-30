
const SERVER_URL = 'localhost:24543'

const frameRateElement = document.querySelector('#frame-rate>h2')
const upButtonElement = document.getElementById('up')
const downButtonElement = document.getElementById('down')

const socket = new WebSocket(`ws://${SERVER_URL}`)
let frameRate, minFrameRate, maxFrameRate

const initializeControls = () => {
    upButtonElement.onclick = () => updateFrameRate(false)
    downButtonElement.onclick = () => updateFrameRate(true)
}

const initializeWebSocket = () => {
    socket.addEventListener('message', evt => {
        const { init, update } = JSON.parse(evt.data)
        if (init) {
            frameRate = init.frameRate
            minFrameRate = init.minFrameRate
            maxFrameRate = init.maxFrameRate
            frameRateElement.innerHTML = frameRate + '<span>FPS</span>'
        } else if (update) {
            frameRate = update.frameRate
            frameRateElement.innerHTML = frameRate + '<span>FPS</span>'
        }
    })
}

const updateFrameRate = dec => {
    let displayedFrameRate = parseInt(frameRateElement.innerHTML.split('<')[0])

    if (dec) {
        displayedFrameRate -= frameRate === minFrameRate ? 0 : 1
    } else {
        displayedFrameRate += frameRate === maxFrameRate ? 0 : 1
    }

    if (displayedFrameRate !== frameRate) {
        frameRateElement.innerHTML = displayedFrameRate + '<span>FPS</span>'
        socket.send(JSON.stringify({ frameRate: displayedFrameRate }))
    }

}

initializeControls()
initializeWebSocket()