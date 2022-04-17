module.exports = function* () {
    let i = 0
    while (true) {
        const x = Math.round(-6144 * Math.cos(i) * 10) / 10
        const y = Math.round(3328 * Math.sin(i) * 10) / 10
        const z = Math.round(3328 * Math.sin(i) * 10) / 10
        i += 0.1
        yield { x, y, z }
    }
}