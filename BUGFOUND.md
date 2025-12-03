#### Bug #1 - 2025-12-03

    - Issue: Panggilan ke `/api/*` direwrite ke `index.html` sehingga frontend menerima HTML dan gagal parse JSON
    - Steps to Reproduce: Buka halaman lalu aplikasi memanggil `/api/pelanggan`, respons berupa HTML (DOCTYPE) bukan JSON
    - Expected: Respons JSON dengan `{ success, data }` dari endpoint API
    - Actual: Error `Unexpected token '<'` dan `Unexpected end of JSON input` di `public/app.js:130` dan `public/app.js:331`
    - File: vercel.json:1, public/app.js:108, public/app.js:321
    - Environment: Vercel static hosting SPA tanpa konfigurasi rute API
    - Status: Fixed
    - Recommendation: Pastikan rute `/api/**` tidak diubah oleh rewrite SPA; gunakan builder `@vercel/node` untuk `server.js`
    - Severity: High

