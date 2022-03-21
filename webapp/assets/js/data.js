(async () => {
    const SERVER_URL = 'localhost:24543'
    const VIEWER_THRESHOLD = 1000
    
    const frameRateElement = document.querySelector('#data-preview h3')
    const viewerListElement = document.querySelector('ul')
    const clearButtonElement = document.getElementById('clear')

    const socket = new WebSocket(`ws://${SERVER_URL}`)

    const initializeFrameRate = async () => {
        const response = await fetch(`http://${SERVER_URL}/config`)
        const { config } = await response.json()
        frameRateElement.innerText = config.frameRate + ' FPS : Tap' +
                                                        ' or Click to Pause'
    }

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
            const { config, packet } = JSON.parse(evt.data)
            if (config) {
                const { frameRate } = config
                frameRateElement.innerText = frameRate + ' FPS : Tap' +
                                                         ' or Click to Pause'
            } else if (packet) {
                if (autoscroll) {
                    const li = document.createElement('li')
                    li.innerText = JSON.stringify(packet)
                    viewerListElement.appendChild(li)
                    viewerListElement.scrollTop = viewerListElement.scrollHeight
                }

                if (viewerListElement.childNodes.length >= VIEWER_THRESHOLD) {
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

    await initializeFrameRate()
    initializeViewerList()
    initializeControls()
    initializeWebSocket()
})()
