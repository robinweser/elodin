import Document, { Head, Main, NextScript } from 'next/document'
import { getReset } from '@elodin/generator-reason'

export default class MyDocument extends Document {
  render() {
    return (
      <html>
        <Head>
          <meta httpEquiv="content-type" content="text/html; charset=utf-8" />
          <meta
            name="viewport"
            content="width=device-width,height=device-height,initial-scale=1, viewport-fit=cover"
          />
          <style dangerouslySetInnerHTML={{ __html: getReset('#__next') }} />
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
