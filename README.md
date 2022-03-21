# Poculus Simulator

This simulator is designed to serve as a flexible websocket data source to aid *Poculus Industries* project development. It is currently capable of continuously streaming data packets of any shape from 1-60 packets (frames) per second.

## Dependencies

* NodeJS and NPM
* Docker and Docker Compose *(optional)*

## Getting Started

1. Clone this repository.

```bash
git clone https://github.com/mnys176/poculus-simulator.git --depth 1
```

2. From the `/app` directory, install dependencies and start the simulator.

```bash
cd <repository-root>/app
npm install && npm start
```

3. In a web browser, go to `http://localhost:24543`.

### Using Docker

It is typically preferred to run the simulator in a standalone Docker container, as it is by far the most turn-key way of getting up and running; no need for you to install NodeJS yourself.

1. From the root of the repository, build the image and run the container maually...

```bash
cd <repository-root>
docker build -t poculus-simulator .
docker run -dp 24543:24543 --name 'poculus-simulator' poculus-simulator
```

...or automatically using the `docker-compose.yml` file.

```bash
cd <repository-root>
docker-compose up -d --build
```

2. The simulator should be accessible at `http://localhost:24543`.

| Index                      | Data                      |
|:---------------------------|:--------------------------|
| ![](screenshots/index.png) | ![](screenshots/data.png) |

## Changing the Data

In the likely event that you need to change the shape of the data, take a look at the `packetGenerator` function within `/app/index.js`.

```javascript
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
```

The default shape of the received data will be a simple JavaScript object with an `x`, `y`, and `z` component created by a JavaScript [generator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator).

Let's say you wanted to generate a random decimal number instead. `packetGenerator` can be changed to something like this.

```javascript
const packetGenerator = () => Math.random()
```

Note that the function itself does not have to be a generator. All that matters is that the function resolves to a value; that value can be anything.

Some more examples:

```javascript
const packetGenerator = 'Some Value'         // constants
const packetGenerator = () => Math.random()  // functions  (can be asynchronous)
const packetGenerator = function* () {       // generators (can be asynchronous)
    let i = 0
    while (true) yield i++
}
```

**NOTE:** You must restart the application in order for any of these changes to take effect. If using Docker, stop the existing container and rebuild the image.