# Contributing
Want to get involved? **Awesome!**<br>
Please read the following guide on how to contribute, create issues and send pull requests.

If you have a feature request please create an issue.
Also if you're even improving Eldoin by any kind please don't be shy and send a pull request to let everyone benefit.

## Project setup

We assume that you got [node](https://nodejs.org) and [yarn](https://yarnpkg.com) in your environment. To get started with the repo:

```
git clone git@github.com:robinweser/elodin.git
cd elodin
yarn
```

**Fela is a collection of multiple packages**. We use the tool [lerna](https://lernajs.io/) to maintain it.
The source code can be found in several subfolders:
- [/packages](packages): all core packages
- [/generators](generators): all code generators
- [/runtimes](runtimes): all runtime dependencies
- [/plugins](plugins): all plugins

Additionally one can find all examples in [/examples](examples).

## Commands

In order to run the tests:


Tests:

```
yarn test
```

Linting:

```
yarn lint
```

Formatting:

```
yarn format
```

You can also run all three of them at the same time:

```
yarn check
```

Note: If your tests use other elodin packages as depedencies, you might need to run `yarn build`. You can run it either from the root which builds every package or just inside a package which only builds a specific one (way faster).

## Tip for developing

Elodin contains many examples. It can be handy to smoke test your changes as a part of one of them.

## Code Formatting
We use [prettier](https://prettier.io/), an opinionated code formatter. If you're using [VSCode](https://code.visualstudio.com) we recommend [prettier-vscode](https://github.com/prettier/prettier-vscode) with the **format on save** option enabled. If you're using [Atom](https://atom.io) we recommend [prettier-atom](https://atom.io/packages/prettier-atom) with the **format on save**. If you're using [Sublime](https://www.sublimetext.com/) try [SublimeJSPrettier](https://github.com/jonlabelle/SublimeJsPrettier). For other integrations, please check the prettier's [homepage](https://prettier.io/).

## Guide-Lines
1. Fork the repo and create your feature/bug branch from `master`.
2. If you've added code that should be tested, add tests!
3. If you've changed APIs, update the documentation.
4. Ensure that all tests pass (`yarn check`).

## Creating Issues
### Known Issues
Before creating an issue please make sure it has not aleady been created/solved before. Also please search the docs for possible explanations.
Browse both open **and** closed issues. If you feel something is unclear you might also add it to the docs or FAQ's directly.

### Bugs & Feature Requests
If you found a new bug or got a feature request feel free to file a new issue. For both we got predefined templates which you should fill out as detailed as possible.

## Sending Pull Requests
If you are creating a pull request, try to use commit messages that are self-explanatory. Be sure to meet all guide-lines from above. If you're pushing a Work in Progress, please flag it and optionally add a description if something needs to be discussed.
