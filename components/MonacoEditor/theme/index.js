import defineTheme from './define-theme'
import vsDarkTheme from './vs-dark.theme'

export function defineEditorTheme(monaco) {
  defineTheme(monaco, vsDarkTheme)
}