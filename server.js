// Muat variabel lingkungan dari .env jika tersedia
if (typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile();
  } catch (e) {
    // File .env opsional jika sudah didefinisikan di environment
  }
}

const express = require('express');
const authRoutes = require('./routes/auth');
const favoritesRoutes = require('./routes/favorites');

const app = express();

// Body Parser
app.use(express.json());

// CORS Middleware untuk komunikasi Frontend <-> Backend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  return res.status(200).json({
    message: 'Welcome to ZENVY API!',
    status: 'success',
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/favorites', favoritesRoutes);

// Server hanya dijalankan jika file ini dieksekusi langsung
if (require.main === module) {
  const port = process.env.PORT || 5000;

  app.listen(port, () => {
    console.log(`ZENVY API is running on port ${port}`);
  });
}

module.exports = app;
