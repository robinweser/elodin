# ELodin

> **Warning**: Elodin is still WIP and experimental. It is not recommended to use it in production yet. There might be unknown bugs and the APIs might change rapidly.

Elodin is a small styling language that aims to provide a universal way to author user interface styles.

- **Component-based**:<br>Elodin styles are authored on component-base and fully encapsulated from other styles accounting for predictable styling without side-effects. It also enables automatic code-splitting where each component is rendered to a new file.
- **Quick learning-curve**:<br>The syntax is a mix of CSS and JavaScript with some concepts from ReasonML and thus already familiar to many developers. It is declarative and unlike CSS only supports **one** value per property.
- **Write once, use everywhere**:<br>Elodin compiles to a variety of different languages, platforms and libraries without having to change a single line. It's truly one file for all targets!
- **Type-safe properties**:<br>The compiler will validate every property-value pair and throw on invalid rules resulting in solid code and bulletproof output. If it compiles, it works!

<img alt="License" src="https://img.shields.io/badge/license-MIT-brightgreen.svg"></a> <a href="https://spectrum.chat/elodin"><img alt="Spectrum" src="https://img.shields.io/badge/support-spectrum-brightgreen.svg"></a> <img alt="npm downloads" src="https://img.shields.io/npm/dm/@elodin/core.svg">


## Example

> **Note**: This example uses the [generator-css-in-js]() with the [fela]() adapter which is just one of many possible targets. Depending on the configuration the output will vary a lot.

```
variant Mode {
  Dark
  Light
}

view Header {
  height: $height
  justifyContent: center
  alignItems: flexEnd
  paddingBottom: 10
  paddingTop: 10

  [Mode=Dark] {
    backgroundColor: black
  }

  [Mode=Light] {
    backgroundColor: white
  }
}

text Label {
  fontSize: 15
  color: rgb(255 0 255)
}
```

This compiles to the following files where `_hash` is just a placeholder for an auto-generated unique class name.

**Header.elo.css**

```css
._hash {
  justify-content: center;
  align-items: flex-end;
  padding-bottom: 10;
  padding-top: 10;
}

._hash__Mode-Dark {
  background-color: black;
}

._hash__Mode-Light {
  background-color: white;
}
```

**Label.elo.css**

```css
._hash {
  font-size: 15px;
  color: rgb(255, 0, 255);
}
```

**Header.elo.js**

```js
import './Header.elo.css'
import { getClassNameFromVariantMap } from '@elodin/runtime'

const variantClassNameMap = {
  '': {},
  '__Mode-Dark': {
    Mode: 'Dark',
  },
  '__Mode-Light': {
    Mode: 'Light',
  },
}

export default function Header(props) {
  return {
    _className:
      '_elo_view _hash ' +
      getClassNameFromVariantMap(variantClassNameMap, props),
    height: props.height,
  }
}
```

**Label.elo.js**

```js
import './Label.elo.css'

export default function Label() {
  return {
    _className: '_elo_text _hash',
  }
}
```

## Documentation

- [Setup]()
- [Introduction]()
- [Language]()
- [Usage Guides]()
- [API Reference]()

## Examples

- Web
  - [React](examples/react)
  - [Reason](examples/reason)
- Mobile
  - [React Native](examples/react-native)

## Tooling

- [VS Code Language Plugin](https://marketplace.visualstudio.com/items?itemName=robinweser.language-elodin)
- [Prettier Plugin](../packages/pretter-plugin-elodin)

## Contributing

Feel free to ask questions and give feedback on [Spectrum](https://spectrum.chat/elodin).<br>
For more information follow the [contribution guide](.github/CONTRIBUTING.md).<br>
Also, please read our [code of conduct](.github/CODE_OF_CONDUCT.md).

## License

Elodin is licensed under the [MIT License](http://opensource.org/licenses/MIT).<br>
Documentation is licensed under [Creative Common License](http://creativecommons.org/licenses/by/4.0/).<br>
Created with ♥ by [Robin Weser](http://weser.io).
