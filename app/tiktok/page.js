"use client";
import { useState } from "react";

export default function TikTokPage() {
  const [link, setLink] = useState("");
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function fetchVideo() {
    if (!link.trim()) return;
    setBusy(true);
    setStatus("Mengambil data video...");
    setResult(null);
    try {
      const res = await fetch(`/api/tiktok?url=${encodeURIComponent(link.trim())}`);
      const json = await res.json();
      if (json.error) {
        setStatus("Gagal: " + json.error);
      } else {
        setResult(json.data);
        setStatus("");
      }
    } catch (e) {
      setStatus("Gagal: " + e.message);
    }
    setBusy(false);
  }

  function dl(url, filename) {
    return `/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
  }

  return (
    <main className="container">
      <a className="back-link" href="/">← Kembali</a>
      <div className="page-header">
        <h1>Download TikTok</h1>
        <p>Tempel link video TikTok, download versi HD tanpa watermark plus audio-nya.</p>
      </div>

      <div className="field">
        <label>Link video TikTok</label>
        <input
          type="text"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://www.tiktok.com/@user/video/..."
        />
      </div>

      <button className="btn" disabled={busy} onClick={fetchVideo}>
        {busy ? "Memproses..." : "Ambil Video"}
      </button>

      {status && <p className={`status ${status.startsWith("Gagal") ? "err" : ""}`}>{status}</p>}

      {result && (
        <div style={{ marginTop: 20 }}>
          {result.cover && (
            <img
              src={result.cover}
              alt="thumbnail"
              style={{ width: "100%", borderRadius: 12, border: "1px solid var(--border)" }}
            />
          )}
          <p style={{ fontSize: 14, marginTop: 10 }}>{result.title}</p>
          {result.author?.unique_id && (
            <p style={{ fontSize: 12, color: "var(--text-dim)" }}>@{result.author.unique_id}</p>
          )}

          <a className="btn" href={dl(result.hdplay || result.play, "tiktok-hd.mp4")}>
            ⬇️ Download MP4 (HD, tanpa watermark)
          </a>
          <a className="btn secondary" href={dl(result.play, "tiktok.mp4")}>
            ⬇️ Download MP4 (Standar)
          </a>
          {result.music && (
            <a className="btn secondary" href={dl(result.music, "tiktok-audio.mp3")}>
              🎵 Download MP3 (Audio saja)
            </a>
          )}
        </div>
      )}

      <p className="status" style={{ marginTop: 20 }}>
        Gunakan hanya untuk video publik dan hormati hak cipta pembuat konten.
      </p>
    </main>
  );
}
