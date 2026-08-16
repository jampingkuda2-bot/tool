"use client";
import { useState, useEffect, useRef } from "react";

export default function AdminPage() {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [preview, setPreview] = useState(null);
  const [qrisVersion, setQrisVersion] = useState(0);
  const fileRef = useRef(null);

  useEffect(() => {
    fetch("/api/admin/check")
      .then((r) => r.json())
      .then((d) => setAuthed(!!d.authed))
      .finally(() => setChecking(false));
  }, []);

  async function login() {
    setLoginError("");
    setBusy(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = await res.json();
      if (json.error) {
        setLoginError(json.error);
      } else {
        setAuthed(true);
      }
    } catch (e) {
      setLoginError("Gagal login: " + e.message);
    }
    setBusy(false);
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
    setPassword("");
  }

  function handleFile(f) {
    if (!f) return;
    setPreview(URL.createObjectURL(f));
  }

  async function uploadQris() {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setUploadStatus("Pilih gambar QRIS dulu.");
      return;
    }
    setBusy(true);
    setUploadStatus("Mengupload...");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload-qris", { method: "POST", body: formData });
      const json = await res.json();
      if (json.error) {
        setUploadStatus("Gagal: " + json.error);
      } else {
        setUploadStatus("Selesai! QRIS aktif sudah diperbarui.");
        setQrisVersion((v) => v + 1);
      }
    } catch (e) {
      setUploadStatus("Gagal: " + e.message);
    }
    setBusy(false);
  }

  if (checking) {
    return (
      <main className="container">
        <p className="status">Memuat...</p>
      </main>
    );
  }

  if (!authed) {
    return (
      <main className="container">
        <div className="page-header">
          <h1>Admin</h1>
          <p>Masukkan password untuk mengakses panel.</p>
        </div>
        <div className="field">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            placeholder="••••••••"
          />
        </div>
        <button className="btn" disabled={busy || !password} onClick={login}>
          {busy ? "Memproses..." : "Login"}
        </button>
        {loginError && <p className="status err">{loginError}</p>}
      </main>
    );
  }

  return (
    <main className="container">
      <div className="page-header">
        <h1>Admin Panel</h1>
        <p>Kelola QRIS donasi yang ditampilkan di website.</p>
      </div>

      <div className="ios-group-title">QRIS Saat Ini</div>
      <div className="ios-group" style={{ padding: 16 }}>
        <img
          key={qrisVersion}
          src={`/api/qris?v=${qrisVersion}`}
          alt="QRIS aktif"
          style={{ width: "100%", maxWidth: 240, display: "block", margin: "0 auto" }}
        />
      </div>

      <div className="field">
        <label>Upload QRIS baru</label>
      </div>
      <div className="dropzone" onClick={() => fileRef.current.click()}>
        <p>Ketuk untuk pilih gambar QRIS (PNG/JPG)</p>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => handleFile(e.target.files[0])}
        />
      </div>

      {preview && (
        <div className="ios-group" style={{ marginTop: 14, padding: 16 }}>
          <p className="status" style={{ marginTop: 0 }}>Preview:</p>
          <img src={preview} alt="preview" style={{ width: "100%", maxWidth: 240, display: "block", margin: "0 auto" }} />
        </div>
      )}

      <button className="btn" disabled={busy} onClick={uploadQris}>
        {busy ? "Memproses..." : "Simpan QRIS Ini"}
      </button>

      {uploadStatus && (
        <p className={`status ${uploadStatus.startsWith("Gagal") ? "err" : uploadStatus.startsWith("Selesai") ? "ok" : ""}`}>
          {uploadStatus}
        </p>
      )}

      <button className="btn secondary" onClick={logout} style={{ marginTop: 28 }}>
        Logout
      </button>
    </main>
  );
}
