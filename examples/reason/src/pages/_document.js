import Document, { Head, Main, NextScript } from 'next/document'

import { extractCritical } from '../styling/emotionServer'

export default class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const emotionCss = extractCritical(ctx.renderPage().html).css
    const initialProps = await Document.getInitialProps(ctx)

    return {
      ...initialProps,
      emotionCss,
    }
  }

  render() {
    return (
      <html>
        <Head>
          <meta httpEquiv="Content-Type" content="text/html;charset=utf-8" />
          <meta
            name="viewport"
            content="width=device-width,height=device-height,initial-scale=1, viewport-fit=cover"
          />
          <style dangerouslySetInnerHTML={{ __html: this.props.emotionCss }} />
          <link rel="stylesheet" href="/static/reset.css" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    )
  }
}
