import path from 'path'
import fs from 'fs'

export default (req, res) => {
  try {
    const { name, type } = req.body
    const root = path.resolve(process.cwd(), 'cache', type, name, 'package.json')
    fs.readFile(root, {
      encoding: 'utf8'
    }, (err, data) => {
      if (err) {
        res.status(404).send(err.message)
        return
      }
      res.status(200).json(data)
    })
  } catch (err) {
    res.status(404).send(err.message)
  }
}