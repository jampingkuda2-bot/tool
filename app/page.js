const groups = [
  {
    title: "PDF",
    tools: [
      { href: "/merge", icon: "🧩", title: "Gabung PDF", desc: "Satukan beberapa file jadi satu" },
      { href: "/split", icon: "✂️", title: "Split PDF", desc: "Pisah halaman jadi file terpisah" },
      { href: "/compress", icon: "📦", title: "Kompres PDF", desc: "Perkecil ukuran file" },
      { href: "/edit", icon: "✏️", title: "Edit / Tambah Teks", desc: "Tempel teks di atas halaman" },
    ],
  },
  {
    title: "Media",
    tools: [
      { href: "/tiktok", icon: "🎬", title: "Download TikTok", desc: "HD, tanpa watermark, MP4 & MP3" },
      { href: "/convert", icon: "🔄", title: "Konverter File", desc: "Convert video/audio, misal MP4 ke MP3" },
    ],
  },
];

export default function Home() {
  return (
    <main className="container">
      <div className="page-header">
        <h1>Tools</h1>
        <p>Semua tool jalan langsung di perangkat kamu.</p>
      </div>

      {groups.map((g) => (
        <div key={g.title}>
          <div className="ios-group-title">{g.title}</div>
          <div className="ios-group">
            {g.tools.map((t) => (
              <a key={t.href} href={t.href} className="card">
                <div className="icon-badge">{t.icon}</div>
                <div className="card-text">
                  <h3>{t.title}</h3>
                  <p>{t.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      ))}
    </main>
  );
}
