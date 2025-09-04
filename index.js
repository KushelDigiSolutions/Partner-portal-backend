

import express from 'express';
import pool from './db.js';
import adminRoutes from './routes/admin.js';
import partnerRoutes from './routes/partner.js';
import authRoutes from './routes/auth.js';
import partnerStoreRooutes from './routes/storeRoutes.js'
import storePaymentRoutes from "./routes/storePayment.js";
import cors from 'cors';  

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Example route
app.get('/', (req, res) => {
  res.send('Partner Portal Backend is running!');
});


// Import and use admin routes
app.use('/admin', adminRoutes);
app.use('/partner', partnerRoutes);
app.use('/auth', authRoutes);
app.use('/partner-store', partnerStoreRooutes);
app.use("/api/store-payments", storePaymentRoutes);


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
