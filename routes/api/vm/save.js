import AdmZip from 'adm-zip'

export default (req, res) => {
  try {
    const { name, path, content } = req.body
    const zipPath = `./cache/${name}.zip`
    const zip = new AdmZip(zipPath)
    const entry =  zip.getEntry(path)
    zip.updateFile(entry, Buffer.from(content))
    zip.writeZip(zipPath, (error) => {
      if (error) {
        res.status(500).send('Write Zip Error')
      }
    })
    res.send('success')
  } catch (err) {
    res.status(404).send('Not Found')
  }
}