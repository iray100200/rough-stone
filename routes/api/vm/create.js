import AdmZip from 'adm-zip'
import * as uuid from 'uuid'
import _ from 'lodash'

const resolveDir = (pathStr, prefix) => {
  return pathStr.replace(new RegExp('^' + prefix + '\\/'), '').split('/').filter(o => o)
}

const getVirtualDir = (resource, paths) => {
  if (paths.length === 1) {
    return resource.children
  }
  return _.get(resource.children, [...paths.slice(0, paths.length - 1), 'children'].join('.'), {})
}

const setVirtualDir = (resource, paths, entry) => {
  const name = paths[paths.length - 1]
  return _.set(resource.children, paths.join('.'), {
    type: 'folder',
    id: uuid.v4(name),
    name: name,
    fullPath: entry.entryName,
    children: {}
  })
}

const setVirtualFile = (resource, paths, entry) => {
  const dir = getVirtualDir(resource, paths)
  dir[entry.name] = {
    type: 'file',
    id: uuid.v4(entry.name),
    name: entry.name,
    fullPath: entry.entryName,
    content: entry.getData().toString(),
    extension: entry.name.split('.')[1]
  }
}

export default async (req, res) => {
  try {
    const { name } = req.params
    const zip = new AdmZip(`./cache/${name}.zip`)
    const entries = zip.getEntries()
    const resource = {
      id: 'root',
      name: name.toUpperCase(),
      type: 'folder',
      children: {}
    }
    entries.forEach((entry) => {
      const paths = resolveDir(entry.entryName, name)
      if (entry.isDirectory) {
        setVirtualDir(resource, paths, entry)
      } else {
        setVirtualFile(resource, paths, entry)
      }
    })
    res.status(200).send(resource)
  } catch (err) {
    res.status(404).send(err.message)
  }
}