import fs from 'fs'
import path from 'path'

export default (req, res) => {
  try {
    const { fileName, parentPath } = req.body
    fs.appendFile(path.resolve(process.cwd(), parentPath, fileName), '', function (err) {
      if (err) {
        res.status(404).send(err.message)
      } else {
        res.send('success')
      }
    })
  } catch (err) {
    res.status(404).send(err.message)
  }
}