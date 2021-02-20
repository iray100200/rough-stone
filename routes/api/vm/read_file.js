import fs from 'fs'
import path from 'path'

export default (req, res) => {
  const { fullPath } = req.body
  res.set({
    'content-type': 'text/plain'
  })
  fs.createReadStream(path.resolve(process.cwd(), fullPath)).pipe(res)
}