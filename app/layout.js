import "./globals.css";
import Script from "next/script";
import DonationBar from "./components/DonationBar";

export const metadata = {
  title: "Tools",
  description: "PDF, downloader TikTok, dan konverter media langsung di browser",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        {/* Monetag Onclick (Popunder) - aktif di seluruh halaman */}
        <Script
          id="monetag-onclick"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(s){s.dataset.zone='11591462',s.src='https://zovidree.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`,
          }}
        />

        {/* Google AdSense */}
        <Script
          id="adsense"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2293760086712206"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        <header className="topbar">
          <a href="/" className="brand">
            <span className="dot" />
            Tools
          </a>
        </header>
        {children}
        <DonationBar />
      </body>
    </html>
  );
}
