import path from 'path'
import child_process from 'child_process'

export default (req, res) => {
  try {
    const { name, type } = req.body
    const root = path.resolve(process.cwd(), 'cache', type, name)
    const sp = child_process.spawn('npm', ['install'], {
      cwd: root
    })
    sp.on('error', () => {
      process.stderr.write('spawn error: ' + root)
      res.status(400).send('fatal error')
    })
    sp.on('close', () => {
      res.status(200).send('success')
    })
    sp.stdout.on('data', (buffer) => {
      process.stdout.write(buffer.toString())
    })
    sp.stdout.on('error', (buffer) => {
      process.stdout.write(buffer.toString())
    })
  } catch (err) {
    res.status(404).send(err.message)
  }
}