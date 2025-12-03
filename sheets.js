import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const DEFAULT_SHEET_NAME = 'Pelanggan';

// Setup Google Sheets API with error handling
let sheets = null;
let isInitialized = false;

export async function initializeGoogleSheets() {
  if (isInitialized && sheets) return true;
  
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    sheets = google.sheets({ version: 'v4', auth });
    isInitialized = true;
    return true;
  } catch (error) {
    console.error('Google Sheets initialization failed:', error.message);
    return false;
  }
}

// Helper functions
function getDefaultSheetName() {
  const now = new Date();
  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  return `Pelanggan ${monthNames[now.getMonth()]} ${now.getFullYear()}`;
}

async function ensureSheetExists(sheetName) {
  try {
    // Get existing sheets
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SHEET_ID,
    });
    
    const existingSheets = spreadsheet.data.sheets;
    const sheetExists = existingSheets.some(sheet => sheet.properties.title === sheetName);
    
    if (!sheetExists) {
      // Create new sheet
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title: sheetName,
                gridProperties: {
                  rowCount: 1000,
                  columnCount: 9
                }
              }
            }
          }]
        }
      });
      
      // Set headers for new sheet
      const headers = ['No', 'Nama', 'NIK', 'Domisili', 'Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4', 'Minggu 5'];
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${sheetName}!A1:I1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [headers],
        },
      });
      
      // Apply checkbox data validation to minggu columns
      const requests = [];
      const mingguColumns = ['E', 'F', 'G', 'H', 'I'];
      
      for (const column of mingguColumns) {
        requests.push({
          repeatCell: {
            range: {
              sheetId: 0,
              startRowIndex: 1, // Row 2 onwards
              endRowIndex: 999,
              startColumnIndex: column.charCodeAt(0) - 65, // A=0, B=1, C=2, D=3, E=4, etc.
              endColumnIndex: column.charCodeAt(0) - 65 + 1,
            },
            cell: {
              dataValidation: {
                condition: {
                  type: 'BOOLEAN',
                  values: 'TRUE,FALSE'
                }
              }
            }
          }
        });
      }
      
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: {
          requests: requests
        }
      });
      
      console.log(`✅ Sheet "${sheetName}" created with checkbox validation`);
    }
  } catch (error) {
    console.error('Error ensuring sheet exists:', error.message);
    throw error;
  }
}

// Get all available sheets
export async function getAllSheets() {
  if (!await initializeGoogleSheets()) {
    throw new Error('Google Sheets tidak dapat diinisialisasi');
  }
  
  try {
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SHEET_ID,
    });
    
    return spreadsheet.data.sheets
      .filter(sheet => sheet.properties.title.includes('Pelanggan'))
      .map(sheet => ({
        title: sheet.properties.title,
        sheetId: sheet.properties.sheetId
      }));
  } catch (error) {
    console.error('Error getting sheets:', error.message);
    throw error;
  }
}

