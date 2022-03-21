class Pump {
    #intervalId
    #creator
    #handler
    #delay

    constructor(creator, handler = pkt => console.log(pkt), delay = 0) {
        this.#creator = this.#wrap(creator)
        this.#handler = handler
        this.#intervalId = null
        this.#delay = delay
    }

    get delay() { return this.#delay }
    
    set delay(delay) {
        this.#delay = parseInt(delay)
        this.stop()
        this.start()
    }

    start(cb = () => {}) {
        if (this.#intervalId === null) {
            this.#intervalId = setInterval(async () => {
                const { value } = await this.#creator.next()
                this.#handler(value.next ? value.next().value : value)
            }, this.#delay)
            cb()
        }
    }

    stop(cb = () => {}) {
        if (this.#intervalId !== null) {
            clearInterval(this.#intervalId)
            this.#intervalId = null
            cb()
        }
    }

    #wrap(fn) {
        switch (fn.constructor.name) {
            case 'Function':
            case 'AsyncFunction':
                return (async function* () {
                    while (true) yield await fn()
                })()
            case 'GeneratorFunction':
            case 'AsyncGeneratorFunction':
                return (async function* () {
                    while (true) yield* await fn()
                })()
            default:
                return (async function* () {
                    while (true) yield await fn
                })()
        }
    }
}

module.exports = Pump