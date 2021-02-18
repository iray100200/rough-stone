import fs from 'fs'
import path from 'path'
import * as uuid from 'uuid'
import _ from 'lodash'

const getVirtualDir = (paths) => {
  if (paths.length === 1) {
    return 'children'
  }
  const list = []
  paths.slice(0, paths.length - 1).forEach(o => {
    list.push(o)
    list.push('children')
  })
  return ['children', ...list]
}

export default async (req, res) => {
  try {
    const { name } = req.params
    const dir = `cache/vue2/${name}`
    const resource = {
      id: 'root',
      name: name.toUpperCase(),
      type: 'folder',
      children: {}
    }

    const setVirtualDir = (resource, filedir) => {
      const paths = filedir.replace(new RegExp(`cache/vue2/${name}/`, 'g'), '').split(/\//)
      const dir = getVirtualDir(paths)
      const folder = paths[paths.length - 1]
      const target =_.get(resource, dir)
      target[folder] = {
        type: 'folder',
        id: uuid.v4(folder),
        name: folder,
        fullPath: filedir,
        children: {}
      }
    }
    
    const setVirtualFile = (resource, filedir) => {
      const paths = filedir.replace(new RegExp(`cache/vue2/${name}/`, 'g'), '').split(/\//)
      const dir = getVirtualDir(paths)
      const content = fs.readFileSync(filedir, 'utf8')
      const filename = paths[paths.length - 1]
      const target =_.get(resource, dir)
      target[filename] = {
        type: 'file',
        id: uuid.v4(filename),
        name: filename,
        fullPath: filedir,
        content,
        extension: filename.split('.')[1]
      }
    }

    const traverseFile = (directory, callback) => {
      const files = fs.readdirSync(directory)
      files.map(filename => {
        const filedir = path.join(directory, filename).replace(/\\/g, '/')
        const stats = fs.statSync(filedir)
        const isDir = stats.isDirectory()
        if (isDir) {
          callback(filedir, stats)
          traverseFile(filedir, callback)
          return
        }
        callback(filedir, stats)
      })
    }

    traverseFile(dir, (filedir, stats) => {
      const isDir = stats.isDirectory()
      if (isDir) {
        setVirtualDir(resource, filedir)
      } else {
        setVirtualFile(resource, filedir)
      }
    })
    res.status(200).send(resource)
  } catch (err) {
    res.status(404).send(err.message)
  }
}