// Get all pelanggan
export async function getAllPelanggan(sheetName = null) {
  if (!await initializeGoogleSheets()) {
    throw new Error('Google Sheets tidak dapat diinisialisasi. Periksa konfigurasi .env Anda.');
  }
  
  const currentSheetName = sheetName || getDefaultSheetName();
  
  try {
    // Check if sheet exists, if not create it
    await ensureSheetExists(currentSheetName);
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${currentSheetName}!A2:I`, // A=No, B=Nama, C=NIK, D=Domisili, E-I=Minggu1-5
    });
    
    const rows = response.data.values || [];
    
    return rows.map((row, index) => ({
      id: row[0] || (index + 1).toString(),
      nama: row[1] || '',
      nik: row[2] || '',
      domisili: row[3] || '',
      minggu1: row[4] === 'TRUE',
      minggu2: row[5] === 'TRUE',
      minggu3: row[6] === 'TRUE',
      minggu4: row[7] === 'TRUE',
      minggu5: row[8] === 'TRUE',
    }));
  } catch (error) {
    console.error('Error getting sheet data:', error.message);
    throw new Error('Tidak dapat mengakses Google Sheets. Periksa Sheet ID dan permissions.');
  }
}

// Add new pelanggan
export async function addPelanggan(nama, nik, domisili) {
  if (!await initializeGoogleSheets()) {
    throw new Error('Google Sheets tidak dapat diinisialisasi. Periksa konfigurasi .env Anda.');
  }
  
  try {
    const currentSheetName = getDefaultSheetName();
    
    // Check if sheet exists, if not create it
    await ensureSheetExists(currentSheetName);
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${currentSheetName}!A2:A`, // Get IDs to determine next ID
    });
    
    const rows = response.data.values || [];
    const newId = (rows.length + 1).toString();
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${currentSheetName}!A:I`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[newId, nama, nik, domisili, 'FALSE', 'FALSE', 'FALSE', 'FALSE', 'FALSE']],
      },
    });
    
    return {
      id: newId,
      nama,
      nik,
      domisili,
      minggu1: false,
      minggu2: false,
      minggu3: false,
      minggu4: false,
      minggu5: false,
    };
  } catch (error) {
    console.error('Error adding pelanggan:', error.message);
    throw new Error('Gagal menambah pelanggan. Periksa koneksi dan permissions.');
  }
}

// Update pelanggan data
export async function updatePelanggan(id, nama, nik, domisili) {
  if (!await initializeGoogleSheets()) {
    throw new Error('Google Sheets tidak dapat diinisialisasi. Periksa konfigurasi .env Anda.');
  }
  
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A2:I`, // A=No, B=Nama, C=NIK, D=Domisili, E-I=Minggu1-5
    });
    
    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(row => row[0] === id);
    
    if (rowIndex === -1) {
      throw new Error('Pelanggan tidak ditemukan');
    }
    
    const rowNumber = rowIndex + 2; // +2 karena header di row 1 dan array index 0
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!B${rowNumber}:D${rowNumber}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[nama, nik, domisili]],
      },
    });
    
    return { id, nama, nik, domisili };
  } catch (error) {
    console.error('Error updating pelanggan:', error.message);
    throw new Error('Gagal update pelanggan. Periksa koneksi dan permissions.');
  }
}

// Update mingguan checkbox
export async function updateMingguan(id, minggu, checked) {
  if (!await initializeGoogleSheets()) {
    throw new Error('Google Sheets tidak dapat diinisialisasi. Periksa konfigurasi .env Anda.');
  }
  
  try {
    const currentSheetName = getDefaultSheetName();
    
    // Check if sheet exists, if not create it
    await ensureSheetExists(currentSheetName);
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${currentSheetName}!A2:I`, // A=No, B=Nama, C=NIK, D=Domisili, E-I=Minggu1-5
    });
    
    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(row => row[0] === id);
    
    if (rowIndex === -1) {
      throw new Error('Pelanggan tidak ditemukan');
    }
    
    const rowNumber = rowIndex + 2;
    const columnMap = {
      '1': 'E', // Kolom E untuk Minggu 1
      '2': 'F', // Kolom F untuk Minggu 2
      '3': 'G', // Kolom G untuk Minggu 3
      '4': 'H', // Kolom H untuk Minggu 4
      '5': 'I', // Kolom I untuk Minggu 5
    };
    
    const column = columnMap[minggu];
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${currentSheetName}!${column}${rowNumber}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[checked ? 'TRUE' : 'FALSE']],
      },
    });
    
    return { id, minggu, checked };
  } catch (error) {
    console.error('Error updating mingguan:', error.message);
    throw new Error('Gagal update data mingguan. Periksa koneksi dan permissions.');
  }
}

// Delete pelanggan
export async function deletePelanggan(id) {
  if (!await initializeGoogleSheets()) {
    throw new Error('Google Sheets tidak dapat diinisialisasi. Periksa konfigurasi .env Anda.');
  }
  
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A2:A`, // Get IDs only
    });
    
    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(row => row[0] === id);
    
    if (rowIndex === -1) {
      throw new Error('Pelanggan tidak ditemukan');
    }
    
    const rowNumber = rowIndex + 2;
    
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: 0, // First sheet
              dimension: 'ROWS',
              startIndex: rowNumber - 1,
              endIndex: rowNumber,
            },
          },
        }],
      },
    });
  } catch (error) {
    console.error('Error deleting pelanggan:', error.message);
    throw new Error('Gagal menghapus pelanggan. Periksa koneksi dan permissions.');
  }
}
