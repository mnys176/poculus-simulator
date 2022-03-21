(async () => {
    const SERVER_URL = 'localhost:24543'

    const frameRateElement = document.querySelector('#frame-rate>h2')
    const upButtonElement = document.getElementById('up')
    const downButtonElement = document.getElementById('down')

    const socket = new WebSocket(`ws://${SERVER_URL}`)

    const initializeFrameRate = async () => {
        const response = await fetch(`http://${SERVER_URL}/config`)
        const { config } = await response.json()
        frameRateElement.innerHTML = config.frameRate + '<span>FPS</span>'
    }

    const initializeControls = () => {
        upButtonElement.onclick = () => updateFrameRate(false)
        downButtonElement.onclick = () => updateFrameRate(true)
    }

    const initializeWebSocket = () => {
        socket.addEventListener('message', evt => {
            const { config } = JSON.parse(evt.data)
            if (config) {
                const { frameRate } = config
                frameRateElement.innerHTML = frameRate + '<span>FPS</span>'
            }
        })
    }

    const updateFrameRate = dec => {
        let frameRate = parseInt(frameRateElement.innerHTML.split('<')[0])
        if (dec) {
            frameRate -= frameRate === 1 ? 0 : 1
        } else {
            frameRate += frameRate === 60 ? 0 : 1
        }
        frameRateElement.innerHTML = frameRate + '<span>FPS</span>'
        socket.send(JSON.stringify({ frameRate }))
    }


    await initializeFrameRate()
    initializeControls()
    initializeWebSocket()
})()