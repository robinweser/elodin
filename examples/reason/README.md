# ReasonML Example

This example uses [ReasonML](https://reasonml.github.io) with [ReasonReact](https://reasonml.github.io/reason-react/) and [@elodin/generator-reason](https://elodin.dev/docs/targets/reasonml/css-in-reason).

## Installation

```sh
# cloning the project and navigating to the example
git clone https://github.com/robinweser/elodin.git
cd elodin/examples/reason

# installing all dependencies
yarn
```

## 1. Compiling Elodin

First let's run the elodin compiler.

```sh
# This starts the elodin compiler in watch mode
yarn elodin
```

## 2. Compiling ReasonML

In another terminal, we can now run the ReasonML compiler.

```sh
# This starts the reason compiler in watch mode
yarn reason
```

## 3. Running the App

Now, we start actual compiled React App in another terminal.

```sh
yarn dev
```
