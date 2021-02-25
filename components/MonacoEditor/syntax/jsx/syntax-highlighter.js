import SyntaxHighlightWorker from './syntax-highlighter.worker'

export default class SynaxHighlighter {
  constructor (monaco) {
    this.monaco = monaco
    this.editor = monaco.editor
    this.modules = new Map()
  }
  postMessage = (options) => {
    this.syntaxWorker.postMessage(options)
  }
  setupSyntaxWorker = () => {
    this.syntaxWorker = new SyntaxHighlightWorker()
    this.syntaxWorker.addEventListener('message', event => {
      const { classifications, markers } = event.data
      this.monaco.editor.setModelMarkers(this.model, 'eslint', markers)
      if(this.editor.getModel()) {
        this.updateDecorations(classifications)
      }
    })
  }
  updateDecorations = (classifications) => {
    const decorations = classifications.map(classification => {
      return {
        range: new this.monaco.Range(
          classification.startLine,
          classification.start,
          classification.endLine,
          classification.end
        ),
        options: {
          inlineClassName: classification.kind
        }
      }
    })
  
    this.decorations = this.editor.deltaDecorations(this.modules.get(this.props.path) || [], decorations)
    this.modules.set(this.props.path, this.decorations)
  }
}
