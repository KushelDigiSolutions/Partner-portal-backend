

import express from 'express';
import pool from './db.js';
import adminRoutes from './routes/admin.js';
import partnerRoutes from './routes/partner.js';
import authRoutes from './routes/auth.js';
import partnerStoreRooutes from './routes/storeRoutes.js'
import storePaymentRoutes from "./routes/storePayment.js";
import playbookRoutes from "./routes/partnerPlaybookRoutes.js"
import refralClent from "./routes/partnerReferralRoutes.js"
import fileUpload from "express-fileupload";
import { uploadToCloudinary } from './utils/cloudnary.js';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: "/tmp/",
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
app.use("/api/playbooks", playbookRoutes);
app.use("/api/refral", refralClent)
app.post("/upload-image", async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({
        status: false,
        message: "No image file uploaded",
      });
    }

    const image = req.files.image;

    // Upload the image to Cloudinary asynchronously
    const details = await uploadToCloudinary(image.tempFilePath);

    // Return response with Cloudinary URL and public_id
    return res.status(200).json({
      status: true,
      data: details?.secure_url,
      public_id: details?.public_id,
    });
  } catch (error) {
    console.error("Error in postImage:", error);
    return res.status(500).json({
      status: false,
      message: "Image upload failed",
      error: error.message,
    });
  }
});


// Check DB connection on startup
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed:', err.message);
  } else {
    console.log('Database connected successfully!');
    connection.release();
  }
  app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
  });
});
