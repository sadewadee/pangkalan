import express from 'express';
import dotenv from 'dotenv';
import basicAuth from 'express-basic-auth';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  getAllPelanggan, 
  getAllSheets,
  addPelanggan, 
  updatePelanggan, 
  deletePelanggan,
  updateMingguan 
} from './sheets.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

// Authentication middleware with cookie support
const authMiddleware = (req, res, next) => {
  // Check if user has valid cookie
  if (req.cookies.auth === 'authenticated') {
    return next();
  }
  
  // Otherwise use basic auth
  basicAuth({
    users: { 
      [process.env.AUTH_USERNAME]: process.env.AUTH_PASSWORD 
    },
    challenge: true,
    realm: 'Sistem Pangkalan LPG',
    // After successful auth, set cookie
    getResponse: (req, res) => {
      res.cookie('auth', 'authenticated', { maxAge: 24 * 60 * 60 * 1000 }); // 24 hours
    }
  })(req, res, next);
};

// Apply auth middleware to all API routes
app.use('/api', authMiddleware);

// API Routes
app.get('/api/pelanggan', async (req, res) => {
  try {
    const { sheet } = req.query; // Get sheet parameter from query (for manual override)
    const data = await getAllPelanggan(sheet);
    res.json({ success: true, data, currentSheet: sheet });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all available sheets
app.get('/api/sheets', async (req, res) => {
  try {
    const sheets = await getAllSheets();
    res.json({ success: true, data: sheets });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/pelanggan', async (req, res) => {
  try {
    const { nama, nik, domisili } = req.body;
    
    if (!nama || !nik || !domisili) {
      return res.status(400).json({ 
        success: false, 
        error: 'Nama, NIK, dan Domisili harus diisi' 
      });
    }

    if (nik.length !== 16 || !/^\d+$/.test(nik)) {
      return res.status(400).json({ 
        success: false, 
        error: 'NIK harus 16 digit angka' 
      });
    }

    const result = await addPelanggan(nama, nik, domisili);
    res.json({ success: true, data: result, message: 'Pelanggan berhasil ditambahkan!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/pelanggan/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, nik, domisili } = req.body;
    
    if (nik.length !== 16 || !/^\d+$/.test(nik)) {
      return res.status(400).json({ 
        success: false, 
        error: 'NIK harus 16 digit angka' 
      });
    }
    
    const result = await updatePelanggan(id, nama, nik, domisili);
    res.json({ success: true, data: result, message: 'Data berhasil diupdate!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/pelanggan/:id/minggu/:minggu', async (req, res) => {
  try {
    const { id, minggu } = req.params;
    const { checked } = req.body;
    
    if (parseInt(minggu) < 1 || parseInt(minggu) > 5) {
      return res.status(400).json({ 
        success: false, 
        error: 'Minggu harus antara 1-5' 
      });
    }
    
    const result = await updateMingguan(id, minggu, checked);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/pelanggan/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await deletePelanggan(id);
    res.json({ success: true, message: 'Pelanggan berhasil dihapus!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Logout route
app.get('/api/logout', (req, res) => {
  res.clearCookie('auth');
  res.json({ success: true, message: 'Logged out successfully' });
});

// Default route - serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log('🏪 Sistem Pangkalan LPG Siap!' );
  console.log(`🌐 Akses di: http://localhost:${PORT}`);
  console.log(`👤 Username: ${process.env.AUTH_USERNAME}`);
  console.log(`🔑 Password: ${process.env.AUTH_PASSWORD}`);
  console.log('\n📋 Siap mencatat pelanggan!');
});
