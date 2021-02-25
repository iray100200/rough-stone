import cssGrammar from 'raw-loader!./grammars/css.json.tmLanguage'
import htmlGrammar from 'raw-loader!./grammars/html.json.tmLanguage'
import tsGrammar from 'raw-loader!./grammars/TypeScriptReact.tmLanguage'
import { loadWASM } from 'onigasm'
import { Registry } from 'monaco-textmate'
import { wireTmGrammars } from './set-gammars'

let grammarsLoaded = false

export async function liftOff(monaco) {
  if (grammarsLoaded) {
    return
  }
  grammarsLoaded = true
  await loadWASM(`/onigasm.wasm`) // See https://www.npmjs.com/package/onigasm#light-it-up

  const registry = new Registry({
    getGrammarDefinition: async (scopeName) => {
      if (scopeName === 'source.css') {
        return {
          format: 'json',
          content: cssGrammar,
        }
      }
      if (scopeName === 'text.html.basic') {
        return {
          format: 'json',
          content: htmlGrammar,
        }
      }

      return {
        format: 'plist',
        content: tsGrammar,
      }
    }
  })

  const grammars = new Map()
  grammars.set('css', 'source.css')
  grammars.set('html', 'text.html.basic')
  grammars.set('vue', 'text.html.basic')
  grammars.set('typescript', 'source.tsx')
  grammars.set('javascript', 'source.js')

  await wireTmGrammars(monaco, registry, grammars)
}