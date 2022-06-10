import Document, {
  DocumentContext,
  Head,
  Html,
  Main,
  NextScript,
} from "next/document";
import React from "react";

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    return await Document.getInitialProps(ctx);
  }

  render() {
    return (
      <Html>
        <Head>
          {/*<link key="favicon" rel="shortcut icon" href="/favicon.png" />*/}
        </Head>

        <body>
          {/*
            Light/dark theme toggle without initial flicker. Copied from:
            https://github.com/gaearon/overreacted.io/blob/master/src/html.js#L21
          */}
          <script
            data-cfasync={false}
            dangerouslySetInnerHTML={{
              __html: `
              (function() {
                var preferredTheme = "";

                function setTheme(newTheme) {
                  window.__theme = newTheme;
                  document.body.className = newTheme;
                }
                window.__setPreferredTheme = function(newTheme) {
                  setTheme(newTheme);
                }
                var query = window.matchMedia('(prefers-color-scheme: dark)');
                setTheme(query.matches ? "dark" : "light");
                query.addEventListener("change", event => {
                  setTheme(event.matches ? "dark" : "light");
                });
              })();
            `,
            }}
          />

          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
