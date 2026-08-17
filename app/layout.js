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
        {/* Iklan sekarang dipicu manual dari tombol "Tonton Iklan", bukan otomatis di seluruh halaman */}

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
