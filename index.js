

import express from 'express';
import pool from './db.js';
import adminRoutes from './routes/admin.js';
import partnerRoutes from './routes/partner.js';
import authRoutes from './routes/auth.js';
import partnerStoreRooutes from './routes/storeRoutes.js'

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Example route
app.get('/', (req, res) => {
  res.send('Partner Portal Backend is running!');
});


// Import and use admin routes
app.use('/admin', adminRoutes);
app.use('/partner', partnerRoutes);
app.use('/auth', authRoutes);
app.use('/partner-store', partnerStoreRooutes)


// Check DB connection on startup
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed:', err.message);
  } else {
    console.log('Database connected successfully!');
    connection.release();
  }
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
