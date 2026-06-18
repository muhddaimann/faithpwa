import React from "react";
import { ScrollViewStyleReset } from "expo-router/html";

const pwaViewport =
  "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover";

const baseStyle = `
html, body, #root {
  margin: 0;
  padding: 0;
  width: 100%;
}
html {
  height: 100%;
}
body {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 100dvh;
  overflow: hidden;
  overscroll-behavior: none;
  -webkit-tap-highlight-color: transparent;
  background-color: transparent;
}
#root {
  display: flex;
  flex-direction: column;
  height: 100dvh;
}
/* iOS Safari fallback — keep body and #root matched there too. */
@supports (-webkit-touch-callout: none) {
  body,
  #root {
    height: -webkit-fill-available;
  }
}
`;

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content={pwaViewport} />

        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="Our Companion" />

        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: baseStyle }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
