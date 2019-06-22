# The Elodin Styling Language

> **Warning**: Elodin is still WIP and experimental. It is not recommended to use it in production yet. There might be unknown bugs and the APIs might change rapidly.

Elodin is a small styling language that aims to provide a universal way to author user interface styles. It uses a single file format that compiles to several different plattforms, languages, frameworks and libraries.

<img alt="npm downloads" src="https://img.shields.io/npm/dm/@elodin/core.svg">

## Why

Gone are the days where products only target a specific platform. Nowadays our customers expect us to support all kind of platforms, devices and system. We have browser apps, mobile apps, tv apps, VR apps and even embedded apps e.g. in cars.
Given their different requirements, capabilities and technological background, we use very different languages, libraries and tools to built those apps. While this accounts for performant and high-quality apps on all platforms, it also leads to duplicate implementations of a similar UI without a way to reuse the underlying primitives.<br>
Yet, most platforms share quite a lot visual properties. After all, we want to implement a similar visual experience everywhere to create a seamless user experience across platforms.<br>
That's where Elodin enters the game. It provides an easy-to-use declarative format to define primitive style components, which then compiles to native applicable code for all kind of different platforms.

## How

Elodin defines a set of style properties that many platforms have in common. During compilation, all components are parsed into an AST where all properties are strongly validated to match their provided types. This AST is then used to generate native platform-specific code using so called generators. Each generator targets a specific platform and has many different configuration options in order to satisfy as much requirements as possible.

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

## Documentation

To be done.

<!-- - [Setup]()
- [Introduction]()
- [Language]()
- [Usage Guides]()
- [API Reference]() -->

## Examples

- Web
  - [React](examples/react)

## Contributing

Feel free to ask questions and give feedback on [Spectrum](https://spectrum.chat/elodin).<br>
For more information follow the [contribution guide](.github/CONTRIBUTING.md).<br>
Also, please read our [code of conduct](.github/CODE_OF_CONDUCT.md).

## License

Elodin is licensed under the [MIT License](http://opensource.org/licenses/MIT).<br>
Documentation is licensed under [Creative Common License](http://creativecommons.org/licenses/by/4.0/).<br>
Created with ♥ by [@weser.io](http://weser.io).
