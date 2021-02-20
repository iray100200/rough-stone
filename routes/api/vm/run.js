export default (req, res) => {
  const builder = require('rough-stone-builder-vue2')
  builder.dev('./cache/vue2/test/src/index.js')
  res.send('success')
}