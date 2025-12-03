import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

async function resetSheet() {
  console.log('🔄 Reset Google Sheets dengan format baru...');
  
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  
  try {
    // Clear all data except first row
    await sheets.spreadsheets.values.clear({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Pelanggan!A2:I1000',
    });
    
    console.log('✅ Sheet data cleared');
    
    // Set headers again
    const headers = ['No', 'Nama', 'NIK', 'Domisili', 'Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4', 'Minggu 5'];
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `Pelanggan!A1:I1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [headers],
      },
    });
    
    console.log('✅ Headers set:', headers.join(' | '));
    console.log('🎉 Google Sheets siap dengan format baru!');
    
  } catch (error) {
    console.error('❌ Reset failed:', error.message);
  }
}

resetSheet();
