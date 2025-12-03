import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

async function convertSheetToCheckboxes() {
  console.log('🔄 Converting Google Sheets to proper checkboxes...');
  
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  
  try {
    const currentSheetName = 'Pelanggan Desember 2025'; // Current month sheet
    
    // First, let's clear existing data and set up checkboxes
    // Step 1: Clear existing data
    await sheets.spreadsheets.values.clear({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `${currentSheetName}!A2:Z1000`,
    });
    
    console.log('✅ Sheet cleared');
    
    // Step 2: Set headers
    const headers = ['No', 'Nama', 'NIK', 'Domisili', 'Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4', 'Minggu 5'];
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `${currentSheetName}!A1:I1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [headers],
      },
    });
    
    console.log('✅ Headers set');
    
    // Step 3: Apply checkbox data validation to minggu columns
    const mingguColumns = ['E', 'F', 'G', 'H', 'I'];
    const requests = [];
    
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
            },
            userEnteredFormat: {
              backgroundColor: {
                red: 0.95,
                green: 0.95,
                blue: 0.95
              },
              textFormat: {
                bold: false
              }
            }
          }
        }
      });
    }
    
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      requestBody: {
        requests: requests
      }
    });
    
    console.log('✅ Checkbox validation applied to columns E-I');
    
    // Step 4: Freeze header row for mobile use
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      requestBody: {
        requests: [{
          updateSheetProperties: {
            properties: {
              sheetId: 0,
              gridProperties: {
                frozenRowCount: 1
              }
            },
            fields: 'gridProperties.frozenRowCount'
          }
        }]
      }
    });
    
    console.log('✅ Header row frozen');
    console.log('🎉 Google Sheets converted to proper checkboxes!');
    console.log('📱 You can now click the cells in columns E-I to check/uncheck');
    
  } catch (error) {
    console.error('❌ Conversion failed:', error.message);
    console.log('💡 Make sure the sheet exists and service account has Editor access');
  }
}

convertSheetToCheckboxes();
