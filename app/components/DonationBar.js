"use client";
import { useState, useRef, useEffect } from "react";

const AD_WATCH_SECONDS = 15;

export default function DonationBar() {
  const [step, setStep] = useState("closed"); // closed | menu | qris | ad | ad-done
  const [countdown, setCountdown] = useState(AD_WATCH_SECONDS);
  const timerRef = useRef(null);

  function openMenu() {
    setStep("menu");
  }

  function close() {
    setStep("closed");
    clearInterval(timerRef.current);
  }

  function startAd() {
    setStep("ad");
    setCountdown(AD_WATCH_SECONDS);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current);
          setStep("ad-done");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }

  useEffect(() => () => clearInterval(timerRef.current), []);

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
        <div className="sheet-backdrop" onClick={step === "ad" ? undefined : close}>
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
                <button className="sheet-option" onClick={startAd}>
                  <span className="sheet-option-icon">📺</span>
                  <div className="sheet-option-text">
                    <strong>Tonton Iklan</strong>
                    <span>Gratis, cukup tonton sampai selesai</span>
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

            {step === "ad" && (
              <>
                <h2 className="sheet-title">Memutar Iklan</h2>
                <div className="ad-slot">
                  <span style={{ fontSize: 40 }}>📺</span>
                  <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--ios-label-secondary)" }}>
                    Slot iklan — sisa {countdown} detik
                  </p>
                </div>
                <p className="sheet-sub" style={{ textAlign: "center" }}>Tunggu sampai selesai untuk menyelesaikan dukungan.</p>
              </>
            )}

            {step === "ad-done" && (
              <>
                <h2 className="sheet-title">Terima kasih! 🎉</h2>
                <p className="sheet-sub">Dukunganmu lewat iklan sudah tercatat. Sangat membantu developer.</p>
                <button className="btn" onClick={close}>Selesai</button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
