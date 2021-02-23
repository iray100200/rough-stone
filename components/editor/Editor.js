import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import Editor from "@monaco-editor/react"
import SyntaxHighlightWorker from './syntax-highlighter.worker'
import language from './language'
import registerVueLanguage from './vue'

import './jsx.style.less'

const styles = () => {
  return {}
}

class MonacoEditor extends React.Component {
  constructor () {
    super()
    this.editor = null
    this.monaco = null
  }
  modules = new Map()
  get model() {
    return this.editor.getModel()
  }
  get value() {
    return this.model.getValue()
  }
  shouldComponentUpdate (nextProps) {
    if (nextProps.path !== this.props.path) {
      this.props = nextProps
      this.initCode()
    }
    return true
  }
  initCode = () => {
    const lang = language[this.props.fileExtension]
    this.model.setValue(this.props.value)
    // this.editor.setLanguage(this.model, lang)
    if(lang === 'jsx') {
      this.syntaxWorker.postMessage({
        code: this.props.value,
        title: this.props.fullPath,
        version: this.model.getVersionId()
      })
    }
  }
  handleEditorDidMount = (editor, monaco) => {
    this.editor = editor
    this.monaco = monaco
    if(this.props.onMount) {
      this.props.onMount.apply(this, [editor, monaco])
    }
    this.setupSyntaxWorker()
    this.model.updateOptions({
      tabSize: 2,
      lineNumbers: true
    })
    if (this.props.fileExtension === 'vue') {
      registerVueLanguage(monaco)
    }
    this.initCode()
  }
  handleChange = (value) => {
    this.syntaxWorker.postMessage({
      code: value,
      title: this.props.fullPath,
      version: this.model.getVersionId()
    })
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
    this.editor.render()
  }
  render() {
    return <Editor
      {...this.props}
      saveViewState={true}
      language={language[this.props.fileExtension]}
      onChange={this.handleChange}
      onMount={this.handleEditorDidMount}></Editor>
  }
}

export default withStyles(styles)(MonacoEditor)