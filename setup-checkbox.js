import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

async function setupCheckboxSheets() {
  console.log('🔧 Setting up Google Sheets with Checkboxes...');
  
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
    
    console.log('✅ Headers updated for checkboxes (5 minggu + domisili)');
    
    // Add data validation for checkboxes (column E-I)
    for (let col = 5; col <= 9; col++) {
      const colLetter = String.fromCharCode(64 + col); // E, F, G, H, I
      
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        requestBody: {
          requests: [{
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: 1,
                endRowIndex: 1000,
                startColumnIndex: col - 1,
                endColumnIndex: col,
              },
              cell: {
                dataValidation: {
                  condition: {
                    type: 'CHECKBOX',
                  },
                },
              },
              fields: 'dataValidation',
            }
          }]
        }
      });
    }
    
    console.log('✅ Checkboxes setup completed for columns E-I (Minggu 1-5)');
    console.log('🎉 Google Sheets sekarang siap dengan checkbox!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

setupCheckboxSheets();
