import keywords from './keywords'
import traverse from '@babel/traverse'
import * as t from '@babel/types'

const isFirstCharUpperCase = (value) => {
  return /^[A-Z]/.test(value)
}

const isFrom = (data, parent, key) => {
  if (!parent[key]) return
  return parent[key].start === data.start && parent[key].end === data.end
}

const parseType = (data) => {
  return data.replace(/([A-Z]*)/g, function (t) {
    return t.toLowerCase()
  })
}

self.addEventListener('message', event => {
  const { code, version } = event.data
  try {
    const classifications = []
    const ast = require("@babel/parser").parse(code, {
      sourceType: "module",
      tokens: true,
      errorRecovery: true,
      createParenthesizedExpressions: true,
      plugins: [
        "jsx"
      ]
    })

    const redefine = ast.tokens.filter(o => o.type.label === 'name')

    const process = (path) => {
      try {
        const parent = path.parent
        const node = path.node
        const { start, end } = node.loc

        /** function arguments */
        if (t.isFunctionDeclaration(parent) || t.isClassMethod(parent) || t.isObjectMethod(parent) || t.isArrowFunctionExpression(parent)) {
          if (parent.params.some(o => o.start === node.start && o.end === node.end)) {
            classifications.push({
              start: start.column + 1,
              end: end.column + 1,
              kind: 'argument',
              startLine: start.line,
              endLine: end.line
            })
          }
          if (isFrom(node, parent, 'key')) {
            classifications.push({
              start: start.column + 1,
              end: end.column + 1,
              kind: 'method',
              startLine: start.line,
              endLine: end.line
            })
          }
          return
        }
        /** object chain */
        if (t.isMemberExpression(parent)) {
          if (isFrom(node, parent, 'object')) {
            classifications.push({
              start: start.column + 1,
              end: end.column + 1,
              kind: 'object',
              startLine: start.line,
              endLine: end.line
            })
          }
          if (isFrom(node, parent, 'property')) {
            classifications.push({
              start: start.column + 1,
              end: end.column + 1,
              kind: 'property',
              startLine: start.line,
              endLine: end.line
            })
          }
          return
        }
        /** callee arguments */
        if (t.isCallExpression(parent)) {
          if (parent.arguments.some(o => o.start === node.start && o.end === node.end)) {
            classifications.push({
              start: start.column + 1,
              end: end.column + 1,
              kind: 'argument',
              startLine: start.line,
              endLine: end.line
            })
          }
          if (isFrom(node, parent, 'callee')) {
            classifications.push({
              start: start.column + 1,
              end: end.column + 1,
              kind: 'callee',
              startLine: start.line,
              endLine: end.line
            })
          }
          return
        }
        /** common */
        if (redefine.length > 0) {
          const next = redefine.find(o => o.start === node.start && o.end === node.end)
          if (next) {
            classifications.push({
              start: start.column + 1,
              end: end.column + 1,
              kind: parseType(path.type || parent.type),
              startLine: start.line,
              endLine: end.line
            })
          }
        }
      } catch (err) {
        console.log(err)
      }
    }

    traverse(ast, {
      Identifier (path) {
        process(path)
      },
      JSXAttribute (path) {
        const node = path.node
        const { start, end } = node.loc
        classifications.push({
          start: start.column + 1,
          end: end.column + 1,
          kind: 'jsx-attr',
          startLine: start.line,
          endLine: end.line
        })
      },
      JSXExpressionContainer (path) {
        const node = path.node
        const { start, end } = node.loc
        classifications.push({
          start: start.column + 1,
          end: start.column + 2,
          kind: 'jsx-bracket',
          startLine: start.line,
          endLine: end.line
        })
        classifications.push({
          start: end.column,
          end: end.column + 1,
          kind: 'jsx-bracket',
          startLine: start.line,
          endLine: end.line
        })
        classifications.push({
          start: start.column + 2,
          end: end.column,
          kind: 'jsx-exp',
          startLine: start.line,
          endLine: end.line
        })
      }
    })

    console.log(ast)

    ast.tokens.forEach(o => {
      const label = o.type.label
      const { start, end } = o.loc

      function append (kind = '') {
        classifications.push({
          start: start.column + 1,
          end: end.column + 1,
          kind: kind,
          startLine: start.line,
          endLine: end.line
        })
      }

      const keyword = keywords(o.value)
      if (keyword) {
        append(keyword)
        return
      }
      switch (label) {
        case 'jsxTagStart':
          append('lt')
          break
        case 'jsxTagEnd':
          append('gt')
          break
        case 'name':
          append('normal')
          append(isFirstCharUpperCase(o.value) ? 'upper' : 'lower')
          break
        case '/':
          append('forward-slash')
          break
        case 'jsxText':
          append('jsx-text')
          break
        case 'jsxName':
          append(isFirstCharUpperCase(o.value) ? 'jsx-element' : 'jsx-origin-element')
          break
        case 'num':
          append('number')
          break
        case 'string':
          append('string')
          break
      }
    })
    self.postMessage({ classifications, version })
  } catch(e) {
    /* Ignore error */
  }
})