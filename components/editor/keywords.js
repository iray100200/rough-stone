const keywords$1 = [
  'switch',
  'break',
  'case',
  'throw',
  'default',
  'if',
  'else',
  'continue',
  'for',
  'try',
  'catch',
  'finally',
  'await',
  'yield',
  'export',
  'return',
  'from',
  'import'
]

const keywords$2 = [
  'class',
  'const',
  'constructor',
  'debugger',
  'delete',
  'do',
  'extends',
  'false',
  'function',
  'get',
  'in',
  'instanceof',
  'let',
  'new',
  'null',
  'set',
  'super',
  'symbol',
  'this',
  'true',
  'typeof',
  'undefined',
  'var',
  'void',
  'while',
  'with',
  'async',
  'of'
]
export default function (value) {
  return keywords$1.indexOf(value) > -1 ? 'keyword' : keywords$2.indexOf(value) > -1 ? 'keyword-2' : ''
}