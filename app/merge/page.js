"use client";
import { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";

export default function MergePage() {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);

  function addFiles(list) {
    const arr = Array.from(list).filter((f) => f.type === "application/pdf");
    setFiles((prev) => [...prev, ...arr]);
  }

  function move(i, dir) {
    setFiles((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  function remove(i) {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function mergeFiles() {
    if (files.length < 2) {
      setStatus("Pilih minimal 2 file PDF.");
      return;
    }
    setBusy(true);
    setStatus("Menggabungkan...");
    try {
      const merged = await PDFDocument.create();
      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const src = await PDFDocument.load(bytes);
        const pages = await merged.copyPages(src, src.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      }
      const out = await merged.save();
      saveAs(new Blob([out], { type: "application/pdf" }), "merged.pdf");
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
        <h1>Gabung PDF</h1>
        <p>Upload beberapa file, atur urutan, lalu gabungkan jadi satu PDF.</p>
      </div>

      <div className="dropzone" onClick={() => inputRef.current.click()}>
        <p>Ketuk untuk pilih file PDF (bisa lebih dari satu)</p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          multiple
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <div className="filelist">
          {files.map((f, i) => (
            <div className="fileitem" key={i}>
              <span className="name">{i + 1}. {f.name}</span>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="btn secondary small" onClick={() => move(i, -1)}>↑</button>
                <button className="btn secondary small" onClick={() => move(i, 1)}>↓</button>
                <button className="btn danger small" onClick={() => remove(i)}>Hapus</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="btn" disabled={busy || files.length < 2} onClick={mergeFiles}>
        {busy ? "Memproses..." : "Gabungkan & Download"}
      </button>

      {status && <p className={`status ${status.startsWith("Gagal") ? "err" : status.startsWith("Selesai") ? "ok" : ""}`}>{status}</p>}
    </main>
  );
}
