const isBetween = (start, end) => node =>
  node.value > start && node.value <= end

export default {
  raw: {
    params: [
      {
        type: 'String',
      },
    ],
    return: 'RawValue',
  },
  fallback: {
    params: [
      {
        type: 'Variable',
      },
      {
        type: 'any',
      },
    ],
    return: params => params[1].type,
  },
  percentage: {
    params: [
      {
        type: 'Integer',
        validate: isBetween(0, 100),
      },
    ],
    return: 'Percentage',
  },

  // colors
  hsl: {
    params: [
      {
        type: 'Integer',
        validate: isBetween(0, 360),
      },
      {
        type: 'Percentage',
      },
      {
        type: 'Percentage',
      },
    ],
    return: 'Color',
  },
  hsla: {
    params: [
      {
        type: 'Integer',
        validate: isBetween(0, 360),
      },
      {
        type: 'Percentage',
      },
      {
        type: 'Percentage',
      },
      {
        type: 'Percentage',
      },
    ],
    return: 'Color',
  },
  rgb: {
    params: [
      {
        type: 'Integer',
        validate: isBetween(0, 255),
      },
      {
        type: 'Integer',
        validate: isBetween(0, 255),
      },
      {
        type: 'Integer',
        validate: isBetween(0, 255),
      },
    ],
    return: 'Color',
  },
  rgba: {
    params: [
      {
        type: 'Integer',
        validate: isBetween(0, 255),
      },
      {
        type: 'Integer',
        validate: isBetween(0, 255),
      },
      {
        type: 'Integer',
        validate: isBetween(0, 255),
      },
      {
        type: 'Percentage',
      },
    ],
    return: 'Color',
  },

  // color manipulation
  negate: {
    params: [
      {
        type: 'Color',
      },
    ],
  },
  lighten: {
    params: [
      {
        type: 'Color',
      },
      {
        type: 'Percentage',
      },
    ],
  },
  darken: {
    params: [
      {
        type: 'Color',
      },
      {
        type: 'Percentage',
      },
    ],
  },
  saturate: {
    params: [
      {
        type: 'Color',
      },
      {
        type: 'Percentage',
      },
    ],
  },
  desaturate: {
    params: [
      {
        type: 'Color',
      },
      {
        type: 'Percentage',
      },
    ],
  },
  fade: {
    params: [
      {
        type: 'Color',
      },
      {
        type: 'Percentage',
      },
    ],
  },
  opaquer: {
    params: [
      {
        type: 'Color',
      },
      {
        type: 'Percentage',
      },
    ],
  },
  grayscale: {
    params: [
      {
        type: 'Color',
      },
    ],
  },

  // math
  add: {
    types: ['Integer', 'Float'],
    return: params =>
      params.find(param => param.type === 'Float') ? 'Float' : 'Integer',
  },
  sub: {
    types: ['Integer', 'Float'],
    return: params =>
      params.find(param => param.type === 'Float') ? 'Float' : 'Integer',
  },
  mul: {
    types: ['Integer', 'Float'],
    return: params =>
      params.find(param => param.type === 'Float') ? 'Float' : 'Integer',
  },
  div: {
    types: ['Integer', 'Float'],
    return: params =>
      params.find(param => param.type === 'Float') ? 'Float' : 'Integer',
  },
}
