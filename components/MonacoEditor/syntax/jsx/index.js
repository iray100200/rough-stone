import './index.less'

/* eslint-disable no-useless-escape */
const keywords = [
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

const keywords_2 = [
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

export default async function register(monaco) {
  const languageFeatures = require('./languageFeatures.js')
  const languages = monaco.languages
  const { WorkerManager } = require('./workerManager')

  function setupMode(defaults, modeId) {
    var client = new WorkerManager(modeId, defaults)
    var worker = function () {
      var uris = []
      for(var _i = 0; _i < arguments.length; _i++) {
        uris[_i] = arguments[_i]
      }
      return client.getLanguageServiceWorker.apply(client, uris)
    }
    var libFiles = new languageFeatures.LibFiles(worker)
    languages.registerCompletionItemProvider(modeId, new languageFeatures.SuggestAdapter(worker))
    languages.registerSignatureHelpProvider(modeId, new languageFeatures.SignatureHelpAdapter(worker))
    languages.registerHoverProvider(modeId, new languageFeatures.QuickInfoAdapter(worker))
    languages.registerDocumentHighlightProvider(modeId, new languageFeatures.OccurrencesAdapter(worker))
    languages.registerDefinitionProvider(modeId, new languageFeatures.DefinitionAdapter(libFiles, worker))
    languages.registerReferenceProvider(modeId, new languageFeatures.ReferenceAdapter(libFiles, worker))
    languages.registerDocumentSymbolProvider(modeId, new languageFeatures.OutlineAdapter(worker))
    languages.registerDocumentRangeFormattingEditProvider(modeId, new languageFeatures.FormatAdapter(worker))
    languages.registerOnTypeFormattingEditProvider(modeId, new languageFeatures.FormatOnTypeAdapter(worker))
    languages.registerCodeActionProvider(modeId, new languageFeatures.CodeActionAdaptor(worker))
    languages.registerRenameProvider(modeId, new languageFeatures.RenameAdapter(worker))
    new languageFeatures.DiagnosticsAdapter(libFiles, defaults, modeId, worker)
    return worker
  }

  const conf = {
    wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g,
    comments: {
      lineComment: '//',
      blockComment: ['/*', '*/']
    },
    brackets: [
      ['{', '}'],
      ['[', ']'],
      ['(', ')']
    ],
    onEnterRules: [
      {
        // e.g. /** | */
        beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
        afterText: /^\s*\*\/$/,
        action: {
          indentAction: languages.IndentAction.IndentOutdent,
          appendText: ' * '
        }
      },
      {
        // e.g. /** ...|
        beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
        action: {
          indentAction: languages.IndentAction.None,
          appendText: ' * '
        }
      },
      {
        // e.g.  * ...|
        beforeText: /^(\t|(\ \ ))*\ \*(\ ([^\*]|\*(?!\/))*)?$/,
        action: {
          indentAction: languages.IndentAction.None,
          appendText: '* '
        }
      },
      {
        // e.g.  */|
        beforeText: /^(\t|(\ \ ))*\ \*\/\s*$/,
        action: {
          indentAction: languages.IndentAction.None,
          removeText: 1
        }
      }
    ],
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"', notIn: ['string'] },
      { open: "'", close: "'", notIn: ['string', 'comment'] },
      { open: '`', close: '`', notIn: ['string', 'comment'] },
      { open: '/**', close: ' */', notIn: ['string'] }
    ],
    folding: {
      markers: {
        start: new RegExp('^\\s*//\\s*#?region\\b'),
        end: new RegExp('^\\s*//\\s*#?endregion\\b')
      }
    }
  }

  monaco.languages.register({
    id: 'jsx',
    extensions: ['.js', '.jsx'],
    firstLine: '^#!.*\\bnode',
    filenames: ['jakefile'],
    aliases: ['JavaScript', 'javascript', 'js'],
    mimetypes: ['text/javascript'],
  })

  languages.onLanguage('jsx', function () {
    setupMode(languages.typescript.javascriptDefaults, 'jsx')
    monaco.languages.setLanguageConfiguration('jsx', conf)
  })

  monaco.languages.setMonarchTokensProvider('jsx', {
    keywords,
    keywords_2,
    operators: [
      '<=',
      '>=',
      '==',
      '!=',
      '===',
      '!==',
      '=>',
      '+',
      '-',
      '**',
      '*',
      '/',
      '%',
      '++',
      '--',
      '<<',
      '</',
      '>>',
      '>>>',
      '&',
      '|',
      '^',
      '!',
      '~',
      '&&',
      '||',
      '??',
      '?',
      ':',
      '=',
      '+=',
      '-=',
      '*=',
      '**=',
      '/=',
      '%=',
      '<<=',
      '>>=',
      '>>>=',
      '&=',
      '|=',
      '^=',
      '@'
    ],
    symbols: /[=><!~?:&|+\-*\/\^%]+/,
    escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
    digits: /\d+(_+\d+)*/,
    octaldigits: /[0-7]+(_+[0-7]+)*/,
    binarydigits: /[0-1]+(_+[0-1]+)*/,
    hexdigits: /[[0-9a-fA-F]+(_+[0-9a-fA-F]+)*/,
    regexpctl: /[(){}\[\]\$\^|\-*+?\.]/,
    regexpesc: /\\(?:[bBdDfnrstvwWn0\\\/]|@regexpctl|c[A-Z]|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4})/,
    tokenizer: {
      root: [[/[{}]/, 'delimiter.bracket'], { include: 'common' }],
      common: [
        // identifiers and keywords
        [
          /[a-z_$][\w$]*/,
          {
            cases: {
              '@keywords': 'rs-keywords',
              '@default': 'rs-identifier'
            }
          }
        ],
        [/[A-Z][\w\$]*/, 'type.identifier'],
        // whitespace
        { include: '@whitespace' },
        // regular expression: ensure it is terminated before beginning (otherwise it is an opeator)
        [
          /\/(?=([^\\\/]|\\.)+\/([gimsuy]*)(\s*)(\.|;|,|\)|\]|\}|$))/,
          { token: 'regexp', bracket: '@open', next: '@regexp' }
        ],
        // delimiters and operators
        [/[()\[\]]/, '@brackets'],
        [/[<>](?!@symbols)/, '@brackets'],
        [/!(?=([^=]|$))/, 'delimiter'],
        [
          /@symbols/,
          {
            cases: {
              '@operators': 'delimiter',
              '@default': ''
            }
          }
        ],
        // numbers
        [/(@digits)[eE]([\-+]?(@digits))?/, 'number.float'],
        [/(@digits)\.(@digits)([eE][\-+]?(@digits))?/, 'number.float'],
        [/0[xX](@hexdigits)n?/, 'number.hex'],
        [/0[oO]?(@octaldigits)n?/, 'number.octal'],
        [/0[bB](@binarydigits)n?/, 'number.binary'],
        [/(@digits)n?/, 'number'],
        // delimiter: after number because of .\d floats
        [/[;,.]/, 'delimiter'],
        // strings
        [/"([^"\\]|\\.)*$/, 'string.invalid'],
        [/'([^'\\]|\\.)*$/, 'string.invalid'],
        [/"/, 'string', '@string_double'],
        [/'/, 'string', '@string_single'],
        [/`/, 'string', '@string_backtick']
      ],
      whitespace: [
        [/[ \t\r\n]+/, ''],
        [/\/\*\*(?!\/)/, 'comment.doc', '@jsdoc'],
        [/\/\*/, 'comment', '@comment'],
        [/\/\/.*$/, 'comment']
      ],
      comment: [
        [/[^\/*]+/, 'comment'],
        [/\*\//, 'comment', '@pop'],
        [/[\/*]/, 'comment']
      ],
      jsdoc: [
        [/[^\/*]+/, 'comment.doc'],
        [/\*\//, 'comment.doc', '@pop'],
        [/[\/*]/, 'comment.doc']
      ],
      // We match regular expression quite precisely
      regexp: [
        [
          /(\{)(\d+(?:,\d*)?)(\})/,
          ['regexp.escape.control', 'regexp.escape.control', 'regexp.escape.control']
        ],
        [
          /(\[)(\^?)(?=(?:[^\]\\\/]|\\.)+)/,
          ['regexp.escape.control', { token: 'regexp.escape.control', next: '@regexrange' }]
        ],
        [/(\()(\?:|\?=|\?!)/, ['regexp.escape.control', 'regexp.escape.control']],
        [/[()]/, 'regexp.escape.control'],
        [/@regexpctl/, 'regexp.escape.control'],
        [/[^\\\/]/, 'regexp'],
        [/@regexpesc/, 'regexp.escape'],
        [/\\\./, 'regexp.invalid'],
        [
          /(\/)([gimsuy]*)/,
          [{ token: 'regexp', bracket: '@close', next: '@pop' }, 'keyword.other']
        ]
      ],
      regexrange: [
        [/-/, 'regexp.escape.control'],
        [/\^/, 'regexp.invalid'],
        [/@regexpesc/, 'regexp.escape'],
        [/[^\]]/, 'regexp'],
        [
          /\]/,
          {
            token: 'regexp.escape.control',
            next: '@pop',
            bracket: '@close'
          }
        ]
      ],
      string_double: [
        [/[^\\"]+/, 'string'],
        [/@escapes/, 'string.escape'],
        [/\\./, 'string.escape.invalid'],
        [/"/, 'string', '@pop']
      ],
      string_single: [
        [/[^\\']+/, 'string'],
        [/@escapes/, 'string.escape'],
        [/\\./, 'string.escape.invalid'],
        [/'/, 'string', '@pop']
      ],
      string_backtick: [
        [/\$\{/, { token: 'delimiter.bracket', next: '@bracketCounting' }],
        [/[^\\`$]+/, 'string'],
        [/@escapes/, 'string.escape'],
        [/\\./, 'string.escape.invalid'],
        [/`/, 'string', '@pop']
      ],
      bracketCounting: [
        [/\{/, 'delimiter.bracket', '@bracketCounting'],
        [/\}/, 'delimiter.bracket', '@pop'],
        { include: 'common' }
      ]
    }
  })
}