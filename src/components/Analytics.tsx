import Script from "next/script";

const AHREFS_KEY = "LLLgJUIaV9xOIcWEWMGJTA";

/**
 * Analytics tags. GA4 runs when NEXT_PUBLIC_GA_ID is set.
 * Ahrefs Analytics runs on every production request.
 */
export function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  return (
    <>
      {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}', { anonymize_ip: true });`}
          </Script>
        </>
      )}
      <Script
        src="https://analytics.ahrefs.com/analytics.js"
        data-key={AHREFS_KEY}
        strategy="afterInteractive"
      />
    </>
  );
}
