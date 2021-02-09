import express from 'express'
import gulp from 'gulp'
import consolidate from 'gulp-consolidate'
import bodyParser from 'body-parser'
import through2 from 'through2'
import fs from 'fs'
import stream from 'stream'
import path from 'path'
import * as babelCore from 'babel-core'
import vue2BabelConfig from './config/vue2.babel.config'
import rename from 'gulp-rename'
import next from 'next'
import compression from 'compression'

import api_vm_create from './routes/api/vm/create'
import api_vm_save from './routes/api/vm/save'

const dev = process.env.NODE_ENV !== 'production'
const nextApp = next({ dev })
const handle = nextApp.getRequestHandler()

const app = express()
const router = express.Router()
const origin = 'http://localhost:9000'

nextApp.prepare().then(() => {
  app.get('*', (req, res) => {
    return handle(req, res)
  })
})

function mkdir (path) {
  return new Promise((resolve) => {
    fs.stat(path, (err) => {
      if (err) {
        fs.mkdir(path, (err) => {
          if (err) return
        })
      }
      resolve(1)
    })
  })
}

router.post('/api/vm/save', api_vm_save)
router.get('/api/vm/read/:name', api_vm_create)

router.post('/api/vm/create', async (req, res) => {
  const { name, type, template } = req.body

  await mkdir(path.join(__dirname, 'cache', name))

  const transform = through2(function (chunk, enc, callback) {
    const result = babelCore.transform(chunk.toString('utf8'), vue2BabelConfig)
    this.push(Buffer.from(result.code))
    return callback()
  })

  const writeFile = through2(function (chunk, enc, callback) {
    const fw = fs.createWriteStream(path.join(__dirname, 'cache', name, 'index.js'))
    fw.write(chunk.toString('utf8'))
    fw.end()
    res.send('success')
    return callback()
  })

  stream.Readable.from([template])
    .pipe(transform)
    .pipe(writeFile)

  const options = {
    title: name,
    scriptSrc: origin + '/file/vm/script/' + name
  }

  gulp.src(`./vm/${type}.html`)
    .pipe(consolidate('lodash', options))
    .pipe(rename({
      basename: 'index'
    }))
    .pipe(gulp.dest(path.join(__dirname, 'cache', name)))
})

router.get('/file/vm/script/:name', (req, res) => {
  const { name } = req.params
  fs.createReadStream(path.join(__dirname, 'cache', name, 'index.js')).pipe(res)
})

router.get('/file/vm/vue2/template/:name', (req, res) => {
  try {
    const { name } = req.params
    const file = path.join(__dirname, 'cache', name, 'index.html')
    fs.stat(file, (err) => {
      if (err) {
        res.status(404).send('Not Found')
        return
      }
      fs.createReadStream(file).pipe(res)
    })
  } catch (err) {
    res.writeHead(404)
    res.send('Not Found')
  }
})

app.use(compression())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use('/', router)

app.listen(9000)