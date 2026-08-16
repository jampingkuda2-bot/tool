"use client";
import { useState, useRef, useEffect } from "react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { saveAs } from "file-saver";

export default function EditPage() {
  const [file, setFile] = useState(null);
  const [pdfjsDoc, setPdfjsDoc] = useState(null);
  const [pageIndex, setPageIndex] = useState(0); // 0-indexed
  const [numPages, setNumPages] = useState(0);
  const [viewport, setViewport] = useState(null);
  const [annotations, setAnnotations] = useState([]); // {page, x, y, text, size, color}
  const [draftText, setDraftText] = useState("Tulis teks di sini");
  const [fontSize, setFontSize] = useState(18);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);
  const canvasRef = useRef(null);
  const SCALE = 1.3;

  async function handleFile(f) {
    if (!f || f.type !== "application/pdf") return;
    setFile(f);
    setAnnotations([]);
    setPageIndex(0);
    setStatus("");

    const pdfjsLib = await import("pdfjs-dist/build/pdf");
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    const bytes = await f.arrayBuffer();
    const doc = await pdfjsLib.getDocument({ data: bytes }).promise;
    setPdfjsDoc(doc);
    setNumPages(doc.numPages);
  }

  useEffect(() => {
    if (!pdfjsDoc) return;
    renderPage(pageIndex);
    // eslint-disable-next-line
  }, [pdfjsDoc, pageIndex]);

  async function renderPage(idx) {
    const page = await pdfjsDoc.getPage(idx + 1);
    const vp = page.getViewport({ scale: SCALE });
    setViewport(vp);
    const canvas = canvasRef.current;
    canvas.width = vp.width;
    canvas.height = vp.height;
    const ctx = canvas.getContext("2d");
    await page.render({ canvasContext: ctx, viewport: vp }).promise;
    drawAnnotationsOnCanvas(idx, ctx);
  }

  function drawAnnotationsOnCanvas(idx, ctx) {
    const items = annotations.filter((a) => a.page === idx);
    ctx.fillStyle = "#e63946";
    items.forEach((a) => {
      ctx.font = `${a.size}px sans-serif`;
      ctx.fillText(a.text, a.x, a.y);
    });
  }

  function handleCanvasClick(e) {
    if (!viewport) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const newAnn = { page: pageIndex, x, y, text: draftText, size: fontSize };
    setAnnotations((prev) => {
      const next = [...prev, newAnn];
      return next;
    });
  }

  useEffect(() => {
    if (viewport && canvasRef.current) {
      // redraw base page then annotations whenever annotations change
      redrawCurrent();
    }
    // eslint-disable-next-line
  }, [annotations]);

  async function redrawCurrent() {
    if (!pdfjsDoc) return;
    const page = await pdfjsDoc.getPage(pageIndex + 1);
    const vp = page.getViewport({ scale: SCALE });
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    await page.render({ canvasContext: ctx, viewport: vp }).promise;
    drawAnnotationsOnCanvas(pageIndex, ctx);
  }

  function removeAnnotation(i) {
    setAnnotations((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function exportPdf() {
    if (!file) return;
    setBusy(true);
    setStatus("Membuat PDF hasil edit...");
    try {
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const pages = doc.getPages();

      for (const ann of annotations) {
        const page = pages[ann.page];
        const { height } = page.getSize();
        // canvas coords use SCALE and top-left origin; PDF uses bottom-left origin, unscaled
        const pdfX = ann.x / SCALE;
        const pdfY = height - ann.y / SCALE;
        page.drawText(ann.text, {
          x: pdfX,
          y: pdfY,
          size: ann.size / SCALE,
          font,
          color: rgb(0.9, 0.2, 0.25),
        });
      }

      const out = await doc.save();
      saveAs(new Blob([out], { type: "application/pdf" }), "edited.pdf");
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
        <h1>Edit / Tambah Teks</h1>
        <p>Ketik teks di kolom bawah, lalu ketuk posisi di halaman untuk menempelkannya. PDF tidak mendukung edit teks asli secara langsung — cara ini menempel teks baru di atas halaman.</p>
      </div>

      <div className="dropzone" onClick={() => inputRef.current.click()}>
        <p>{file ? file.name : "Ketuk untuk pilih file PDF"}</p>
        <input ref={inputRef} type="file" accept="application/pdf" onChange={(e) => handleFile(e.target.files[0])} />
      </div>

      {numPages > 0 && (
        <>
          <div className="field">
            <label>Teks yang akan ditempel</label>
            <input type="text" value={draftText} onChange={(e) => setDraftText(e.target.value)} />
          </div>
          <div className="field">
            <label>Ukuran font: {fontSize}px</label>
            <input type="range" min="10" max="48" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} style={{ width: "100%" }} />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
            <button className="btn secondary small" disabled={pageIndex === 0} onClick={() => setPageIndex((p) => p - 1)}>← Halaman sebelumnya</button>
            <span style={{ fontSize: 13, color: "var(--text-dim)" }}>{pageIndex + 1} / {numPages}</span>
            <button className="btn secondary small" disabled={pageIndex === numPages - 1} onClick={() => setPageIndex((p) => p + 1)}>Halaman berikutnya →</button>
          </div>

          <div style={{ marginTop: 14, overflow: "auto" }}>
            <canvas ref={canvasRef} onClick={handleCanvasClick} />
          </div>

          {annotations.filter((a) => a.page === pageIndex).length > 0 && (
            <div className="filelist">
              {annotations.map((a, i) =>
                a.page === pageIndex ? (
                  <div className="fileitem" key={i}>
                    <span className="name">"{a.text}"</span>
                    <button className="btn danger small" onClick={() => removeAnnotation(i)}>Hapus</button>
                  </div>
                ) : null
              )}
            </div>
          )}

          <button className="btn" disabled={busy || annotations.length === 0} onClick={exportPdf}>
            {busy ? "Memproses..." : "Simpan & Download PDF"}
          </button>
        </>
      )}

      {status && <p className={`status ${status.startsWith("Gagal") ? "err" : status.startsWith("Selesai") ? "ok" : ""}`}>{status}</p>}
    </main>
  );
}
