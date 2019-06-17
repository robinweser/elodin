# The Elodin Styling Language

> **Warning**: Elodin is still WIP and experimental. It is not recommended to use it in production yet. There might be unknown bugs and the APIs might change rapidly.

Elodin is a styling language that aims to provide a universal way to author user interface styles. It uses a single file format that compiles to several different plattforms, languages, frameworks and libraries.

<img alt="TravisCI" src="https://travis-ci.org/rofrischmann/elodin.svg?branch=master"> <img alt="npm downloads" src="https://img.shields.io/npm/dm/@elodin/core.svg">

## Installation

Depending on which targets you're building for, there are different installation steps and requirements.<br>
Usually you'll start by installing the core package and the CLI.

```sh
yarn add @elodin/core @elodin/cli
```

Alternatively, one can also use npm.

```sh
npm i --save @elodin/core @elodin/cli
```

## The Gist

```
view Header {
  backgroundColor: rgb(100 100 100)
  height: percentage(80)
  justifyContent: center
  alignItems: flexEnd
  paddingBottom: 10
  paddingTop: 10
  flexGrow: 1
}

text HeaderText {
  lineHeight: 1.2
  textAlign: center
  fontSize: 20
}
```

## Targets

- JavaScript
  - CSS in JS
    - fela
    - react-fela

#### Planned

- JavaScript
  - CSS in JS
    - styled-components
    - emotion
    - glamor
    - jss
  - Vanilla
  - React Native
- ReasonML
  - bs-css
- SwiftUI

## Documentation

- [Introduction]()
- [Basics]()
- [API Reference]()

## Examples

- [React](examples/react)

## Contributing

> Elodin is still experimental and we appreciate any kind of contribution even if it's just feedback!

Feel free to ask questions and give feedback on [Spectrum](https://spectrum.chat/elodin).<br>
For more information follow the [contribution guide](.github/CONTRIBUTING.md).<br>
Also, please read our [code of conduct](.github/CODE_OF_CONDUCT.md).

## License

Elodin is licensed under the [MIT License](http://opensource.org/licenses/MIT).<br>
Documentation is licensed under [Creative Common License](http://creativecommons.org/licenses/by/4.0/).<br>
Created with ♥ by [@rofrischmann](http://rofrischmann.de) and all the great contributors.
