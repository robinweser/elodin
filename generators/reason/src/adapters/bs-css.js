import { uncapitalizeString } from '@elodin/utils'

import stringifyDeclaration from '../stringifyDeclaration'

export default function() {
  return {
    generateFile: ({
      cssImports,
      variables,
      relativeRootPath,
      variantTypes,
      modules,
    }) =>
      (variables.length > 0 ? 'open Css;' + '\n' : '') +
      cssImports +
      '[%bs.raw{|\n  require("' +
      relativeRootPath +
      '_reset.elo.css")\n|}];\n\n' +
      variantTypes +
      '\n\n' +
      modules.join('\n\n') +
      '\n',

    generateModule: ({
      style,
      variables,
      variantNames,
      variantStyleSwitch,
      variantSwitch,
      moduleName,
      module,
      className,
      styleName,
      cssImport,
    }) => {
      const baseStyle =
        style.length > 0
          ? 'let ' +
            uncapitalizeString(module.name) +
            'Style = (' +
            variables.map(variable => '~' + variable).join(', ') +
            ') => style([' +
            style.map(stringifyDeclaration).join(',\n    ') +
            ']);'
          : ''

      return (
        (baseStyle ? baseStyle + '\n' : '') +
        (variantStyleSwitch ? variantStyleSwitch + '\n\n' : '') +
        (variantSwitch ? variantSwitch + '\n\n' : '') +
        `let ` +
        styleName +
        ' = (' +
        // TODO: deduplicate
        // TODO: add typings
        variables.map(variable => '~' + variable).join(', ') +
        (variables.length > 0 && variantNames.length > 0 ? ', ' : '') +
        variantNames.map(name => '~' + name.toLowerCase() + '=?').join(', ') +
        (variables.length > 0 || variantNames.length > 0
          ? ', ()) => {\n  '
          : ') => {\n  ') +
        cssImport +
        '"' +
        className +
        (variantNames.length > 0 && variantSwitch
          ? '" ++ get' +
            module.name +
            'Variants(' +
            variantNames.map(name => '~' + name.toLowerCase()).join(', ') +
            ', ())'
          : '"') +
        (style.length > 0
          ? ' ++ " " ++ merge([' +
            (style.length > 0
              ? uncapitalizeString(module.name) +
                'Style(' +
                variables.map(variable => '~' + variable).join(', ') +
                ')'
              : '') +
            (variantStyleSwitch
              ? (style.length > 0 ? ', ' : '') +
                '...get' +
                module.name +
                'StyleVariants(' +
                variables.map(variable => '~' + variable).join(', ') +
                (variables.length > 0 && variantNames.length > 0 ? ', ' : '') +
                variantNames.map(name => '~' + name.toLowerCase()).join(', ') +
                ', ())'
              : '') +
            ']);'
          : ';') +
        '\n}'
      )
    },
  }
}
