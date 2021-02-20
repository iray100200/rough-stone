import fs from 'fs'

export default (req, res) => {
  try {
    const { fullPath, content } = req.body
    fs.writeFile(fullPath, content, function (err) {
      if (err) {
        res.status(404).send('Not Found')
      } else {
        res.send('success')
      }
    })
  } catch (err) {
    res.status(404).send('Not Found')
  }
}