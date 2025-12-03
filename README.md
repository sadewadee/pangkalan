# 🏪 Sistem Pangkalan LPG 3kg

Sistem pencatatan data pelanggan dan transaksi mingguan untuk pangkalan gas LPG 3kg yang **super simple dan user-friendly untuk lansia**.

## ✨ Fitur Utama

✅ **Input NIK Pelanggan** - Form sederhana dengan validasi 16 digit  
✅ **Tracking Mingguan** - Toggle untuk menandai ambil gas setiap minggu  
✅ **Pencarian Cepat** - Cari pelanggan berdasarkan nama atau NIK  
✅ **Database Google Sheets** - Auto-sync tanpa perlu database rumit  
✅ **UI Super Besar** - Font besar, tombol besar, mudah untuk lansia  
✅ **Mobile Friendly** - Bisa dipakai di HP Android dengan mudah  
✅ **Basic Auth** - Keamanan sederhana dengan username/password  

## 🎯 Target User

Aplikasi ini dirancang khusus untuk:
- **Pemilik pangkalan gas LPG 3kg** yang butuh sistem pelaporan sederhana
- **Operators lansia** yang butuh interface yang mudah dan tidak membingungkan
- **Tidak teknikal** - Tidak perlu coding, ting klik dan pakai langsung

## 📱 Tangkapan Layar UI (Elderly-Friendly Design)

```
┌─────────────────────────────────┐
│ 🏪 PANGKALAN GAS  📋           │
│    Total: 25                    │
├─────────────────────────────────┤
│ 🔍 Cari nama atau NIK...        │
│                                 │
│ [+ TAMBAH PELANGGAN BARU]       │
├─────────────────────────────────┤
│ 1 👤 BAPAK NASUTION             │
│    🆔 1234567890123456          │
│    Minggu: ☑️ ☑️ ⬜ ☐ ⬜         │
│    [✏️] [🗑️]                   │
│                                 │
│ 2 👤 IBU ANISA                  │
│    🆔 9876543210987654          │
│    Minggu: ☑️ ⬜ ☑️ ☐ ⬜         │
│    [✏️] [🗑️]                   │
└─────────────────────────────────┘
```

## 🛠️ Tech Stack

- **Backend**: Bun.js + Express.js
- **Database**: Google Sheets API (No database setup needed!)
- **Frontend**: Pure HTML/CSS/JavaScript (super lightweight)
- **Authentication**: Basic Auth (simple untuk lansia)
- **UI Design**: Elderly-friendly dengan font besar dan touch targets

## 📋 Persyaratan Sistem

- **Node.js 16+** atau **Bun.js**
- Akses internet untuk Google Sheets sync
- HP Android atau tablet (optional)
- Google Account untuk setup Sheets

## 🚀 Panduan Instalasi Lengkap

### Step 1: Install Bun.js (Super Cepat)

```bash
# Install Bun dalam 1 command
curl -fsSL https://bun.sh/install | bash

# Restart terminal kemudian verifikasi
bun --version
```

### Step 2: Download/Setup Project

```bash
# Masuk ke folder project
cd "/Users/sadewadee/Downloads/Plugin Pro/pangkalan"

# Install semua dependencies
bun install
```

### Step 3: Setup Google Sheets Database

