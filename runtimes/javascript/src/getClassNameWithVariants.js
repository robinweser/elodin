function getClassName(className, props, variants) {
  const modifiers = Object.keys(variants)
    .map(variant => {
      if (variants[variant].indexOf(props[variant]) !== -1) {
        return className + '__' + variant + '-' + props[variant]
      }
    })
    .filter(Boolean)

  return [className, ...modifiers].join(' ')
}
