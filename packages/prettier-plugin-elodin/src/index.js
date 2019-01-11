import parse from './parser'
import print from './printer'

export const defaultOptions = {}

export const languages = [
  {
    name: 'elodin',
    parsers: ['elodin'],
    since: '1.0.0',
    extensions: ['.elo'],
    tmScope: 'source.elo',
    aceMode: 'text',
    vscodeLanguageIds: ['elodin'],
  },
]

export const parsers = {
  elodin: {
    parse,
    astFormat: 'elodin-ast',
    // there's only a single node
    locStart(node) {
      return node.start
    },
    locEnd(node) {
      return node.end
    },
  },
}

export const printers = {
  elodin: {
    print,
  },
}