#### 3.1 Buat Google Sheet Baru
1. Buka [Google Sheets](https://sheets.google.com)
2. Create new spreadsheet → beri nama "Pangkalan LPG Data"
3. Rename sheet pertama menjadi **"Pelanggan"**
4. Isi header di baris 1:
   ```
   A1: ID
   B1: Nama  
   C1: NIK
   D1: Minggu1
   E1: Minggu2  
   F1: Minggu3
   G1: Minggu4
   H1: Minggu5
   ```

#### 3.2 Buat Service Account
1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru (contoh: "pangkalan-lpg")
3. Enable **Google Sheets API**
4. Buat Service Account:
   - IAM & Admin → Service Accounts → Create Service Account
   - Name: `pangkalan-lpg`
   - Role: **Editor**
   - Continue → Done
5. Klik service account yang baru dibuat → Keys → Add Key → Create new key
   - Pilih **JSON**
   - Download dan simpan file JSONnya

#### 3.3 Share Google Sheet
1. Buka kembali Google Sheet "Pangkalan LPG Data"
2. Klik **Share** (pojok kanan atas)
3. Paste email dari service account (format: `xxx@xxx.iam.gserviceaccount.com`)
4. Beri akses **Editor**

#### 3.4 Setup Environment Variables
Copy file `.env` dan isi dengan data Anda:

```bash
# Copy file env template
cp .env .env.local

# Edit dengan text editor
nano .env.local
```

Isi dengan data Anda:
```env
# Ambil dari Google Sheet URL:
# https://docs.google.com/spreadsheets/d/Sheet_ID_Here/edit
GOOGLE_SHEET_ID=1abc123def456ghi789jkl012mno345pq

# Ambil dari file JSON yang di-download:
GOOGLE_SERVICE_ACCOUNT_EMAIL=pangkalan-lpg@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
INI_ADAH_PRIVATE_KEY_ANDA_YANG_PANJANG_SEKALI
-----END PRIVATE KEY-----"

# Login credentials (simple untuk lansia)
AUTH_USERNAME=admin
AUTH_PASSWORD=pangkalan123

# Server port
PORT=3000
```

### Step 4: Jalankan Aplikasi

```bash
# Mode development (auto-restart)
bun run dev

# Atau mode production
bun start
```

Aplikasi akan running di: `http://localhost:3000`

Login dengan:
- **Username**: `admin`
- **Password**: `pangkalan123`

## 📖 Cara Pakai (Tutorial Step-by-Step)

### Menambah Pelanggan Baru
1. Klik tombol biru **"+ TAMBAH PELANGGAN BARU"**
2. Isi **Nama Lengkap** (contoh: "Bapak Ahmad")
3. Isi **NIK** (16 digit angka, contoh: "1234567890123456")
4. Klik **"✅ SIMPAN"**
5. Data otomatis tersimpan ke Google Sheets ✨

### Menandai Mingguan Ambil Gas
1. Cari nama pelanggan di daftar
2. Klik toggle **☐** atau **☑️** di kolom minggu
3. Data otomatis update ke Google Sheets

### Mencari Pelanggan
1. Ketik nama atau NIK di kotak pencarian
2. Hasil muncul langsung (real-time)
3. Kosongkan kotak untuk lihat semua pelanggan

### Edit/Delete Pelanggan
- **Edit**: Klik icon ✏️ (pensil) di card pelanggan
- **Hapus**: Klik icon 🗑️ (sampah) → konfirmasi dua kali untuk safety

## 🔧 Troubleshooting Common Issues

### Error: "Cannot read property 'sheetId' of undefined"
**Fix**: Pastikan Google Sheet sharing ke service account sudah **Editor**

### Error: "Invalid credentials"
**Fix**: 
1. Copy-paste private key dengan benar (jangan ada spasi ekstra)
2. Pastikan `\n` di dalam private key tidak hilang

### Error: "Unable to parse range"
**Fix**: 
1. Check nama sheet harus **"Pelanggan"**
2. Header harus tepat: `ID | Nama | NIK | Minggu1 | Minggu2 | Minggu3 | Minggu4 | Minggu5`

### Loading lama/tidak responsif
**Fix**: Periksa koneksi internet dan coba refresh halaman

## 🌐 Deploy ke Production (Optional)

### Deploy ke VPS (DigitalOcean/Vultr)

```bash
# 1. Install Bun di VPS
curl -fsSL https://bun.sh/install | bash

# 2. Upload project via git/manual
# 3. Install dependencies
cd /var/www/pangkalan-lpg
bun install

# 4. Setup .env production
nano .env

# 5. Install PM2 untuk auto-restart
npm install -g pm2

# 6. Start dengan PM2
pm2 start server.js --name pangkalan-lpg --interpreter bun
pm2 save
pm2 startup

# 7. Setup Nginx reverse proxy (optional)
sudo apt install nginx
sudo nano /etc/nginx/sites-available/pangkalan-lpg
```

Contoh Nginx config:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📱 Tips untuk Pengguna Lansia

1. **Font Super Besar**: Semua teks minimum 18px untuk mudah dibaca
2. **Tombol Gede**: Minimum 44x44px untuk mudah diklik
3. **Warna Kontras**: Biru/hijau untuk aksi penting, merah untuk bahaya
4. **One-Action-Per-Screen**: Tidak ada opsi yang membingungkan
5. **Auto-Focus**: Cursor otomatis di input field
6. **Clear Feedback**: Pesan sukses/error yang jelas

## 🔄 Backup & Data Management

- **Auto-sync**: Semua data auto-sync ke Google Sheets
- **Backup**: Google Sheets otomatis backup oleh Google
- **Export**: Buka Google Sheets → File → Download sebagai Excel/PDF
- **Histori**: Semua perubahan tersimpan di Google Sheets revision history

## 🎯 Features Summary Checklist

- [x] NIK validation (16 digit)
- [x] Weekly tracking (Minggu 1-5)
- [x] Real-time search
- [x] Mobile responsive design
- [x] Large touch targets (44px+)
- [x] Elderly-friendly color scheme
- [x] Simple authentication
- [x] Google Sheets integration
- [x] Auto-save functionality
- [x] Error handling
- [x] Loading states
- [x] Success/error messages

## 🛠️ Development Commands

```bash
# Install dependencies
bun install

# Start development server (auto-reload)
bun run dev

# Start production server
bun start

# Check for syntax errors
bun run server.js --check
```

## 🤝 Support & Kontribusi

Jika ada masalah atau pertanyaan:
1. Periksa section **Troubleshooting** di atas
2. Cek console browser untuk error details  
3. Pastikan Google Sheets setup sudah benar

## 📄 License

MIT License - Bisa digunakan untuk keperluan komersial atau non-komersial

---

## 🎉 Selesai!

Sistem Pangkalan LPG Anda sudah siap digunakan! 

**Quick Start Checklist:**
- [x] Install Bun.js
- [x] Setup Google Sheets 
- [x] Configure .env
- [x] Run `bun start`
- [x] Buka http://localhost:3000
- [x] Login dengan admin/pangkalan123

**Happy Coding! 🎯**

*Dibuat dengan ❤️ untuk mempermudah operasional pangkalan gas Indonesia*
