var join = require('path').join
var transformFile = require('@elodin/core').transformFile
var cssGenerator = require('@elodin/generator-css-in-js').default

console.log(cssGenerator)

transformFile(join(__dirname, 'style.elodin'), cssGenerator)
