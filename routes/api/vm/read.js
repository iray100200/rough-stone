import fs from 'fs'
import path from 'path'
import { v5 as uuidv5, v4 as uuidv4 } from 'uuid'
import _ from 'lodash'

const VM_IGNORE = [/^node_modules$/, /^dist$/, /^\.babelrc$/]
const NAMESPACE = uuidv4('rough-stone')

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
    const rootDir = `cache/vue2/${name}`
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
        id: uuidv5(folder, NAMESPACE),
        name: folder,
        fullPath: filedir,
        children: {}
      }
    }
    
    const setVirtualFile = (resource, filedir) => {
      const paths = filedir.replace(new RegExp(`cache/vue2/${name}/`, 'g'), '').split(/\//)
      const dir = getVirtualDir(paths)
      const filename = paths[paths.length - 1]
      const target =_.get(resource, dir)
      const ext = filename.split('.').reverse()[0]
      target[filename] = {
        type: 'file',
        id: uuidv5(filename, NAMESPACE),
        name: filename,
        fullPath: filedir,
        extension: ext
      }
    }

    const traverseFile = (directory, callback) => {
      const files = fs.readdirSync(directory)
      files.map(filename => {
        const filedir = path.join(directory, filename).replace(/\\/g, '/')
        if (directory === rootDir && VM_IGNORE.some(o => o.test(filename))) {
          return
        }
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

    traverseFile(rootDir, (filedir, stats) => {
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