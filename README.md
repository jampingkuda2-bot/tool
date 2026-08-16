# PDF Tools Web

Website tools PDF (gabung, split, kompres, tambah teks) yang jalan 100% di browser (client-side) — cocok untuk hosting gratis di Vercel karena tidak butuh server processing.

## Cara deploy ke Vercel (dari HP, tanpa PC)

1. **Upload project ke GitHub**
   - Buka github.com lewat browser HP (atau install app GitHub).
   - Buat repo baru, misalnya `pdf-tools-web`.
   - Upload semua file & folder di project ini ke repo tersebut (drag & drop file lewat web GitHub bisa, atau gunakan fitur "Add file → Upload files").

2. **Import ke Vercel**
   - Buka vercel.com, login pakai akun GitHub.
   - Klik "Add New → Project".
   - Pilih repo `pdf-tools-web` yang tadi dibuat.
   - Framework Preset otomatis kedeteksi "Next.js" — biarkan default.
   - Klik "Deploy".

3. Tunggu proses build selesai (1-2 menit), lalu website sudah live di `namaproject.vercel.app`.

## Setup panel admin (`/admin`) — WAJIB dilakukan

Panel admin dipakai untuk upload QRIS asli tanpa perlu edit kode. Ini butuh 2 hal di dashboard Vercel:

1. **Aktifkan Vercel Blob storage** (tempat nyimpen gambar QRIS):
   - Buka project kamu di dashboard Vercel → tab **Storage** → **Create Database** → pilih **Blob**.
   - Setelah dibuat dan di-connect ke project, Vercel otomatis nambahin environment variable `BLOB_READ_WRITE_TOKEN` — nggak perlu diisi manual.

2. **Set password admin**:
   - Di dashboard Vercel → tab **Settings → Environment Variables**.
   - Tambah variable baru: Name = `ADMIN_PASSWORD`, Value = password pilihan kamu (buat yang kuat, jangan gampang ditebak).
   - Simpan, lalu **redeploy** project (Settings → Deployments → titik tiga di deployment terakhir → Redeploy) supaya variable-nya kepakai.

3. Buka `namaproject.vercel.app/admin`, login pakai password tadi, lalu upload gambar QRIS asli kamu. Otomatis langsung dipakai di tombol donasi tanpa perlu deploy ulang.

⚠️ Kalau `ADMIN_PASSWORD` belum di-set, password default-nya adalah `ganti-password-ini` — **wajib diganti** sebelum website dipakai publik.

## Fitur

- **Gabung PDF** — satukan beberapa PDF, urutan bisa diatur.
- **Split PDF** — pecah per halaman atau berdasarkan range custom, hasil dalam ZIP.
- **Kompres PDF** — render ulang halaman jadi gambar kualitas lebih rendah untuk memperkecil ukuran file (cocok untuk PDF hasil scan).
- **Edit / Tambah Teks** — tempel teks baru di atas halaman PDF (bukan edit teks asli, karena format PDF tidak menyimpan teks sebagai "editable" seperti Word).
- **Download TikTok** — tempel link video, dapat versi HD tanpa watermark (MP4) dan audio-nya (MP3). Prosesnya lewat API route di server (`/api/tiktok` dan `/api/download`) karena butuh akses ke TikTok yang tidak bisa dilakukan langsung dari browser (CORS).
- **Konverter File** — convert video/audio (misal MP4 → MP3) langsung di browser pakai ffmpeg.wasm. File pertama kali agak lama karena harus download engine converter (~20-30MB), setelah itu prosesnya lokal di HP/laptop pengguna.
- **Tombol Donasi** — ada di tab bar bawah (tombol biru di tengah). Klik akan membuka pilihan: donasi via QRIS, atau nonton iklan.
- **Panel Admin (`/admin`)** — halaman tersembunyi (tidak ada link-nya di menu) buat login pakai password dan upload gambar QRIS asli, tanpa perlu edit kode atau redeploy. Gambar disimpan di Vercel Blob storage jadi tetap ada meskipun website di-redeploy.

## ⚠️ Yang WAJIB diganti sebelum dipakai serius

1. **Password admin** — lihat bagian "Setup panel admin" di atas. Jangan biarkan default.
2. **Iklan masih simulasi/placeholder** — tombol "Tonton Iklan" saat ini cuma menampilkan hitung mundur 15 detik dummy, **belum terhubung ke jaringan iklan sungguhan** dan belum menghasilkan pendapatan apapun. Supaya beneran dapat penghasilan dari iklan, kamu perlu:
   - Daftar ke jaringan iklan yang mendukung rewarded ads untuk web, misalnya **Google AdSense** (H5 rewarded ads) atau jaringan pihak ketiga seperti **Adsterra** / **PropellerAds** yang punya format rewarded ad untuk situs.
   - Setelah akun disetujui, kamu akan dapat kode/script iklan dari mereka.
   - Kode itu ditempel menggantikan div `.ad-slot` di `app/components/DonationBar.js` (bagian `step === "ad"`), mengikuti dokumentasi integrasi dari jaringan iklan yang dipilih.
   - Saya tidak bisa membuatkan akun atau kode iklan asli karena itu perlu didaftarkan atas nama kamu sendiri.

## Catatan penting

- Fitur PDF (Gabung, Split, Kompres, Edit) 100% proses di browser — tidak ada upload ke server.
- Fitur **Download TikTok** butuh koneksi server (API route Vercel) karena mengambil data dari pihak ketiga (tikwm.com, layanan publik yang sering dipakai untuk keperluan ini). Kalau API tersebut berubah struktur atau down, fitur ini bisa berhenti berfungsi dan endpoint di `app/api/tiktok/route.js` perlu disesuaikan.
- Fitur Konverter butuh device yang cukup kuat untuk file besar/video panjang karena semua proses encoding terjadi di HP/laptop pengguna sendiri (bukan di server).
- Gunakan fitur download TikTok secukupnya untuk video publik dan hormati hak cipta pembuat konten — jangan dipakai untuk redistribusi komersial konten orang lain.

## Pengembangan lanjutan (ide fitur berikutnya)

- Convert PDF ↔ Word / gambar
- Rotate & reorder halaman PDF
- Tanda tangan digital (gambar tanda tangan ditempel ke PDF)
- Password protect / unlock PDF
- Download dari platform lain (Instagram, YouTube)
