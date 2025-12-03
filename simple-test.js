import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

console.log('📱 Testing current data in Google Sheets...');

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

async function checkData() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Pelanggan Desember 2025'
    });
    
    console.log('📊 Google Sheets Data:');
    if (response.data.values && response.data.values.length > 0) {
      console.log('Headers:', response.data.values[0]);
      
      response.data.values.slice(1).slice(0, 3).forEach((row, index) => {
        console.log(`  Row ${index + 1}:`);
        console.log(`    No: ${row[0] || 'N/A'}`);
        console.log(`    Nama: ${row[1] || 'N/A'}`);
        console.log(`    NIK: ${row[2] || 'N/A'}`);
        if (row[4] !== undefined) {
          console.log(`    Minggu 1: ${row[4]} (${typeof row[4]})`);
        }
        console.log('');
      });
      console.log(`Total rows: ${response.data.values.length - 1}`);
      
      console.log('✅ Data syncing working! 📊');
      console.log('💡 For checkbox setup, manual Google Sheets setup required');
      console.log('📋 Check setup-manual-checkbox.md for instructions');
    } else {
      console.log('❌ No data found in sheet');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkData();
