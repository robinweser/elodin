import createEmotionServer from 'create-emotion-server'
import { caches } from 'emotion'

export const {
  extractCritical,
  renderStylesToString,
  renderStylesToNodeStream,
} = createEmotionServer(caches)
