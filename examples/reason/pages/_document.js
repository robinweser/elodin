import Document, { Head, Main, NextScript } from 'next/document'
import { renderToSheetList } from 'fela-dom'

import { make as getFelaRenderer } from '../styling/FelaRenderer.bs.js'

export default class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const renderer = getFelaRenderer()
    const originalRenderPage = ctx.renderPage

    ctx.renderPage = () =>
      originalRenderPage({
        enhanceApp: App => props => <App {...props} renderer={renderer} />,
      })

    const initialProps = await Document.getInitialProps(ctx)
    const sheetList = renderToSheetList(renderer)

    return {
      ...initialProps,
      sheetList,
    }
  }

  render() {
    const styleNodes = this.props.sheetList.map(
      ({ type, rehydration, support, media, css }) => (
        <style
          dangerouslySetInnerHTML={{ __html: css }}
          data-fela-rehydration={rehydration}
          data-fela-support={support}
          data-fela-type={type}
          key={type + media}
          media={media}
        />
      )
    )

    return (
      <html>
        <Head>
          <meta httpEquiv="Content-Type" content="text/html;charset=utf-8" />
          <meta
            name="viewport"
            content="width=device-width,height=device-height,initial-scale=1, viewport-fit=cover"
          />
          {styleNodes}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    )
  }
}
