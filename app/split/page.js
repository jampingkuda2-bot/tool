"use client";
import { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import JSZip from "jszip";

function parseRanges(str, max) {
  // "1-3,5,7-8" -> [[0,2],[4,4],[6,7]] (0-indexed inclusive)
  const parts = str.split(",").map((s) => s.trim()).filter(Boolean);
  const out = [];
  for (const p of parts) {
    if (p.includes("-")) {
      const [a, b] = p.split("-").map((n) => parseInt(n, 10));
      if (!isNaN(a) && !isNaN(b)) out.push([Math.max(1, a) - 1, Math.min(max, b) - 1]);
    } else {
      const n = parseInt(p, 10);
      if (!isNaN(n)) out.push([n - 1, n - 1]);
    }
  }
  return out;
}

export default function SplitPage() {
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [mode, setMode] = useState("all"); // "all" = each page separate, "range" = custom ranges
  const [ranges, setRanges] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);

  async function handleFile(f) {
    if (!f || f.type !== "application/pdf") return;
    setFile(f);
    const bytes = await f.arrayBuffer();
    const doc = await PDFDocument.load(bytes);
    setPageCount(doc.getPageCount());
    setStatus("");
  }

  async function doSplit() {
    if (!file) return;
    setBusy(true);
    setStatus("Memproses...");
    try {
      const bytes = await file.arrayBuffer();
      const src = await PDFDocument.load(bytes);
      const zip = new JSZip();

      if (mode === "all") {
        for (let i = 0; i < src.getPageCount(); i++) {
          const doc = await PDFDocument.create();
          const [p] = await doc.copyPages(src, [i]);
          doc.addPage(p);
          const out = await doc.save();
          zip.file(`page-${i + 1}.pdf`, out);
        }
      } else {
        const rs = parseRanges(ranges, src.getPageCount());
        if (rs.length === 0) {
          setStatus("Format range tidak valid. Contoh: 1-3,5,7-8");
          setBusy(false);
          return;
        }
        let idx = 1;
        for (const [a, b] of rs) {
          const doc = await PDFDocument.create();
          const indices = [];
          for (let i = a; i <= b; i++) indices.push(i);
          const pages = await doc.copyPages(src, indices);
          pages.forEach((p) => doc.addPage(p));
          const out = await doc.save();
          zip.file(`bagian-${idx}.pdf`, out);
          idx++;
        }
      }

      const blob = await zip.generateAsync({ type: "blob" });
      saveAs(blob, "split-result.zip");
      setStatus("Selesai! ZIP terdownload.");
    } catch (e) {
      setStatus("Gagal: " + e.message);
    }
    setBusy(false);
  }

  return (
    <main className="container">
      <a className="back-link" href="/">← Kembali</a>
      <div className="page-header">
        <h1>Split PDF</h1>
        <p>Pecah PDF jadi beberapa file, hasil dikemas dalam ZIP.</p>
      </div>

      <div className="dropzone" onClick={() => inputRef.current.click()}>
        <p>{file ? file.name : "Ketuk untuk pilih file PDF"}</p>
        <input ref={inputRef} type="file" accept="application/pdf" onChange={(e) => handleFile(e.target.files[0])} />
      </div>

      {pageCount > 0 && (
        <>
          <p className="status">Total halaman: {pageCount}</p>

          <div className="field">
            <label>Mode split</label>
            <div style={{ display: "flex", gap: 8 }}>
              <button className={`btn ${mode === "all" ? "" : "secondary"} small`} onClick={() => setMode("all")}>Tiap halaman terpisah</button>
              <button className={`btn ${mode === "range" ? "" : "secondary"} small`} onClick={() => setMode("range")}>Range custom</button>
            </div>
          </div>

          {mode === "range" && (
            <div className="field">
              <label>Range halaman (contoh: 1-3,5,7-8)</label>
              <input type="text" value={ranges} onChange={(e) => setRanges(e.target.value)} placeholder="1-3,5,7-8" />
            </div>
          )}

          <button className="btn" disabled={busy} onClick={doSplit}>
            {busy ? "Memproses..." : "Split & Download ZIP"}
          </button>
        </>
      )}

      {status && <p className={`status ${status.startsWith("Gagal") ? "err" : status.startsWith("Selesai") ? "ok" : ""}`}>{status}</p>}
    </main>
  );
}
