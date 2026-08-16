"use client";
import { useState, useEffect, useRef } from "react";

export default function DonationBar({ directLink }) {
  const [step, setStep] = useState("closed"); // closed | menu | qris | ad | ad-done | ad-unavailable
  const waitingRef = useRef(false);
  const minWaitTimerRef = useRef(null);
  const minWaitDoneRef = useRef(false);

  function openMenu() {
    setStep("menu");
  }

  function close() {
    setStep("closed");
    waitingRef.current = false;
    clearTimeout(minWaitTimerRef.current);
  }

  function startAd() {
    if (!directLink) {
      setStep("ad-unavailable");
      return;
    }

    const opened = window.open(directLink, "_blank");
    if (!opened) {
      setStep("ad-unavailable");
      return;
    }

    setStep("ad");
    waitingRef.current = true;
    minWaitDoneRef.current = false;

    // minimal wait supaya nggak langsung "selesai" walau tab kebuka sekejap
    clearTimeout(minWaitTimerRef.current);
    minWaitTimerRef.current = setTimeout(() => {
      minWaitDoneRef.current = true;
    }, 4000);
  }

  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === "visible" && waitingRef.current && minWaitDoneRef.current) {
        waitingRef.current = false;
        setStep("ad-done");
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleVisibility);
      clearTimeout(minWaitTimerRef.current);
    };
  }, []);

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
                    <span>Gratis, buka iklan di tab baru</span>
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
                <h2 className="sheet-title">Iklan Terbuka di Tab Baru</h2>
                <div className="ad-slot">
                  <span style={{ fontSize: 40 }}>📺</span>
                  <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--ios-label-secondary)" }}>
                    Lihat sebentar, lalu balik lagi ke tab ini
                  </p>
                </div>
                <p className="sheet-sub" style={{ textAlign: "center" }}>Halaman ini otomatis lanjut begitu kamu kembali.</p>
              </>
            )}

            {step === "ad-done" && (
              <>
                <h2 className="sheet-title">Terima kasih! 🎉</h2>
                <p className="sheet-sub">Dukunganmu lewat iklan sudah tercatat. Sangat membantu developer.</p>
                <button className="btn" onClick={close}>Selesai</button>
              </>
            )}

            {step === "ad-unavailable" && (
              <>
                <h2 className="sheet-title">Iklan Belum Bisa Dibuka</h2>
                <p className="sheet-sub">
                  Kemungkinan pop-up diblokir browser, atau admin belum setting link iklan. Coba izinkan pop-up untuk situs ini, atau donasi lewat QRIS dulu.
                </p>
                <button className="btn" onClick={() => setStep("qris")}>Pakai QRIS</button>
                <button className="btn secondary" onClick={close}>Tutup</button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
