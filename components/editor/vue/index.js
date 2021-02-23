import { language, conf } from './vue.language.config'

export default function register (monaco) {
  monaco.languages.register({ id: 'vue' })

  monaco.languages.setMonarchTokensProvider('vue', language)
  monaco.languages.setLanguageConfiguration('vue', conf)
}