export function createError(error) {
  switch (error.type) {
    case 'INVALID_PROPERTY':
      return {
        message:
          error.property +
          ': ' +
          error.value.value +
          '\n^-------\n' +
          'The property ' +
          error.property +
          ' is an invalid property.' +
          '\n' +
          'In ' +
          error.parent.name +
          (error.path
            ? ' (' +
              error.path +
              ':' +
              error.source.substr(0, error.token.start).split('\n').length +
              ')'
            : '') +
          '\n',
      }

    case 'INVALID_VALUE':
      return {
        message:
          error.property +
          ': ' +
          error.value.value +
          '\n' +
          ' '.repeat(error.property.length + 2) +
          '^-------\n' +
          'The value ' +
          error.value.value +
          ' is an invalid value for the property ' +
          error.property +
          '.\n' +
          'In ' +
          error.parent.name +
          (error.path
            ? ' (' +
              error.path +
              ':' +
              error.source.substr(0, error.token.start).split('\n').length +
              ')'
            : '') +
          '\n',
      }

    default:
      return {
        message: JSON.stringify(error),
      }
  }
}
