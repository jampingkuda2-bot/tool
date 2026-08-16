"use client";
import { useState } from "react";

export default function DonationBar() {
  const [step, setStep] = useState("closed"); // closed | menu | qris | ad-done

  function openMenu() {
    setStep("menu");
  }

  function close() {
    setStep("closed");
  }

  function watchAd() {
    // Iklan Onclick sudah aktif otomatis di seluruh halaman (termasuk klik ini).
    // Nggak perlu buka link manual lagi.
    setStep("ad-done");
  }

  return (
    <>
      <nav className="tabbar">
        <a href="/" className="tab-item">
          <span className="tab-icon">🏠</span>
          <span>Beranda</span>
        </a>

        <button className="tab-item tab-center" onClick={openMenu}>
          <span className="tab-center-circle">💛</span>
          <span>Donasi</span>
        </button>

        <a href="/convert" className="tab-item">
          <span className="tab-icon">🔄</span>
          <span>Convert</span>
        </a>
      </nav>

      {step !== "closed" && (
        <div className="sheet-backdrop" onClick={close}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />

            {step === "menu" && (
              <>
                <h2 className="sheet-title">Dukung Developer</h2>
                <p className="sheet-sub">Website ini gratis. Kalau membantu, kamu bisa dukung lewat salah satu cara di bawah.</p>
                <button className="sheet-option" onClick={() => setStep("qris")}>
                  <span className="sheet-option-icon">🇮🇩</span>
                  <div className="sheet-option-text">
                    <strong>Donasi via QRIS</strong>
                    <span>Scan dan kirim berapapun</span>
                  </div>
                  <span className="chev">›</span>
                </button>
                <button className="sheet-option" onClick={watchAd}>
                  <span className="sheet-option-icon">📺</span>
                  <div className="sheet-option-text">
                    <strong>Tonton Iklan</strong>
                    <span>Cukup klik, iklan otomatis terpicu</span>
                  </div>
                  <span className="chev">›</span>
                </button>
                <button className="btn secondary" onClick={close}>Tutup</button>
              </>
            )}

            {step === "qris" && (
              <>
                <h2 className="sheet-title">Scan QRIS</h2>
                <p className="sheet-sub">Buka aplikasi e-wallet atau m-banking, lalu scan kode di bawah ini.</p>
                <img src="/api/qris" alt="QRIS" style={{ width: "100%", maxWidth: 260, margin: "8px auto", display: "block" }} />
                <button className="btn secondary" onClick={() => setStep("menu")}>← Kembali</button>
              </>
            )}

            {step === "ad-done" && (
              <>
                <h2 className="sheet-title">Terima kasih! 🎉</h2>
                <p className="sheet-sub">
                  Klik kamu barusan ikut memicu tampilan iklan pendukung situs ini (kalau ada tab baru yang sempat kebuka, itu iklannya). Dukunganmu sangat membantu developer.
                </p>
                <button className="btn" onClick={close}>Selesai</button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
