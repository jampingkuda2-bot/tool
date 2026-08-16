import "./globals.css";
import DonationBar from "./components/DonationBar";

export const metadata = {
  title: "Tools",
  description: "PDF, downloader TikTok, dan konverter media langsung di browser",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
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
