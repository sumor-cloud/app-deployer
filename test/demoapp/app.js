import createServer from '@sumor/ssl-server'
import demo from './demo.js'

const app = createServer()

app.all('/', (req, res) => {
  res.send(demo)
})

await app.listen()

console.log('server running on https://localhost')
