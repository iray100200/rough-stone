import React from 'react'
import Editor from "@monaco-editor/react"
import language from './language'
import registerVueLanguage from './syntax/vue'
import { defineEditorTheme } from './theme'
import { liftOff } from './textmate'

class MonacoEditor extends React.Component {
  constructor () {
    super()
    this.editor = null
    this.monaco = null
    this.isVueLanguageRegistered = false
  }
  get model() {
    return this.editor.getModel()
  }
  get value() {
    return this.model.getValue()
  }
  shouldComponentUpdate(nextProps) {
    if(nextProps.path !== this.props.path) {
      this.props = nextProps
      this.initCode()
    }
    return true
  }
  registerVue() {
    if(this.isVueLanguageRegistered) return
    registerVueLanguage(this.monaco)
  }
  initCode = () => {
    const lang = language[this.props.fileExtension]
    this.model.setValue(this.props.value)
    if(lang === 'vue') {
      this.registerVue()
    }
  }
  defineTheme = () => {
    defineEditorTheme(this.monaco)
  }
  configureTokenizer = async () => {
    await liftOff(this.monaco)
  }
  handleInitEditor = (monaco) => {
    this.monaco = monaco
    this.registerVue()
    monaco.languages.typescript.typescriptDefaults.setMaximumWorkerIdleTime(-1)
    monaco.languages.typescript.javascriptDefaults.setMaximumWorkerIdleTime(-1)
    monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true)
    monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true)
  }
  handleEditorDidMount = (editor, monaco) => {
    this.editor = editor
    this.defineTheme()
    this.configureTokenizer()
    this.setCompilerOptions()
    if(this.props.onMount) {
      this.props.onMount.apply(this, [editor, monaco])
    }
    this.model.updateOptions({
      tabSize: 2,
      lineNumbers: true
    })
    if(this.props.fileExtension === 'vue') {
      this.registerVue()
    }
    this.initCode()
  }
  handleChange = (value) => {
    if(this.props.onChange) {
      this.props.onChange(value)
    }
  }
  setCompilerOptions = () => {
    const hasNativeTypescript = false
    const existingConfig = this.tsconfig ? this.tsconfig.compilerOptions : {}
    const jsxFactory = existingConfig.jsxFactory || 'React.createElement'
    const reactNamespace = existingConfig.reactNamespace || 'React'

    const compilerDefaults = {
      jsxFactory,
      reactNamespace,
      jsx: this.monaco.languages.typescript.JsxEmit.React,
      target: this.monaco.languages.typescript.ScriptTarget.ES2016,
      allowNonTsExtensions: !hasNativeTypescript,
      moduleResolution: this.monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: this.monaco.languages.typescript.ModuleKind.System,
      experimentalDecorators: true,
      noEmit: true,
      allowJs: true,
      typeRoots: ['node_modules/@types'],
      newLine: this.monaco.languages.typescript.NewLineKind.LineFeed
    }

    this.monaco.languages.typescript.typescriptDefaults.setCompilerOptions(compilerDefaults)
    this.monaco.languages.typescript.javascriptDefaults.setCompilerOptions(compilerDefaults)

    this.monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false
    })
  }
  render() {
    return <Editor
      {...this.props}
      saveViewState={true}
      language={language[this.props.fileExtension]}
      onChange={this.handleChange}
      theme="vs-dark"
      beforeMount={this.handleInitEditor}
      onMount={this.handleEditorDidMount}></Editor>
  }
}

export default MonacoEditor