# Elodin Language Specification

This document will serve as a reference for all the language features.

> **Note**: For now, we won't log changes and versions as its still an experimental WIP and subject to big changes.

### Top-Level Constructs

The Language consists of 3 major constructs that are defined at top level which are Style, Fragment and Variant.  
Apart from that, it specificies a simple module system with imports.<br>
At the end, it also specifies a standard library consisting of a set of useful functions to compose declaration values.

## Style

```elodin
style Button {
  backgroundColor: red
  fontSize: 15
  lineHeight: 1.5
  [Type=Primary] {
    color: rgb(200, 200, 100)
    fontSize: 17
  }
}
```

A Style is the main building block of Elodin. It contains style declarations for a single component which in general is a reuseable, user interface component.

Styles are declared using the **style** keyword followed by a **style name** and a **declaration block**.  
The style name is an [Identifier](#identifier) starting with a capital letter. It is unique for each file.  
The declaration block consists of [declarations](#declaration) and [conditional declarations](#conditionaldeclaration).

### Declaration

```elodin
backgroundColor: red
```

A declaration is a pair of **property** and **value** where property is an camelCased Identifier and value is a single instance of one of the [types](#types) mentioned later. It is separated using a colon.  
A declaration that references a [variable](#variable) is called dynamic declaration and are resolved during runtime. The variable value might also change over time.

> **Type System**: While any property-value pair is syntactically valid, there's a strong type system that will throw if wrong values are applied to properties. Check the [Properties]() documentation for detail information on all available properties and their allowed value types.

#### Raw Property

```elodin
__background: url("/static/test.jpg")
```

There also is a raw property syntax prefixed with a double `_`.  
It can be used to inject target-specific properties that are not part of the Elodin type system.

### ConditionalDeclaration

```elodin
[Type=Primary] {
  backgroundColor: red
}
```

Conditional declarations are special declarations that are only applied if a given **condition** is fulfilled.

#### Condition

```elodin
Type=Primary
```

##### Environment

```elodin
@hover
```

## Fragment

```elodin
fragment Flex {
  flexDirection: column
  alignSelf: stretch
}
```

## Variant

```elodin
variant Type = Primary | Secondary
```

## Types

### Identifier

```elodin
stretch
```

### Integer

```elodin
27
```

### Float

```elodin
27.45
```

### Function

```elodin
rgba(250 250 250 0.35)
```

### String

```elodin
"Hello Elodin!"
```

### Variable

```elodin
$bgColor
```

## Modules

### Color

### Math
