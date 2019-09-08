import Document, { Head, Main, NextScript } from 'next/document'

import config from '../elodin.config'

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
          <style
            dangerouslySetInnerHTML={{ __html: config.generator.rootReset }}
          />
          <style
            dangerouslySetInnerHTML={{ __html: config.generator.baseReset }}
          />
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
