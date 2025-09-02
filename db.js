import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool.query(`
  CREATE TABLE IF NOT EXISTS admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    profile VARCHAR(200),
    role ENUM('admin', 'super_admin') NOT NULL DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )
`, (err) => {
  if (err) console.error('Failed to create admin table:', err.message);
  else console.log('Admin table is ready.');
});

pool.query(`
  CREATE TABLE IF NOT EXISTS partner (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(100) NOT NULL,
    website VARCHAR(200) NOT NULL,
    platform VARCHAR(100) NOT NULL,
    affiliate_handle VARCHAR(100) NOT NULL,
    additional_info TEXT,
    password VARCHAR(255),
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    isRegistered BOOLEAN DEFAULT false,
    profileImage TEXT,
    mobilePhone VARCHAR(30) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'partner',
    refernceLink VARCHAR(8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )
`, (err) => {
  if (err) console.error('Failed to create partner table:', err.message);
  else console.log('Partner table is ready.');
});


pool.query(`CREATE TABLE IF NOT EXISTS store (
    id INT AUTO_INCREMENT PRIMARY KEY,
    partner_id INT NOT NULL,
    store_name VARCHAR(150) NOT NULL,
    platform ENUM('shopify', 'bigcommerce', 'custom', 'woocommerce', 'other') NOT NULL,
    earning DECIMAL(10,2) DEFAULT 0.00,     -- Store se kitna commission aa rha hai
    total_value DECIMAL(10,2) DEFAULT 0.00, -- Store ki total kimat (like 500 dollar)
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_store_partner FOREIGN KEY (partner_id) 
        REFERENCES partner(id) ON DELETE CASCADE
)`, (err) => {
  if (err) console.error('Failed to create admin table:', err.message);
  else console.log('Admin table is ready.');
})

export default pool;
