"use client";
import { useState, useRef } from "react";
import { saveAs } from "file-saver";

const FFMPEG_BASE = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
const FORMATS = ["mp3", "wav", "mp4", "gif"];

export default function ConvertPage() {
  const [file, setFile] = useState(null);
  const [outputFormat, setOutputFormat] = useState("mp3");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const ffmpegRef = useRef(null);
  const inputRef = useRef(null);

  async function loadFfmpeg() {
    if (ffmpegRef.current) return ffmpegRef.current;
    setStatus("Memuat engine converter (sekali saja, sekitar 20-30MB)...");
    const { FFmpeg } = await import("@ffmpeg/ffmpeg");
    const { toBlobURL } = await import("@ffmpeg/util");
    const ffmpeg = new FFmpeg();
    ffmpeg.on("progress", ({ progress: p }) => setProgress(Math.round(p * 100)));
    await ffmpeg.load({
      coreURL: await toBlobURL(`${FFMPEG_BASE}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${FFMPEG_BASE}/ffmpeg-core.wasm`, "application/wasm"),
    });
    ffmpegRef.current = ffmpeg;
    return ffmpeg;
  }

  async function doConvert() {
    if (!file) return;
    setBusy(true);
    setProgress(0);
    try {
      const { fetchFile } = await import("@ffmpeg/util");
      const ffmpeg = await loadFfmpeg();
      setStatus("Mengonversi...");

      const inputName = file.name;
      const dotIdx = inputName.lastIndexOf(".");
      const baseName = dotIdx >= 0 ? inputName.slice(0, dotIdx) : inputName;
      const outputName = `${baseName}.${outputFormat}`;

      await ffmpeg.writeFile(inputName, await fetchFile(file));

      const isAudioOnly = outputFormat === "mp3" || outputFormat === "wav";
      const args = isAudioOnly
        ? ["-i", inputName, "-vn", outputName]
        : ["-i", inputName, outputName];

      await ffmpeg.exec(args);

      const data = await ffmpeg.readFile(outputName);
      const mimeMap = { mp3: "audio/mpeg", wav: "audio/wav", mp4: "video/mp4", gif: "image/gif" };
      saveAs(new Blob([data.buffer], { type: mimeMap[outputFormat] || "application/octet-stream" }), outputName);
      setStatus("Selesai! File terdownload.");
    } catch (e) {
      setStatus("Gagal: " + e.message);
    }
    setBusy(false);
  }

  return (
    <main className="container">
      <a className="back-link" href="/">← Kembali</a>
      <div className="page-header">
        <h1>Konverter File</h1>
        <p>Convert video/audio langsung di browser — misal MP4 ke MP3. Proses pertama kali agak lama karena harus memuat engine converter dulu.</p>
      </div>

      <div className="dropzone" onClick={() => inputRef.current.click()}>
        <p>{file ? file.name : "Ketuk untuk pilih file video/audio"}</p>
        <input ref={inputRef} type="file" accept="video/*,audio/*" onChange={(e) => setFile(e.target.files[0])} />
      </div>

      {file && (
        <>
          <div className="field">
            <label>Convert ke format</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {FORMATS.map((f) => (
                <button
                  key={f}
                  className={`btn ${outputFormat === f ? "" : "secondary"} small`}
                  onClick={() => setOutputFormat(f)}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <button className="btn" disabled={busy} onClick={doConvert}>
            {busy ? `Memproses... ${progress}%` : `Convert ke ${outputFormat.toUpperCase()} & Download`}
          </button>
        </>
      )}

      {status && (
        <p className={`status ${status.startsWith("Gagal") ? "err" : status.startsWith("Selesai") ? "ok" : ""}`}>
          {status}
        </p>
      )}
    </main>
  );
}
