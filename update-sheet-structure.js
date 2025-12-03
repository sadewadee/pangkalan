import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

async function updateSheetStructure() {
  console.log('🔧 Updating Google Sheets structure...');
  
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  
  try {
    // Clear existing headers and set new structure
    const newHeaders = ['No', 'Nama', 'NIK', 'Domisili', 'Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'];
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `Pelanggan!A1:H1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [newHeaders],
      },
    });
    
    console.log('✅ Sheet structure updated!');
    console.log('📄 New Headers:', newHeaders.join(' | '));
    console.log('🎉 Google Sheets now has the correct structure!');
    
  } catch (error) {
    console.error('❌ Update failed:', error.message);
  }
}

updateSheetStructure();
