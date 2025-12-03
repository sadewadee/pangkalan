import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

async function setupManualCheckbox() {
  console.log('🔧 Setting up manual checkbox format...');
  
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  
  try {
    // Update headers
    const headers = ['No', 'Nama', 'NIK', 'Domisili', 'Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4', 'Minggu 5'];
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `Pelanggan!A1:I1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [headers],
      },
    });
    
    console.log('✅ Headers updated:', headers.join(' | '));
    
    // Format columns for checkboxes (conditional formatting)
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      requestBody: {
        requests: [{
          repeatCell: {
            range: {
              sheetId: 0,
              startRowIndex: 1,
              endRowIndex: 1000,
              startColumnIndex: 4, // Column E
              endColumnIndex: 9,   // Column I
            },
            cell: {
              userEnteredFormat: {
                textFormat: {
                  fontSize: 14,
                  bold: true,
                },
                backgroundColor: {
                  red: 0.9,
                  green: 0.9,
                  blue: 0.9
                },
                borders: {
                  top: { style: 'SOLID', color: { red: 0.8, green: 0.8, blue: 0.8 } },
                  bottom: { style: 'SOLID', color: { red: 0.8, green: 0.8, blue: 0.8 } },
                  left: { style: 'SOLID', color: { red: 0.8, green: 0.8, blue: 0.8 } },
                  right: { style: 'SOLID', color: { red: 0.8, green: 0.8, blue: 0.8 } }
                }
              }
            },
            fields: 'userEnteredFormat'
          }
        }]
      }
    });
    
    console.log('✅ Checkbox style formatting applied');
    console.log('📝 NOTE: Anda perlu manually select columns E-I dan buat Data Validation:');
    console.log('   1. Select column E through I');
    console.log('   2. Go to Data > Data validation');
    console.log('   3. Criteria: Checkbox');
    console.log('   4. Save');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

setupManualCheckbox();
