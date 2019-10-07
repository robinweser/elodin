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
  percentage: {
    params: [
      {
        type: 'Integer',
        validate: isBetween(0, 100),
      },
    ],
    return: 'Percentage',
  },

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
}
