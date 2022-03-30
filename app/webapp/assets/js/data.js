const SERVER_URL = 'localhost:24543'

const frameRateElement = document.querySelector('#data-preview h3')
const viewerListElement = document.querySelector('ul')
const clearButtonElement = document.getElementById('clear')

const socket = new WebSocket(`ws://${SERVER_URL}`)
let frameRate, viewerThreshold

let autoscroll = true
const initializeViewerList = () => {
    viewerListElement.onclick = () => {
        autoscroll = false
        clearButtonElement.innerText = 'Clear & Resume Viewer'
    }
}

const initializeControls = () => {
    clearButtonElement.onclick = () => clearViewer()
}

const initializeWebSocket = () => {
    socket.addEventListener('message', evt => {
        const { init, update, packet } = JSON.parse(evt.data)
        if (init) {
            frameRate = init.frameRate
            viewerThreshold = init.viewerThreshold
            frameRateElement.innerText = frameRate + ' FPS : Tap' +
                                                     ' or Click to Pause'
        } else if (update) {
            frameRate = update.frameRate
            frameRateElement.innerText = frameRate + ' FPS : Tap' +
                                                     ' or Click to Pause'
        } else if (packet) {
            if (autoscroll) {
                const li = document.createElement('li')
                li.innerText = JSON.stringify(packet)
                viewerListElement.appendChild(li)
                viewerListElement.scrollTop = viewerListElement.scrollHeight
            }

            if (viewerListElement.childNodes.length >= viewerThreshold) {
                clearViewer()
            }
        }
    })
}

const clearViewer = () => {
    viewerListElement.innerHTML = ''
    autoscroll = true
    clearButtonElement.innerText = 'Clear Viewer'
}

initializeViewerList()
initializeControls()
initializeWebSocket()
