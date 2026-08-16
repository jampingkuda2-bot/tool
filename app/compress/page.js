"use client";
import { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";

export default function CompressPage() {
  const [file, setFile] = useState(null);
  const [quality, setQuality] = useState(0.6);
  const [scale, setScale] = useState(1.2);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [sizes, setSizes] = useState(null);
  const inputRef = useRef(null);

  function handleFile(f) {
    if (!f || f.type !== "application/pdf") return;
    setFile(f);
    setStatus("");
    setSizes(null);
  }

  async function doCompress() {
    if (!file) return;
    setBusy(true);
    setStatus("Merender halaman...");
    try {
      const pdfjsLib = await import("pdfjs-dist/build/pdf");
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

      const originalBytes = await file.arrayBuffer();
      const originalSize = originalBytes.byteLength;

      const loadingTask = pdfjsLib.getDocument({ data: originalBytes.slice(0) });
      const pdf = await loadingTask.promise;

      const outDoc = await PDFDocument.create();

      for (let i = 1; i <= pdf.numPages; i++) {
        setStatus(`Memproses halaman ${i}/${pdf.numPages}...`);
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        await page.render({ canvasContext: ctx, viewport }).promise;

        const jpegDataUrl = canvas.toDataURL("image/jpeg", quality);
        const jpegBytes = await (await fetch(jpegDataUrl)).arrayBuffer();
        const jpgImage = await outDoc.embedJpg(jpegBytes);

        const pdfPage = outDoc.addPage([viewport.width, viewport.height]);
        pdfPage.drawImage(jpgImage, {
          x: 0,
          y: 0,
          width: viewport.width,
          height: viewport.height,
        });
      }

      const outBytes = await outDoc.save();
      saveAs(new Blob([outBytes], { type: "application/pdf" }), "compressed.pdf");
      setSizes({ before: originalSize, after: outBytes.byteLength });
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
        <h1>Kompres PDF</h1>
        <p>Halaman di-render ulang jadi gambar kualitas lebih rendah lalu disusun ulang jadi PDF. Cocok untuk PDF hasil scan / berisi banyak gambar. Teks jadi tidak bisa di-select lagi setelah dikompres.</p>
      </div>

      <div className="dropzone" onClick={() => inputRef.current.click()}>
        <p>{file ? file.name : "Ketuk untuk pilih file PDF"}</p>
        <input ref={inputRef} type="file" accept="application/pdf" onChange={(e) => handleFile(e.target.files[0])} />
      </div>

      {file && (
        <>
          <div className="field">
            <label>Kualitas gambar: {Math.round(quality * 100)}%</label>
            <input type="range" min="0.2" max="0.95" step="0.05" value={quality} onChange={(e) => setQuality(parseFloat(e.target.value))} style={{ width: "100%" }} />
          </div>
          <div className="field">
            <label>Resolusi render: {scale}x</label>
            <input type="range" min="0.6" max="2" step="0.1" value={scale} onChange={(e) => setScale(parseFloat(e.target.value))} style={{ width: "100%" }} />
          </div>

          <button className="btn" disabled={busy} onClick={doCompress}>
            {busy ? "Memproses..." : "Kompres & Download"}
          </button>
        </>
      )}

      {status && <p className={`status ${status.startsWith("Gagal") ? "err" : status.startsWith("Selesai") ? "ok" : ""}`}>{status}</p>}
      {sizes && (
        <p className="status ok">
          Ukuran: {(sizes.before / 1024).toFixed(0)} KB → {(sizes.after / 1024).toFixed(0)} KB
          {" "}({(100 - (sizes.after / sizes.before) * 100).toFixed(0)}% lebih kecil)
        </p>
      )}
    </main>
  );
}
