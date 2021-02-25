export default function (monaco) {
  monaco.editor.defineTheme('rs-vs-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'rs-keywords', foreground: 'c586c0' },
      { token: 'rs-keywords-2', foreground: '569cd6' },
      { token: 'rs-identifier', foreground: '9cdcfe' }
    ]
  })
}