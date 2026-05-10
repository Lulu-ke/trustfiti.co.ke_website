import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Google AdSense */}
        <meta name="google-adsense-account" content="ca-pub-8031704055036556" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8031704055036556"
          crossOrigin="anonymous"
        />

        {/* Favicon & Manifest */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />

        {/* Open Graph defaults */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="TrustFiti" />
        <meta property="og:locale" content="en_KE" />

        {/* Twitter Card defaults */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@TrustFitiKE" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://trustfiti.co.ke" />

        {/* Geo targeting for Kenya */}
        <meta name="geo.region" content="KE" />
        <meta name="geo.placename" content="Kenya" />

        {/* Preconnect to external resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Structured Data: Organization (JSON-LD) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "TrustFiti",
              url: "https://trustfiti.co.ke",
              logo: "https://trustfiti.co.ke/logo.png",
              description:
                "TrustFiti is Kenya's trusted review platform. Read and write reviews for businesses, share your experiences, and help others make informed decisions.",
              sameAs: [
                "https://twitter.com/TrustFitiKE",
                "https://facebook.com/TrustFitiKE",
                "https://instagram.com/TrustFitiKE",
              ],
              contactPoint: {
                "@type": "ContactPoint",
                email: "support@trustfiti.co.ke",
                contactType: "customer support",
                areaServed: "KE",
              },
            }),
          }}
        />

        {/* Structured Data: WebSite with SearchAction */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "TrustFiti",
              url: "https://trustfiti.co.ke",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://trustfiti.co.ke/companies?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
