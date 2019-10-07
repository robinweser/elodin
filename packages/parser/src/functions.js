const isBetween = (start, end) => node =>
  node.value > start && node.value <= end

export default {
  percentage: {
    params: [
      {
        type: 'Integer',
        validate: isBetween(0, 100),
      },
    ],
    return: 'Percentage',
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
}
