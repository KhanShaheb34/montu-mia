"use client";

import Script from "next/script";

export function GoogleTag() {
  return (
    <>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-RKK0W9YF7S"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-RKK0W9YF7S');
        `}
      </Script>
    </>
  );
}
