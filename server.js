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

import api_vm_read from './routes/api/vm/read'
import api_vm_save_file from './routes/api/vm/save_file'
import api_vm_read_file from './routes/api/vm/read_file'
import api_vm_run from './routes/api/vm/run'
import api_vm_new_file from './routes/api/vm/new_file'

import api_dep_install from './routes/api/dep/install'
import api_dep_update from './routes/api/dep/update'

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

router.post('/api/vm/save/file', api_vm_save_file)
router.get('/api/vm/read/:name', api_vm_read)
router.post('/api/vm/read/file', api_vm_read_file)
router.get('/api/vm/run/:name', api_vm_run)
router.post('/api/vm/new/file', api_vm_new_file)

router.post('/api/dep/install', api_dep_install)
router.post('/api/dep/update', api_dep_update)

router.post('/api/vm/create/vue2/template', async (req, res) => {
  const { name, type, template, vue2Version, vueRouterVersion } = req.body

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
    scriptSrc: origin + '/file/vm/script/' + name,
    vue2Version: vue2Version || '2.6.12',
    vueRouterVersion: vueRouterVersion || '3.5.1'
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
app.use(bodyParser.urlencoded({ extended: false }))
app.use('/', router)

app.listen(9000)
