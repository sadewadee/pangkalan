# 📱 GOOGLE SHEETS CHECKBOX SETUP

## Panduan Manual Setup Checkbox di Google Sheets

Google Sheets API tidak langsung membuat checkbox nyata, tapi kita bisa setup manual:

### 📋 Step 1: Buka Google Sheet
1. Buka spreadsheet: https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit
2. Pilih sheet bulan ini (misalnya "Pelanggan Desember 2025")

### 🔧 Step 2: Setup Manual Checkbox
1. **Select minggu columns**: Click header "E", tahan Shift klik header "I"
2. **Go to menu**: Data → Data validation
3. **Setup validation**:
   - Criteria: **Checkbox**
   - Check: "Show dropdown list in cell"
   - On invalid data: "Show warning"
4. **Save**

### ✅ Step 3: Testing
Sekarang Anda bisa:
- Klik sel di kolom E-I untuk toggle checkbox ✓
- Data akan muncul sebagai checkbox ✓
- UI aplikasi tetap sync dengan benar ✓

### 🎯 Hasil Akhir
Kolom E-I (Minggu 1-5) akan menjadi:
- ✅ **Checkbox nyata** (bukan text TRUE/FALSE)
- ✅ **Bisa diklik langsung** di Google Sheets
- ✅ **Auto-sync dengan aplikasi web**
- ✅ **User-friendly untuk lansia**

### 💡 Tips Tambahan
- Frozen header row: Baris 1 dikunci untuk mobile view
- Large tap targets: Checkbox mudah diklik di HP
- Color coding: Memberikan visual feedback
- Background colors: Bedakan warna untuk mobile

Selesai! 🎉
